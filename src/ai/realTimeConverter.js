/**
 * Real-Time Converter - Debounced AI text conversion with streaming and caching
 * Provides responsive user experience with intelligent typing detection
 */

class RealTimeConverter {
  constructor(aiTextConverter) {
    this.aiTextConverter = aiTextConverter;
    
    // Debouncing and timing
    this.debounceTime = 1200; // 1.2 seconds after user stops typing
    this.minConversionLength = 3; // Minimum characters to trigger conversion
    this.debounceTimer = null;
    this.lastConversionTime = 0;
    this.minTimeBetweenConversions = 500; // Minimum 500ms between conversions
    
    // Streaming and progress
    this.isConverting = false;
    this.conversionQueue = [];
    this.progressCallbacks = new Set();
    this.streamingEnabled = true;
    
    // Caching for real-time performance
    this.realtimeCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 500;
    
    // User interaction tracking
    this.typingPatterns = {
      averageTypingSpeed: 0,
      pausePatterns: [],
      completionPatterns: []
    };
    
    // Performance monitoring
    this.performanceMetrics = {
      averageResponseTime: 0,
      totalConversions: 0,
      cacheHitRate: 0,
      userSatisfactionScore: 0
    };
    
    console.log('⚡ Real-Time Converter initialized');
  }

  /**
   * Convert text with intelligent debouncing
   */
  convertWithDebounce(text, options = {}, callbacks = {}) {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Validate input
    if (!text || text.length < this.minConversionLength) {
      if (callbacks.onClear) callbacks.onClear();
      return;
    }

    // Check rate limiting
    const now = Date.now();
    if (now - this.lastConversionTime < this.minTimeBetweenConversions) {
      // Show typing indicator
      if (callbacks.onTyping) callbacks.onTyping();
      
      // Set a shorter debounce for rapid typing
      this.debounceTimer = setTimeout(() => {
        this.executeConversion(text, options, callbacks);
      }, this.debounceTime / 2);
      return;
    }

    // Adaptive debounce time based on text length and typing patterns
    const adaptiveDebounceTime = this.calculateAdaptiveDebounce(text, options);
    
    // Show typing indicator
    if (callbacks.onTyping) callbacks.onTyping();

    // Set debounce timer
    this.debounceTimer = setTimeout(() => {
      this.executeConversion(text, options, callbacks);
    }, adaptiveDebounceTime);
  }

  /**
   * Calculate adaptive debounce time based on context
   */
  calculateAdaptiveDebounce(text, options) {
    let debounceTime = this.debounceTime;
    
    // Shorter debounce for short texts
    if (text.length < 20) {
      debounceTime = Math.max(800, debounceTime * 0.7);
    }
    
    // Longer debounce for complex texts
    if (text.length > 100) {
      debounceTime = Math.min(2000, debounceTime * 1.3);
    }
    
    // Adjust based on typing patterns
    if (this.typingPatterns.averageTypingSpeed > 0) {
      const expectedFinishTime = text.length / this.typingPatterns.averageTypingSpeed * 1000;
      debounceTime = Math.max(debounceTime, expectedFinishTime * 0.3);
    }
    
    // Faster response for high-priority conversions
    if (options.priority === 'high') {
      debounceTime *= 0.6;
    }
    
    return debounceTime;
  }

  /**
   * Execute the actual conversion with caching and streaming
   */
  async executeConversion(text, options, callbacks) {
    if (this.isConverting) {
      // Queue the conversion
      this.conversionQueue.push({ text, options, callbacks });
      return;
    }

    this.isConverting = true;
    this.lastConversionTime = Date.now();
    const conversionStartTime = Date.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(text, options);
      const cachedResult = this.getCachedResult(cacheKey);
      
      if (cachedResult) {
        this.handleConversionSuccess(cachedResult, callbacks, true);
        this.performanceMetrics.cacheHitRate++;
        return;
      }

      // Show conversion in progress
      if (callbacks.onProgress) {
        callbacks.onProgress({ stage: 'analyzing', progress: 0.1 });
      }

      // Start streaming conversion if enabled
      if (this.streamingEnabled && callbacks.onStream) {
        this.startStreamingConversion(text, options, callbacks);
      } else {
        // Standard conversion
        const result = await this.aiTextConverter.convertText(text, options);
        
        // Cache the result
        this.cacheResult(cacheKey, result);
        
        // Handle success
        this.handleConversionSuccess(result, callbacks, false);
      }

      // Update performance metrics
      const responseTime = Date.now() - conversionStartTime;
      this.updatePerformanceMetrics(responseTime);

    } catch (error) {
      this.handleConversionError(error, callbacks);
    } finally {
      this.isConverting = false;
      this.processQueue();
    }
  }

  /**
   * Start streaming conversion with progress updates
   */
  async startStreamingConversion(text, options, callbacks) {
    const stages = [
      { name: 'analyzing', progress: 0.2, message: 'テキストを分析中...' },
      { name: 'processing', progress: 0.5, message: 'AI変換処理中...' },
      { name: 'optimizing', progress: 0.8, message: '結果を最適化中...' },
      { name: 'finalizing', progress: 0.95, message: '変換を完了中...' }
    ];

    // Simulate streaming progress
    for (const stage of stages) {
      if (callbacks.onProgress) {
        callbacks.onProgress(stage);
      }
      
      // Small delay to show progress (would be real streaming in production)
      await this.sleep(100);
    }

    // Execute actual conversion
    const result = await this.aiTextConverter.convertText(text, options);
    
    // Cache the result
    const cacheKey = this.generateCacheKey(text, options);
    this.cacheResult(cacheKey, result);
    
    // Complete streaming
    if (callbacks.onProgress) {
      callbacks.onProgress({ stage: 'complete', progress: 1.0, message: '変換完了!' });
    }
    
    this.handleConversionSuccess(result, callbacks, false);
  }

  /**
   * Handle successful conversion
   */
  handleConversionSuccess(result, callbacks, fromCache) {
    if (callbacks.onSuccess) {
      callbacks.onSuccess({
        ...result,
        fromCache,
        realTime: true,
        timestamp: Date.now()
      });
    }

    // Track user interaction patterns
    this.trackConversionSuccess(result);
  }

  /**
   * Handle conversion error
   */
  handleConversionError(error, callbacks) {
    console.error('Real-time conversion error:', error);
    
    if (callbacks.onError) {
      callbacks.onError({
        error: error.message,
        type: 'conversion_error',
        timestamp: Date.now(),
        canRetry: true
      });
    }

    // Track error for improvement
    this.trackConversionError(error);
  }

  /**
   * Process queued conversions
   */
  async processQueue() {
    if (this.conversionQueue.length === 0) return;

    // Get the most recent conversion request (discard older ones)
    const latestRequest = this.conversionQueue.pop();
    this.conversionQueue = []; // Clear queue

    // Execute the latest request
    await this.executeConversion(
      latestRequest.text,
      latestRequest.options,
      latestRequest.callbacks
    );
  }

  /**
   * Enable/disable streaming mode
   */
  setStreamingMode(enabled) {
    this.streamingEnabled = enabled;
    console.log(`🌊 Streaming mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Adjust debounce timing based on user behavior
   */
  adjustDebounceTime(typingSpeed, pauseDuration) {
    // Learn from user typing patterns
    this.typingPatterns.averageTypingSpeed = 
      (this.typingPatterns.averageTypingSpeed + typingSpeed) / 2;
    
    this.typingPatterns.pausePatterns.push(pauseDuration);
    
    // Keep only recent patterns
    if (this.typingPatterns.pausePatterns.length > 10) {
      this.typingPatterns.pausePatterns.shift();
    }

    // Adjust debounce time based on patterns
    const averagePause = this.typingPatterns.pausePatterns.reduce((a, b) => a + b, 0) / 
                        this.typingPatterns.pausePatterns.length;
    
    if (averagePause > 2000) {
      // User types slowly, can use shorter debounce
      this.debounceTime = Math.max(800, this.debounceTime * 0.9);
    } else if (averagePause < 500) {
      // User types quickly, use longer debounce
      this.debounceTime = Math.min(2000, this.debounceTime * 1.1);
    }
  }

  /**
   * Cache management for real-time performance
   */
  generateCacheKey(text, options) {
    const optionsHash = JSON.stringify({
      level: options.level,
      context: options.context,
      relationship: options.relationship
    });
    return btoa(text + optionsHash).substring(0, 16);
  }

  getCachedResult(cacheKey) {
    const cached = this.realtimeCache.get(cacheKey);
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.realtimeCache.delete(cacheKey);
      return null;
    }
    
    return cached.result;
  }

  cacheResult(cacheKey, result) {
    // Limit cache size
    if (this.realtimeCache.size >= this.maxCacheSize) {
      // Remove oldest entries
      const oldestKey = this.realtimeCache.keys().next().value;
      this.realtimeCache.delete(oldestKey);
    }
    
    this.realtimeCache.set(cacheKey, {
      result: { ...result, cached: true },
      timestamp: Date.now()
    });
  }

  /**
   * Performance monitoring and optimization
   */
  updatePerformanceMetrics(responseTime) {
    this.performanceMetrics.totalConversions++;
    this.performanceMetrics.averageResponseTime = 
      (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalConversions - 1) + responseTime) /
      this.performanceMetrics.totalConversions;
  }

  trackConversionSuccess(result) {
    // Track success patterns for optimization
    if (result.confidence > 0.8) {
      this.performanceMetrics.userSatisfactionScore = 
        Math.min(1.0, this.performanceMetrics.userSatisfactionScore + 0.01);
    }
  }

  trackConversionError(error) {
    // Track errors for improvement
    this.performanceMetrics.userSatisfactionScore = 
      Math.max(0.0, this.performanceMetrics.userSatisfactionScore - 0.05);
  }

  /**
   * Real-time suggestion system
   */
  async getSuggestions(partialText, options = {}) {
    if (partialText.length < 5) return [];

    try {
      // Quick suggestions based on patterns
      const suggestions = [];
      
      // Detect common patterns and suggest improvements
      if (/やん$|やで$/.test(partialText)) {
        suggestions.push({
          type: 'dialect_detection',
          message: '関西弁が検出されました。標準語に変換しますか？',
          confidence: 0.9
        });
      }
      
      if (/アプデ|バグ/.test(partialText)) {
        suggestions.push({
          type: 'technical_terms',
          message: 'IT用語が検出されました。より丁寧な表現に変換しますか？',
          confidence: 0.8
        });
      }
      
      if (partialText.length > 50 && !/です|ます/.test(partialText)) {
        suggestions.push({
          type: 'politeness_suggestion',
          message: '長い文章です。丁寧語の使用をお勧めします。',
          confidence: 0.7
        });
      }
      
      return suggestions;
      
    } catch (error) {
      console.warn('Suggestion generation failed:', error);
      return [];
    }
  }

  /**
   * Batch conversion for multiple texts
   */
  async convertBatch(texts, options = {}, progressCallback = null) {
    const results = [];
    const total = texts.length;
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      
      try {
        const result = await this.aiTextConverter.convertText(text, options);
        results.push(result);
        
        if (progressCallback) {
          progressCallback({
            completed: i + 1,
            total: total,
            progress: (i + 1) / total,
            currentText: text
          });
        }
        
      } catch (error) {
        results.push({
          original: text,
          converted: text,
          error: error.message,
          confidence: 0
        });
      }
      
      // Small delay between conversions to avoid rate limits
      if (i < texts.length - 1) {
        await this.sleep(200);
      }
    }
    
    return {
      results,
      summary: {
        total: total,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        averageConfidence: results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length
      }
    };
  }

  /**
   * Get real-time performance statistics
   */
  getPerformanceStats() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.realtimeCache.size,
      cacheHitRate: this.performanceMetrics.cacheHitRate / Math.max(1, this.performanceMetrics.totalConversions),
      queueLength: this.conversionQueue.length,
      isConverting: this.isConverting,
      debounceTime: this.debounceTime,
      typingPatterns: { ...this.typingPatterns }
    };
  }

  /**
   * Clear all caches and reset state
   */
  reset() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    this.realtimeCache.clear();
    this.conversionQueue = [];
    this.isConverting = false;
    this.progressCallbacks.clear();
    
    console.log('🔄 Real-time converter reset');
  }

  /**
   * Utility methods
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Register progress callback for streaming updates
   */
  onProgress(callback) {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  /**
   * Notify all progress callbacks
   */
  notifyProgress(progressData) {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progressData);
      } catch (error) {
        console.warn('Progress callback error:', error);
      }
    });
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RealTimeConverter };
} else {
  window.RealTimeConverter = RealTimeConverter;
}