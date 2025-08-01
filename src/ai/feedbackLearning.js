/**
 * Feedback Learning System - Learns from user feedback to improve conversion quality
 * Implements continuous learning and model optimization based on user corrections and ratings
 */

class FeedbackLearning {
  constructor() {
    this.feedbackData = new Map();
    this.learningPatterns = new Map();
    this.userPreferences = new Map();
    this.improvementHistory = [];
    
    // Storage keys for persistence
    this.storageKeys = {
      feedback: 'jgc_feedback_data',
      patterns: 'jgc_learning_patterns',
      preferences: 'jgc_user_preferences',
      history: 'jgc_improvement_history'
    };
    
    this.loadPersistedData();
    console.log('📚 Feedback Learning System initialized');
  }

  /**
   * Collect user feedback on conversion quality
   */
  collectFeedback(feedbackData) {
    const {
      originalText,
      convertedText,
      userRating,
      userCorrection,
      context,
      options,
      timestamp = Date.now(),
      feedbackType = 'rating'
    } = feedbackData;

    const feedbackId = this.generateFeedbackId(originalText, convertedText, timestamp);
    
    const feedback = {
      id: feedbackId,
      originalText,
      convertedText,
      userRating,
      userCorrection,
      context,
      options,
      timestamp,
      feedbackType,
      processed: false,
      qualityMetrics: this.calculateFeedbackMetrics(feedbackData)
    };

    this.feedbackData.set(feedbackId, feedback);
    
    // Process feedback immediately for quick learning
    this.processFeedback(feedback);
    
    // Persist data
    this.persistFeedback();
    
    console.log(`📝 Feedback collected: ${feedbackType} rating ${userRating}`);
    
    return feedbackId;
  }

  /**
   * Process individual feedback to extract learning patterns
   */
  processFeedback(feedback) {
    try {
      // Extract learning patterns from feedback
      if (feedback.userRating <= 2) {
        this.extractNegativeFeedbackPatterns(feedback);
      } else if (feedback.userRating >= 4) {
        this.extractPositiveFeedbackPatterns(feedback);
      }

      // Learn from user corrections
      if (feedback.userCorrection) {
        this.extractCorrectionPatterns(feedback);
      }

      // Update user preferences
      this.updateUserPreferences(feedback);

      feedback.processed = true;
      
    } catch (error) {
      console.error('Error processing feedback:', error);
    }
  }

  /**
   * Extract patterns from negative feedback
   */
  extractNegativeFeedbackPatterns(feedback) {
    const { originalText, convertedText, context, options } = feedback;
    
    // Identify problematic patterns
    const problematicPatterns = this.identifyProblematicPatterns(originalText, convertedText);
    
    for (const pattern of problematicPatterns) {
      const patternKey = `negative_${pattern.type}_${pattern.pattern}`;
      
      if (!this.learningPatterns.has(patternKey)) {
        this.learningPatterns.set(patternKey, {
          type: 'negative',
          pattern: pattern.pattern,
          patternType: pattern.type,
          occurrences: 0,
          contexts: [],
          confidence: 0
        });
      }
      
      const existingPattern = this.learningPatterns.get(patternKey);
      existingPattern.occurrences++;
      existingPattern.contexts.push(context);
      existingPattern.confidence = Math.min(0.95, existingPattern.occurrences * 0.1);
      
      console.log(`❌ Learned negative pattern: ${pattern.type} - ${pattern.pattern}`);
    }
  }

  /**
   * Extract patterns from positive feedback
   */
  extractPositiveFeedbackPatterns(feedback) {
    const { originalText, convertedText, context, options } = feedback;
    
    // Identify successful patterns
    const successfulPatterns = this.identifySuccessfulPatterns(originalText, convertedText);
    
    for (const pattern of successfulPatterns) {
      const patternKey = `positive_${pattern.type}_${pattern.pattern}`;
      
      if (!this.learningPatterns.has(patternKey)) {
        this.learningPatterns.set(patternKey, {
          type: 'positive',
          pattern: pattern.pattern,
          patternType: pattern.type,
          occurrences: 0,
          contexts: [],
          confidence: 0
        });
      }
      
      const existingPattern = this.learningPatterns.get(patternKey);
      existingPattern.occurrences++;
      existingPattern.contexts.push(context);
      existingPattern.confidence = Math.min(0.95, existingPattern.occurrences * 0.15);
      
      console.log(`✅ Learned positive pattern: ${pattern.type} - ${pattern.pattern}`);
    }
  }

  /**
   * Extract learning patterns from user corrections
   */
  extractCorrectionPatterns(feedback) {
    const { originalText, convertedText, userCorrection, context } = feedback;
    
    // Analyze the difference between AI output and user correction
    const corrections = this.analyzeCorrectionDifferences(convertedText, userCorrection);
    
    for (const correction of corrections) {
      const correctionKey = `correction_${correction.type}_${correction.from}`;
      
      if (!this.learningPatterns.has(correctionKey)) {
        this.learningPatterns.set(correctionKey, {
          type: 'correction',
          from: correction.from,
          to: correction.to,
          correctionType: correction.type,
          occurrences: 0,
          contexts: [],
          confidence: 0
        });
      }
      
      const existingCorrection = this.learningPatterns.get(correctionKey);
      existingCorrection.occurrences++;
      existingCorrection.contexts.push(context);
      existingCorrection.confidence = Math.min(0.9, existingCorrection.occurrences * 0.2);
      
      console.log(`🔄 Learned correction: ${correction.from} → ${correction.to}`);
    }
  }

  /**
   * Identify problematic patterns in negative feedback
   */
  identifyProblematicPatterns(original, converted) {
    const patterns = [];
    
    // Pattern 1: Excessive politeness
    if (/恐れ入ります.*恐縮.*申し訳/.test(converted)) {
      patterns.push({
        type: 'excessive_politeness',
        pattern: 'multiple_apologies',
        severity: 'high'
      });
    }
    
    // Pattern 2: Unnatural repetition
    const repetitionMatches = converted.match(/(.{3,})\1+/g);
    if (repetitionMatches) {
      patterns.push({
        type: 'unnatural_repetition',
        pattern: repetitionMatches[0],
        severity: 'medium'
      });
    }
    
    // Pattern 3: Incorrect casual-to-formal conversion
    if (/[ぁ-んァ-ヶー]+いただけますでしょうか/.test(converted)) {
      patterns.push({
        type: 'incomplete_conversion',
        pattern: 'casual_formal_mix',
        severity: 'high'
      });
    }
    
    // Pattern 4: Inappropriate length expansion
    const lengthRatio = converted.length / original.length;
    if (lengthRatio > 4) {
      patterns.push({
        type: 'excessive_expansion',
        pattern: 'length_ratio_' + Math.floor(lengthRatio),
        severity: 'medium'
      });
    }
    
    return patterns;
  }

  /**
   * Identify successful patterns in positive feedback
   */
  identifySuccessfulPatterns(original, converted) {
    const patterns = [];
    
    // Pattern 1: Good casual-to-formal conversion
    if (/やん|やで|だべ/.test(original) && /です|ます/.test(converted)) {
      patterns.push({
        type: 'dialect_conversion',
        pattern: 'successful_standardization',
        quality: 'high'
      });
    }
    
    // Pattern 2: Appropriate politeness level
    if (this.hasAppropriatePolitenesss(converted)) {
      patterns.push({
        type: 'politeness_level',
        pattern: 'appropriate_keigo',
        quality: 'high'
      });
    }
    
    // Pattern 3: Natural flow
    if (this.hasNaturalFlow(converted)) {
      patterns.push({
        type: 'sentence_flow',
        pattern: 'natural_transition',
        quality: 'high'
      });
    }
    
    return patterns;
  }

  /**
   * Analyze differences between AI output and user correction
   */
  analyzeCorrectionDifferences(aiOutput, userCorrection) {
    const corrections = [];
    
    // Simple diff analysis (in production, would use more sophisticated diff algorithms)
    const aiWords = aiOutput.split(/\s+/);
    const userWords = userCorrection.split(/\s+/);
    
    // Find word-level substitutions
    const maxLength = Math.max(aiWords.length, userWords.length);
    for (let i = 0; i < maxLength; i++) {
      const aiWord = aiWords[i] || '';
      const userWord = userWords[i] || '';
      
      if (aiWord !== userWord && aiWord && userWord) {
        corrections.push({
          type: 'word_substitution',
          from: aiWord,
          to: userWord,
          position: i
        });
      }
    }
    
    // Find phrase-level patterns
    const phraseDifferences = this.findPhraseDifferences(aiOutput, userCorrection);
    corrections.push(...phraseDifferences);
    
    return corrections;
  }

  /**
   * Find phrase-level differences
   */
  findPhraseDifferences(aiOutput, userCorrection) {
    const differences = [];
    
    // Common phrase corrections
    const phraseCorrections = [
      { from: /いただけますでしょうか/, to: /お願いします/ },
      { from: /恐れ入りますが/, to: /すみませんが/ },
      { from: /よろしくお願いいたします/, to: /よろしくお願いします/ }
    ];
    
    for (const correction of phraseCorrections) {
      if (correction.from.test(aiOutput) && correction.to.test(userCorrection)) {
        differences.push({
          type: 'phrase_correction',
          from: correction.from.source,
          to: correction.to.source
        });
      }
    }
    
    return differences;
  }

  /**
   * Update user preferences based on feedback
   */
  updateUserPreferences(feedback) {
    const userId = 'default'; // In production, would use actual user ID
    
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, {
        preferredLevel: 3,
        preferredStyle: 'balanced',
        avoidPatterns: [],
        favoritePatterns: [],
        contextPreferences: {}
      });
    }
    
    const preferences = this.userPreferences.get(userId);
    
    // Update preferred level based on ratings
    if (feedback.userRating >= 4) {
      const targetLevel = feedback.options.level || 3;
      preferences.preferredLevel = Math.round((preferences.preferredLevel + targetLevel) / 2);
    }
    
    // Update context preferences
    const context = feedback.context || 'general';
    if (!preferences.contextPreferences[context]) {
      preferences.contextPreferences[context] = {
        successfulPatterns: [],
        problematicPatterns: []
      };
    }
    
    if (feedback.userRating <= 2) {
      // Record problematic context usage
      preferences.contextPreferences[context].problematicPatterns.push({
        pattern: 'low_rating',
        timestamp: feedback.timestamp
      });
    } else if (feedback.userRating >= 4) {
      // Record successful context usage
      preferences.contextPreferences[context].successfulPatterns.push({
        pattern: 'high_rating',
        timestamp: feedback.timestamp
      });
    }
  }

  /**
   * Get learning-based conversion suggestions
   */
  getLearningBasedSuggestions(originalText, context, options) {
    const suggestions = [];
    
    // Check for learned negative patterns to avoid
    for (const [patternKey, pattern] of this.learningPatterns.entries()) {
      if (pattern.type === 'negative' && pattern.confidence > 0.5) {
        // Check if this pattern might occur
        if (this.wouldTriggerPattern(originalText, pattern, options)) {
          suggestions.push({
            type: 'avoidance',
            message: `学習データに基づき、「${pattern.pattern}」パターンを避けることをお勧めします`,
            confidence: pattern.confidence,
            pattern: pattern.pattern
          });
        }
      }
    }
    
    // Check for learned positive patterns to encourage
    for (const [patternKey, pattern] of this.learningPatterns.entries()) {
      if (pattern.type === 'positive' && pattern.confidence > 0.7) {
        suggestions.push({
          type: 'enhancement',
          message: `学習データに基づき、「${pattern.pattern}」パターンの使用をお勧めします`,
          confidence: pattern.confidence,
          pattern: pattern.pattern
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Get personalized recommendations based on user history
   */
  getPersonalizedRecommendations(userId = 'default') {
    const preferences = this.userPreferences.get(userId);
    if (!preferences) return [];
    
    const recommendations = [];
    
    // Recommend preferred level
    recommendations.push({
      type: 'level_preference',
      message: `過去の評価に基づき、レベル${preferences.preferredLevel}をお勧めします`,
      value: preferences.preferredLevel
    });
    
    // Context-specific recommendations
    for (const [context, contextPrefs] of Object.entries(preferences.contextPreferences)) {
      if (contextPrefs.successfulPatterns.length > 0) {
        recommendations.push({
          type: 'context_success',
          context: context,
          message: `${context}文脈では高い評価を得ています`,
          confidence: contextPrefs.successfulPatterns.length / 
                     (contextPrefs.successfulPatterns.length + contextPrefs.problematicPatterns.length)
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Generate improvement report
   */
  generateImprovementReport() {
    const totalFeedback = this.feedbackData.size;
    const recentFeedback = Array.from(this.feedbackData.values())
      .filter(f => Date.now() - f.timestamp < 7 * 24 * 60 * 60 * 1000); // Last 7 days
    
    const avgRating = recentFeedback.length > 0 
      ? recentFeedback.reduce((sum, f) => sum + f.userRating, 0) / recentFeedback.length
      : 0;
    
    const learnedPatterns = Array.from(this.learningPatterns.values())
      .filter(p => p.confidence > 0.5);
    
    return {
      totalFeedback,
      recentFeedback: recentFeedback.length,
      averageRating: avgRating,
      learnedPatterns: learnedPatterns.length,
      improvementTrend: this.calculateImprovementTrend(),
      topIssues: this.getTopIssues(),
      topSuccesses: this.getTopSuccesses()
    };
  }

  /**
   * Calculate improvement trend over time
   */
  calculateImprovementTrend() {
    const feedbackHistory = Array.from(this.feedbackData.values())
      .sort((a, b) => a.timestamp - b.timestamp);
    
    if (feedbackHistory.length < 10) return 'insufficient_data';
    
    const early = feedbackHistory.slice(0, Math.floor(feedbackHistory.length / 2));
    const recent = feedbackHistory.slice(Math.floor(feedbackHistory.length / 2));
    
    const earlyAvg = early.reduce((sum, f) => sum + f.userRating, 0) / early.length;
    const recentAvg = recent.reduce((sum, f) => sum + f.userRating, 0) / recent.length;
    
    const improvement = recentAvg - earlyAvg;
    
    if (improvement > 0.3) return 'improving';
    if (improvement < -0.3) return 'declining';
    return 'stable';
  }

  /**
   * Get top issues from feedback
   */
  getTopIssues() {
    const issues = Array.from(this.learningPatterns.values())
      .filter(p => p.type === 'negative')
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5);
    
    return issues.map(issue => ({
      pattern: issue.pattern,
      type: issue.patternType,
      occurrences: issue.occurrences,
      confidence: issue.confidence
    }));
  }

  /**
   * Get top successes from feedback
   */
  getTopSuccesses() {
    const successes = Array.from(this.learningPatterns.values())
      .filter(p => p.type === 'positive')
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5);
    
    return successes.map(success => ({
      pattern: success.pattern,
      type: success.patternType,
      occurrences: success.occurrences,
      confidence: success.confidence
    }));
  }

  /**
   * Utility methods
   */
  generateFeedbackId(originalText, convertedText, timestamp) {
    const content = originalText + convertedText + timestamp;
    
    // Use safe UTF-8 compatible encoding instead of btoa
    try {
      // Convert to UTF-8 bytes then to base64
      const utf8Bytes = new TextEncoder().encode(content);
      const base64String = btoa(String.fromCharCode(...utf8Bytes));
      return base64String.substring(0, 12);
    } catch (error) {
      console.warn('Base64 encoding failed, using hash fallback:', error);
      // Fallback: Simple hash function for Japanese characters
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36).substring(0, 12);
    }
  }

  calculateFeedbackMetrics(feedbackData) {
    return {
      textLength: feedbackData.originalText.length,
      conversionRatio: feedbackData.convertedText.length / feedbackData.originalText.length,
      hasCorrection: !!feedbackData.userCorrection,
      ratingCategory: this.getRatingCategory(feedbackData.userRating)
    };
  }

  getRatingCategory(rating) {
    if (rating >= 4) return 'positive';
    if (rating <= 2) return 'negative';
    return 'neutral';
  }

  wouldTriggerPattern(text, pattern, options) {
    // Simplified pattern matching - would be more sophisticated in production
    return text.includes(pattern.pattern) || 
           pattern.contexts.some(ctx => ctx === options.context);
  }

  hasAppropriatePolitenesss(text) {
    return /いただけ|お願い|恐縮|申し訳/.test(text) && 
           !/恐れ入ります.*恐縮.*申し訳/.test(text);
  }

  hasNaturalFlow(text) {
    return !/です。。+|ます。です/.test(text);
  }

  /**
   * Persistence methods
   */
  persistFeedback() {
    try {
      localStorage.setItem(this.storageKeys.feedback, 
        JSON.stringify(Array.from(this.feedbackData.entries())));
      localStorage.setItem(this.storageKeys.patterns, 
        JSON.stringify(Array.from(this.learningPatterns.entries())));
      localStorage.setItem(this.storageKeys.preferences, 
        JSON.stringify(Array.from(this.userPreferences.entries())));
    } catch (error) {
      console.warn('Failed to persist feedback data:', error);
    }
  }

  loadPersistedData() {
    try {
      const feedbackData = localStorage.getItem(this.storageKeys.feedback);
      if (feedbackData) {
        this.feedbackData = new Map(JSON.parse(feedbackData));
      }
      
      const patternsData = localStorage.getItem(this.storageKeys.patterns);
      if (patternsData) {
        this.learningPatterns = new Map(JSON.parse(patternsData));
      }
      
      const preferencesData = localStorage.getItem(this.storageKeys.preferences);
      if (preferencesData) {
        this.userPreferences = new Map(JSON.parse(preferencesData));
      }
    } catch (error) {
      console.warn('Failed to load persisted feedback data:', error);
    }
  }

  /**
   * Clear all learning data (for testing or reset)
   */
  clearLearningData() {
    this.feedbackData.clear();
    this.learningPatterns.clear();
    this.userPreferences.clear();
    this.improvementHistory = [];
    
    // Clear localStorage
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🗑️ All learning data cleared');
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FeedbackLearning };
} else {
  window.FeedbackLearning = FeedbackLearning;
}