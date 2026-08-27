const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.smtpHost = process.env.SMTP_HOST || '';
    this.smtpPort = process.env.SMTP_PORT || 587;
    this.smtpUser = process.env.SMTP_USER || '';
    this.smtpPass = process.env.SMTP_PASS || '';
    this.fromEmail = process.env.FROM_EMAIL || 'BeyondCGPA Verification <noreply@beyondcgpa.dev>';
  }

  isSmtpConfigured() {
    return Boolean(this.smtpHost && this.smtpUser && this.smtpPass);
  }

  async sendVerificationOTP(toEmail, name, otpCode) {
    if (this.isSmtpConfigured()) {
      try {
        const transporter = nodemailer.createTransport({
          host: this.smtpHost,
          port: Number(this.smtpPort),
          secure: Number(this.smtpPort) === 465,
          auth: {
            user: this.smtpUser,
            pass: this.smtpPass
          }
        });

        const mailOptions = {
          from: this.fromEmail,
          to: toEmail,
          subject: `${otpCode} is your BeyondCGPA Email Verification Code`,
          html: `
            <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; rounded: 16px;">
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

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Verification email delivered to ${toEmail}: ${info.messageId}`);
        return { sent: true, method: 'smtp' };
      } catch (err) {
        console.error('SMTP Delivery error, falling back to simulated dispatch:', err.message);
      }
    }

    // Local dev notice & logging
    console.log(`\n=================================================`);
    console.log(`📧 [EMAIL VERIFICATION DISPATCHED]`);
    console.log(`To: ${toEmail} (${name})`);
    console.log(`Verification Code: >> ${otpCode} << (Valid for 15 mins)`);
    console.log(`=================================================\n`);

    return {
      sent: true,
      method: 'dev_dispatch',
      previewOtp: process.env.NODE_ENV === 'production' ? null : otpCode
    };
  }
}

module.exports = new EmailService();
