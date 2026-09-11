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
    const model = this.getModel();

    try {
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.sender === 'user' ? 'user' : m.sender === 'assistant' ? 'assistant' : 'system',
          content: m.text
        }))
      ];

      const response = await axios.post(
        this.apiUrl,
        {
          model: model,
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

      return reply;
    } catch (error) {
      console.error('NVIDIA Provider Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new NvidiaProvider();
