const axios = require('axios');
const { config } = require('../config/env');

class EmailService {
  constructor() {
    this.apiUrl = 'https://api.resend.com/emails';
  }

  isConfigured() {
    return Boolean(config.RESEND_API_KEY);
  }

  async sendVerificationOTP(toEmail, name, otpCode) {
    // 1. Production delivery via Resend API
    if (this.isConfigured()) {
      try {
        const fromEmail = config.EMAIL_FROM || 'BeyondCGPA <onboarding@resend.dev>';
        const payload = {
          from: fromEmail,
          to: [toEmail],
          subject: `${otpCode} is your BeyondCGPA Email Verification Code`,
          html: `
            <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #0b172a; margin: 0; font-size: 24px; font-weight: 800;">Beyond<span style="color: #12b8a6;">CGPA</span></h2>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Career Companion for Engineering Students</p>
              </div>
              <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
                <p style="color: #0b172a; font-size: 14px; margin: 0 0 12px;">Hi <strong>${name}</strong>, here is your 6-digit verification code to complete your signup:</p>
                <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #087f73; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px dashed #12b8a6; display: inline-block;">
                  ${otpCode}
                </div>
                <p style="color: #64748b; font-size: 12px; margin: 12px 0 0;">This code is valid for 15 minutes. Do not share this with anyone.</p>
              </div>
              <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px;">
                © ${new Date().getFullYear()} BeyondCGPA. Adaptive career intelligence for engineering students.
              </p>
            </div>
          `
        };

        const response = await axios.post(this.apiUrl, payload, {
          headers: {
            Authorization: `Bearer ${config.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        console.log(`✉️ Resend verification email delivered to ${toEmail}: ID ${response.data?.id}`);
        return { sent: true, method: 'resend', id: response.data?.id };
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        console.error(`❌ Resend API delivery error to ${toEmail}:`, errMsg);
        return { sent: false, method: 'resend', error: errMsg };
      }
    }

    // 2. Production handling when key is missing
    if (config.NODE_ENV === 'production') {
      console.error('❌ RESEND_API_KEY is not configured in production environment. A real email provider is required.');
      return {
        sent: false,
        method: 'unconfigured',
        error: 'Email provider is not configured on the production server (RESEND_API_KEY missing).'
      };
    }

    // 3. Local development console logging with instant review token
    console.log(`\n=================================================`);
    console.log(`📧 [LOCAL DEV EMAIL VERIFICATION DISPATCHED]`);
    console.log(`To: ${toEmail} (${name})`);
    console.log(`Verification Code: >> ${otpCode} << (Valid for 15 mins)`);
    console.log(`Note: Set RESEND_API_KEY in server/.env to dispatch real emails`);
    console.log(`=================================================\n`);

    return {
      sent: true,
      method: 'dev_dispatch',
      previewOtp: config.NODE_ENV === 'production' ? null : otpCode
    };
  }

  /**
   * Dispatch personalized opportunity alert to student via Resend API
   */
  async sendOpportunityAlert(userEmail, userName, opportunity, matchScore, matchReasons = []) {
    const fromEmail = config.EMAIL_FROM || 'BeyondCGPA <onboarding@resend.dev>';
    const reasonsList = (matchReasons || []).map(r => `<li style="margin-bottom: 6px; color: #334155;">${r}</li>`).join('');
    const clientUrl = config.CLIENT_URL || 'https://beyondcgpa.vercel.app';
    const applyUrl = opportunity.applyUrl || `${clientUrl}/opportunities`;

    // 1. Production delivery via Resend API
    if (this.isConfigured()) {
      try {
        const payload = {
          from: fromEmail,
          to: [userEmail],
          subject: `🎯 [${matchScore}% Match] ${opportunity.company} is hiring: ${opportunity.title}`,
          html: `
            <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #0b172a; margin: 0; font-size: 24px; font-weight: 800;">Beyond<span style="color: #12b8a6;">CGPA</span></h2>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">CIE Opportunity Alert Engine</p>
              </div>

              <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                <div style="margin-bottom: 12px;">
                  <span style="background: #ccfbf1; color: #0f766e; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${matchScore}% CIE Match
                  </span>
                  <h3 style="color: #0b172a; font-size: 18px; font-weight: 700; margin: 8px 0 4px;">${opportunity.title}</h3>
                  <p style="color: #475569; font-size: 14px; margin: 0; font-weight: 600;">${opportunity.company} • ${opportunity.location} (${opportunity.workplaceType})</p>
                </div>

                <div style="margin: 14px 0; padding: 10px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
                  <strong>Type:</strong> ${opportunity.type} &nbsp;|&nbsp; <strong>Compensation:</strong> ${opportunity.salaryRange || 'Competitive'}
                </div>

                <p style="color: #0b172a; font-size: 13px; font-weight: 700; margin: 14px 0 6px;">Why CIE Matched This For You:</p>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px;">
                  ${reasonsList}
                </ul>
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${applyUrl}" style="background: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block;">
                  View & Apply Now →
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                You received this alert because of your verified career preferences on BeyondCGPA.<br/>
                © ${new Date().getFullYear()} BeyondCGPA. Adaptive career intelligence.
              </p>
            </div>
          `
        };

        const response = await axios.post(this.apiUrl, payload, {
          headers: {
            Authorization: `Bearer ${config.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        console.log(`✉️ Resend opportunity alert delivered to ${userEmail}: ID ${response.data?.id}`);
        return { sent: true, method: 'resend', id: response.data?.id };
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        console.error(`❌ Resend opportunity alert error to ${userEmail}:`, errMsg);
        return { sent: false, method: 'resend', error: errMsg };
      }
    }

    // 2. Production handling when key is missing
    if (config.NODE_ENV === 'production') {
      console.error('❌ RESEND_API_KEY is not configured in production environment. Opportunity alert cannot be delivered.');
      return {
        sent: false,
        method: 'unconfigured',
        error: 'Email provider is not configured on the production server (RESEND_API_KEY missing).'
      };
    }

    // 3. Local development console logging
    console.log(`\n=================================================`);
    console.log(`📧 [LOCAL DEV OPPORTUNITY ALERT DISPATCHED]`);
    console.log(`To: ${userEmail} (${userName})`);
    console.log(`Match: [${matchScore}%] ${opportunity.title} at ${opportunity.company}`);
    console.log(`Reasons: ${(matchReasons || []).join(' | ')}`);
    console.log(`Apply URL: ${applyUrl}`);
    console.log(`=================================================\n`);

    return {
      sent: true,
      method: 'dev_dispatch'
    };
  }
}

module.exports = new EmailService();
