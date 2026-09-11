const axios = require('axios');
const { config } = require('../../config/env');

class NvidiaProvider {
  constructor() {
    this.apiKey = config.NVIDIA_API_KEY;
    this.apiUrl = config.NVIDIA_API_URL;
    this.model = config.AI_MODEL;
  }

  getApiKey() {
    return process.env.NVIDIA_API_KEY || this.apiKey || config.NVIDIA_API_KEY || '';
  }

  getModel() {
    return process.env.AI_MODEL || this.model || config.AI_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct';
  }

  isConfigured() {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 0);
  }

  async generateChatResponse(systemPrompt, messages) {
    if (!this.isConfigured()) {
      throw new Error('NVIDIA_API_KEY is not configured');
    }

    const apiKey = this.getApiKey();
    const configuredModel = this.getModel();

    // Universal models on NVIDIA NIM free developer tier
    const candidateModels = Array.from(new Set([
      configuredModel,
      'mistralai/mistral-7b-instruct-v0.3',
      'meta/llama-3.2-11b-vision-instruct',
      'ibm/granite-3.0-8b-instruct'
    ]));

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.sender === 'user' ? 'user' : m.sender === 'assistant' ? 'assistant' : 'system',
        content: m.text
      }))
    ];

    let lastError = null;

    for (const modelToTry of candidateModels) {
      try {
        const response = await axios.post(
          this.apiUrl,
          {
            model: modelToTry,
            messages: formattedMessages,
            temperature: 0.6,
            top_p: 0.7,
            max_tokens: 1024
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        );

        const reply = response.data?.choices?.[0]?.message?.content;
        if (!reply) {
          throw new Error('Empty response received from NVIDIA API');
        }

        this.model = modelToTry;
        return reply;
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        const detail = error.response?.data?.detail || error.response?.data?.title || error.message;

        // If the specific model is not entitled to this account (404) or retired (410), try next candidate
        if (status === 404 || status === 410) {
          console.warn(`NVIDIA model '${modelToTry}' unavailable for account (${status}: ${detail}). Trying fallback model...`);
          continue;
        }

        console.error('NVIDIA Provider Error:', error.response?.data || error.message);
        throw error;
      }
    }

    console.error('All candidate NVIDIA models failed:', lastError.response?.data || lastError.message);
    throw lastError;
  }
}

module.exports = new NvidiaProvider();
