/**
 * LLM Provider - Multi-provider LLM integration for natural text conversion
 * Supports Anthropic Claude, OpenAI GPT, Google Gemini, and local models
 */

class LLMProvider {
  constructor() {
    this.providers = {
      anthropic: new AnthropicProvider(),
      openai: new OpenAIProvider(), 
      gemini: new GeminiProvider(),
      local: new LocalLLMProvider()
    };
    
    // Provider priority for fallback
    this.fallbackOrder = ['anthropic', 'openai', 'gemini', 'local'];
    this.activeProvider = this.detectBestProvider();
    
    // Rate limiting and error handling
    this.rateLimits = new Map();
    this.errorCounts = new Map();
    this.maxRetries = 3;
  }

  /**
   * Detect the best available provider based on API keys and availability
   */
  detectBestProvider() {
    for (const provider of this.fallbackOrder) {
      if (this.providers[provider].isAvailable()) {
        console.log(`🤖 Using ${provider} as primary LLM provider`);
        return provider;
      }
    }
    
    console.warn('⚠️ No LLM providers available, using fallback mode');
    return null;
  }

  /**
   * Generate text using the active provider with fallback support
   */
  async generate(prompt, options = {}) {
    const startTime = Date.now();
    
    try {
      // Try primary provider
      if (this.activeProvider && !this.isRateLimited(this.activeProvider)) {
        const result = await this.providers[this.activeProvider].complete(prompt, options);
        this.recordSuccess(this.activeProvider, Date.now() - startTime);
        return result;
      }
      
      // Try fallback providers
      for (const providerName of this.fallbackOrder) {
        if (providerName === this.activeProvider) continue;
        
        try {
          if (!this.isRateLimited(providerName)) {
            const result = await this.providers[providerName].complete(prompt, options);
            this.recordSuccess(providerName, Date.now() - startTime);
            return result;
          }
        } catch (error) {
          this.recordError(providerName, error);
          continue;
        }
      }
      
      throw new Error('All LLM providers failed');
      
    } catch (error) {
      console.error('LLM generation failed:', error);
      return this.fallbackResponse(prompt, options);
    }
  }

  /**
   * Check if provider is rate limited
   */
  isRateLimited(providerName) {
    const rateLimit = this.rateLimits.get(providerName);
    if (!rateLimit) return false;
    
    return Date.now() < rateLimit.resetTime;
  }

  /**
   * Record successful API call
   */
  recordSuccess(providerName, responseTime) {
    this.errorCounts.delete(providerName);
    console.log(`✅ ${providerName} response in ${responseTime}ms`);
  }

  /**
   * Record API error and implement backoff
   */
  recordError(providerName, error) {
    const errorCount = (this.errorCounts.get(providerName) || 0) + 1;
    this.errorCounts.set(providerName, errorCount);
    
    // Implement exponential backoff
    if (errorCount >= 3) {
      const backoffTime = Math.min(300000, Math.pow(2, errorCount) * 1000); // Max 5 minutes
      this.rateLimits.set(providerName, {
        resetTime: Date.now() + backoffTime
      });
      console.warn(`⏳ ${providerName} rate limited for ${backoffTime/1000}s due to errors`);
    }
  }

  /**
   * Fallback response when all providers fail
   */
  fallbackResponse(prompt, options) {
    console.warn('🔄 Using rule-based fallback conversion');
    
    // Extract the text to convert from the prompt
    const textMatch = prompt.match(/"([^"]+)"/);
    const originalText = textMatch ? textMatch[1] : '';
    
    // Simple rule-based conversion as ultimate fallback
    return {
      text: this.simpleRuleBasedConversion(originalText, options.level || 2),
      provider: 'fallback',
      confidence: 0.3,
      reasoning: 'All LLM providers unavailable, used rule-based fallback'
    };
  }

  /**
   * Simple rule-based conversion for fallback
   */
  simpleRuleBasedConversion(text, level) {
    // Clean up casual expressions
    let converted = text
      .replace(/やん$|やで$|やねん$/g, 'です')
      .replace(/だべ$|だっぺ$/g, 'です')
      .replace(/じゃん$/g, 'ですね')
      .replace(/アプデ/g, 'アップデート')
      .replace(/バグ/g, '不具合')
      .replace(/やって/g, 'お願いします');

    // Add appropriate politeness based on level
    switch (level) {
      case 1:
        return converted.endsWith('です') ? converted : converted + 'です';
      case 2:
        return 'お疲れ様です。' + converted + (converted.endsWith('です') ? '' : 'です') + '。';
      case 3:
        return 'いつもお世話になっております。' + converted + 'どうぞよろしくお願いいたします。';
      default:
        return converted;
    }
  }

  /**
   * Get provider status and statistics
   */
  getProviderStatus() {
    const status = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      status[name] = {
        available: provider.isAvailable(),
        rateLimited: this.isRateLimited(name),
        errorCount: this.errorCounts.get(name) || 0,
        active: name === this.activeProvider
      };
    }
    
    return status;
  }
}

/**
 * Anthropic Claude Provider
 */
class AnthropicProvider {
  constructor() {
    this.apiKey = this.getApiKey();
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-haiku-20240307'; // Fast, cost-effective model
  }

  getApiKey() {
    // Try multiple sources for API key
    return process.env.ANTHROPIC_API_KEY || 
           localStorage.getItem('anthropic_api_key') ||
           null;
  }

  isAvailable() {
    return !!this.apiKey && typeof fetch !== 'undefined';
  }

  async complete(prompt, options = {}) {
    if (!this.apiKey) throw new Error('Anthropic API key not available');

    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens || 150,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.content[0].text.trim(),
      provider: 'anthropic',
      model: this.model,
      confidence: 0.9,
      tokensUsed: data.usage?.output_tokens || 0
    };
  }
}

/**
 * OpenAI GPT Provider
 */
class OpenAIProvider {
  constructor() {
    this.apiKey = this.getApiKey();
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo'; // Fast and cost-effective
  }

  getApiKey() {
    return process.env.OPENAI_API_KEY || 
           localStorage.getItem('openai_api_key') ||
           null;
  }

  isAvailable() {
    return !!this.apiKey && typeof fetch !== 'undefined';
  }

  async complete(prompt, options = {}) {
    if (!this.apiKey) throw new Error('OpenAI API key not available');

    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user', 
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 150,
        temperature: options.temperature || 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content.trim(),
      provider: 'openai',
      model: this.model,
      confidence: 0.85,
      tokensUsed: data.usage?.completion_tokens || 0
    };
  }
}

/**
 * Google Gemini Provider
 */
class GeminiProvider {
  constructor() {
    this.apiKey = this.getApiKey();
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.model = 'gemini-pro';
  }

  getApiKey() {
    return process.env.GEMINI_API_KEY || 
           localStorage.getItem('gemini_api_key') ||
           null;
  }

  isAvailable() {
    return !!this.apiKey && typeof fetch !== 'undefined';
  }

  async complete(prompt, options = {}) {
    if (!this.apiKey) throw new Error('Gemini API key not available');

    const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature || 0.3,
          maxOutputTokens: options.maxTokens || 150
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.candidates[0].content.parts[0].text.trim(),
      provider: 'gemini', 
      model: this.model,
      confidence: 0.8,
      tokensUsed: data.usageMetadata?.candidatesTokenCount || 0
    };
  }
}

/**
 * Local LLM Provider (Ollama support)
 */
class LocalLLMProvider {
  constructor() {
    this.baseURL = 'http://localhost:11434/api/generate';
    this.model = 'llama3.1:8b-instruct-q4_0';
  }

  isAvailable() {
    // Check if local LLM server is running
    return this.checkLocalServer();
  }

  async checkLocalServer() {
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async complete(prompt, options = {}) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.3,
          num_predict: options.maxTokens || 150
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Local LLM error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.response.trim(),
      provider: 'local',
      model: this.model,
      confidence: 0.75,
      tokensUsed: data.eval_count || 0
    };
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LLMProvider, AnthropicProvider, OpenAIProvider, GeminiProvider, LocalLLMProvider };
} else {
  window.LLMProvider = LLMProvider;
  window.AnthropicProvider = AnthropicProvider;
  window.OpenAIProvider = OpenAIProvider;
  window.GeminiProvider = GeminiProvider;
  window.LocalLLMProvider = LocalLLMProvider;
}