/**
 * AI Text Converter - Advanced Japanese text conversion using LLM
 * Natural language generation with context awareness and quality optimization
 */

class AITextConverter {
  constructor() {
    this.llmProvider = new LLMProvider();
    this.promptEngineer = new PromptEngineer();
    this.qualityAssessment = new QualityAssessment();
    this.feedbackLearning = new FeedbackLearning();
    
    // Performance optimization
    this.cache = new Map();
    this.cacheMaxSize = 1000;
    this.cacheMaxAge = 30 * 60 * 1000; // 30 minutes
    
    // Rate limiting for API calls
    this.rateLimitQueue = [];
    this.maxConcurrentRequests = 3;
    this.currentRequests = 0;
    
    console.log('🤖 AI Text Converter initialized');
  }

  /**
   * Convert text using AI with advanced context analysis
   */
  async convertText(originalText, options = {}) {
    const startTime = Date.now();
    const conversionId = this.generateConversionId(originalText, options);
    
    try {
      // Check cache first
      const cachedResult = this.getCachedResult(conversionId);
      if (cachedResult) {
        console.log('⚡ Using cached conversion result');
        return {
          ...cachedResult,
          cached: true,
          processingTime: Date.now() - startTime
        };
      }

      // Prepare conversion options with defaults
      const conversionOptions = this.prepareConversionOptions(originalText, options);
      
      // Generate optimized prompt
      const { prompt, metadata } = this.promptEngineer.buildConversionPrompt(
        originalText, 
        conversionOptions
      );

      // Generate text using LLM with rate limiting
      const llmResponse = await this.generateWithRateLimit(prompt, {
        maxTokens: 200,
        temperature: 0.3,
        timeout: 15000 // 15 second timeout
      });

      // Post-process and validate the result
      const processedResult = await this.postProcessResult(
        originalText,
        llmResponse,
        conversionOptions,
        metadata
      );

      // Cache the result
      this.cacheResult(conversionId, processedResult);

      // Record performance metrics
      this.recordPerformanceMetrics(conversionId, {
        processingTime: Date.now() - startTime,
        tokensUsed: llmResponse.tokensUsed,
        provider: llmResponse.provider,
        confidence: processedResult.confidence
      });

      return processedResult;

    } catch (error) {
      console.error('AI conversion failed:', error);
      return this.handleConversionError(originalText, options, error, startTime);
    }
  }

  /**
   * Prepare conversion options with intelligent defaults
   */
  prepareConversionOptions(text, options) {
    // Auto-detect context if not provided
    const autoDetectedContext = this.autoDetectContext(text);
    
    return {
      level: options.level || this.recommendPoliteLevel(text, autoDetectedContext),
      context: options.context || autoDetectedContext.situation,
      relationship: options.relationship || autoDetectedContext.relationship,
      urgency: options.urgency || autoDetectedContext.urgency,
      formality: options.formality || autoDetectedContext.formality,
      includeEmoji: options.includeEmoji !== false && (options.level >= 4),
      preserveIntent: options.preserveIntent !== false,
      enhanceNaturalness: options.enhanceNaturalness !== false
    };
  }

  /**
   * Auto-detect context from text
   */
  autoDetectContext(text) {
    const analysis = {
      situation: 'business', // default
      relationship: 'colleague', // default
      urgency: 'normal', // default
      formality: 'standard' // default
    };

    // Detect situation
    if (/会議|資料|企画|プロジェクト|売上|予算|契約/.test(text)) {
      analysis.situation = 'business';
    } else if (/システム|アプリ|サーバー|バグ|コード|API/.test(text)) {
      analysis.situation = 'technical';
    } else if (/飲み|ランチ|休憩|趣味|映画|旅行/.test(text)) {
      analysis.situation = 'casual';
    }

    // Detect relationship
    if (/部長|課長|社長|先輩|上司/.test(text) || /恐れ入り|申し訳|失礼/.test(text)) {
      analysis.relationship = 'superior';
    } else if (/お客|クライアント|ご利用|サービス/.test(text)) {
      analysis.relationship = 'client';
    } else if (/後輩|新人/.test(text)) {
      analysis.relationship = 'subordinate';
    }

    // Detect urgency
    if (/急|緊急|至急|今すぐ|早く|ヤバい|マジで/.test(text)) {
      analysis.urgency = 'urgent';
    } else if (/ゆっくり|のんびり|後で|今度|そのうち/.test(text)) {
      analysis.urgency = 'low';
    }

    // Detect formality
    if (/です|ます|ございます|いたします/.test(text)) {
      analysis.formality = 'formal';
    } else if (/だよ|だね|じゃん|やつ/.test(text)) {
      analysis.formality = 'casual';
    }

    return analysis;
  }

  /**
   * Recommend appropriate politeness level
   */
  recommendPoliteLevel(text, context) {
    let level = 2; // default

    // Increase level based on relationship
    if (context.relationship === 'superior') level = Math.max(level, 3);
    if (context.relationship === 'client') level = Math.max(level, 3);

    // Increase level based on situation
    if (context.situation === 'business') level = Math.max(level, 2);
    if (context.situation === 'formal') level = Math.max(level, 3);

    // Increase level based on urgency (counterintuitive but more polite)
    if (context.urgency === 'urgent') level = Math.max(level, 3);

    // Adjust based on current formality
    if (context.formality === 'casual' && level < 3) level += 1;
    if (context.formality === 'formal') level = Math.max(level, 3);

    return Math.min(5, level); // Cap at 5
  }

  /**
   * Generate text with rate limiting
   */
  async generateWithRateLimit(prompt, options) {
    return new Promise((resolve, reject) => {
      this.rateLimitQueue.push({ prompt, options, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process rate limit queue
   */
  async processQueue() {
    if (this.currentRequests >= this.maxConcurrentRequests || this.rateLimitQueue.length === 0) {
      return;
    }

    this.currentRequests++;
    const { prompt, options, resolve, reject } = this.rateLimitQueue.shift();

    try {
      const result = await this.llmProvider.generate(prompt, options);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.currentRequests--;
      // Process next item in queue
      setTimeout(() => this.processQueue(), 100);
    }
  }

  /**
   * Post-process LLM result for quality and consistency
   */
  async postProcessResult(originalText, llmResponse, options, metadata) {
    let convertedText = llmResponse.text;

    // Clean up common LLM artifacts
    convertedText = this.cleanupLLMOutput(convertedText);

    // Validate and enhance the result
    const validation = await this.validateConversion(originalText, convertedText, options);
    
    if (!validation.isValid) {
      console.warn('LLM output validation failed, applying corrections');
      convertedText = this.applyValidationCorrections(convertedText, validation);
    }

    // Assess quality
    const qualityScore = await this.qualityAssessment.assessConversion(
      originalText,
      convertedText,
      options
    );

    // Generate suggestions
    const suggestions = this.generateSuggestions(originalText, convertedText, options, qualityScore);

    return {
      original: originalText,
      converted: convertedText,
      options: options,
      provider: llmResponse.provider,
      model: llmResponse.model,
      confidence: this.calculateConfidence(llmResponse, qualityScore, validation),
      quality: qualityScore,
      suggestions: suggestions,
      analysis: {
        tokenUsage: llmResponse.tokensUsed,
        processingTime: 0, // Will be set by caller
        promptTokens: metadata.estimatedTokens,
        textAnalysis: metadata.textAnalysis
      },
      metadata: {
        timestamp: new Date().toISOString(),
        engine: 'ai-v3.0',
        conversionId: this.generateConversionId(originalText, options)
      }
    };
  }

  /**
   * Clean up common LLM output artifacts
   */
  cleanupLLMOutput(text) {
    return text
      .replace(/^変換結果:\s*/, '') // Remove prefix
      .replace(/^["「『]|["」』]$/g, '') // Remove quotes
      .replace(/\n+/g, ' ') // Remove line breaks
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Validate conversion quality and consistency
   */
  async validateConversion(original, converted, options) {
    const validation = {
      isValid: true,
      issues: [],
      corrections: []
    };

    // Check length (shouldn't be too different)
    const lengthRatio = converted.length / original.length;
    if (lengthRatio > 3 || lengthRatio < 0.5) {
      validation.issues.push('length_anomaly');
      validation.isValid = false;
    }

    // Check for appropriate politeness level
    const hasProperPoliteness = this.checkPolitenessLevel(converted, options.level);
    if (!hasProperPoliteness) {
      validation.issues.push('inadequate_politeness');
      validation.corrections.push('adjust_politeness_level');
    }

    // Check for emoji usage
    if (options.includeEmoji && options.level >= 4 && !/[😀-🙏]/.test(converted)) {
      validation.issues.push('missing_emoji');
      validation.corrections.push('add_appropriate_emoji');
    }

    // Check for over-polite artifacts
    if (this.isOverPolite(converted)) {
      validation.issues.push('over_polite');
      validation.corrections.push('reduce_excessive_politeness');
    }

    return validation;
  }

  /**
   * Check if text has appropriate politeness level
   */
  checkPolitenessLevel(text, expectedLevel) {
    const politenessMarkers = {
      1: /です|ます/,
      2: /いただけ|お願い|恐縮|すみません/,
      3: /いただけます|恐れ入り|申し訳|よろしく/,
      4: /いただけますでしょうか|恐縮です|[😀-🙏]/,
      5: /申し上げ|いたします|ございます|恐縮に存じ/
    };

    const expectedPattern = politenessMarkers[expectedLevel];
    return expectedPattern ? expectedPattern.test(text) : true;
  }

  /**
   * Check if text is overly polite (common LLM issue)
   */
  isOverPolite(text) {
    const overPolitePatterns = [
      /恐れ入ります.*恐縮です.*申し訳/, // Multiple apologies
      /いただけますでしょうか.*お願いします.*よろしく/, // Excessive requests
      /ございます.*でございます.*いたします/ // Excessive keigo
    ];

    return overPolitePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Apply validation corrections
   */
  applyValidationCorrections(text, validation) {
    let corrected = text;

    for (const correction of validation.corrections) {
      switch (correction) {
        case 'adjust_politeness_level':
          corrected = this.adjustPolitenessLevel(corrected);
          break;
        case 'add_appropriate_emoji':
          corrected = this.addAppropriateEmoji(corrected);
          break;
        case 'reduce_excessive_politeness':
          corrected = this.reduceExcessivePoliteness(corrected);
          break;
      }
    }

    return corrected;
  }

  /**
   * Calculate overall confidence score
   */
  calculateConfidence(llmResponse, qualityScore, validation) {
    let confidence = llmResponse.confidence || 0.8;
    
    // Adjust based on quality
    confidence *= qualityScore.overall;
    
    // Reduce if validation failed
    if (!validation.isValid) {
      confidence *= 0.8;
    }
    
    // Adjust based on provider reliability
    const providerReliability = {
      'anthropic': 0.95,
      'openai': 0.9,
      'gemini': 0.85,
      'local': 0.75,
      'fallback': 0.3
    };
    
    confidence *= (providerReliability[llmResponse.provider] || 0.8);
    
    return Math.min(1.0, Math.max(0.1, confidence));
  }

  /**
   * Generate conversion suggestions
   */
  generateSuggestions(original, converted, options, qualityScore) {
    const suggestions = [];

    // Quality-based suggestions
    if (qualityScore.naturalness < 0.7) {
      suggestions.push({
        type: 'naturalness',
        message: '表現をより自然にできる可能性があります',
        priority: 'medium'
      });
    }

    if (qualityScore.intentPreservation < 0.8) {
      suggestions.push({
        type: 'intent',
        message: '元の意図が十分に保持されていない可能性があります',
        priority: 'high'
      });
    }

    // Context-based suggestions
    if (options.level < 3 && options.relationship === 'superior') {
      suggestions.push({
        type: 'level',
        message: '上司向けの場合、より丁寧なレベルをお勧めします',
        priority: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * Generate unique conversion ID for caching
   */
  generateConversionId(text, options) {
    const optionsString = JSON.stringify(options);
    return btoa(text + optionsString).substring(0, 16);
  }

  /**
   * Cache management
   */
  getCachedResult(conversionId) {
    const cached = this.cache.get(conversionId);
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.cacheMaxAge) {
      this.cache.delete(conversionId);
      return null;
    }
    
    return cached.result;
  }

  cacheResult(conversionId, result) {
    // Clean old cache entries if needed
    if (this.cache.size >= this.cacheMaxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(conversionId, {
      result: result,
      timestamp: Date.now()
    });
  }

  /**
   * Handle conversion errors with graceful degradation
   */
  handleConversionError(originalText, options, error, startTime) {
    console.error('AI conversion error:', error.message);
    
    // Use rule-based fallback
    const fallbackResult = this.llmProvider.fallbackResponse(
      `Convert: "${originalText}"`,
      options
    );

    return {
      original: originalText,
      converted: fallbackResult.text,
      provider: 'fallback',
      confidence: 0.3,
      error: error.message,
      suggestions: [
        {
          type: 'error',
          message: 'AI変換でエラーが発生しました。ルールベース変換を使用しています。',
          priority: 'high'
        }
      ],
      analysis: {
        processingTime: Date.now() - startTime,
        tokenUsage: 0
      },
      metadata: {
        timestamp: new Date().toISOString(),
        engine: 'fallback',
        conversionId: this.generateConversionId(originalText, options)
      }
    };
  }

  /**
   * Record performance metrics for optimization
   */
  recordPerformanceMetrics(conversionId, metrics) {
    // Store metrics for analysis and optimization
    this.promptEngineer.recordPromptPerformance(conversionId, metrics);
  }

  /**
   * Get conversion statistics
   */
  getConversionStats() {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: this.calculateCacheHitRate(),
      providerStatus: this.llmProvider.getProviderStatus(),
      queueLength: this.rateLimitQueue.length,
      currentRequests: this.currentRequests
    };
  }

  /**
   * Calculate cache hit rate
   */
  calculateCacheHitRate() {
    // This would need to be tracked over time
    return 0.0; // Placeholder
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AITextConverter };
} else {
  window.AITextConverter = AITextConverter;
}