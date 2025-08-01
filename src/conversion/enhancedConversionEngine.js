/**
 * Enhanced Conversion Engine - Japanese Gentle Converter
 * Intelligent Japanese text conversion with context awareness and natural language generation
 */

const ContextAnalyzer = require('../converters/contextAnalyzer');
const WordConverter = require('../converters/wordConverter');
const SentenceGenerator = require('../converters/sentenceGenerator');

class EnhancedConversionEngine {
  constructor() {
    this.contextAnalyzer = new ContextAnalyzer();
    this.wordConverter = new WordConverter();
    this.sentenceGenerator = new SentenceGenerator();
    
    this.conversionHistory = [];
    this.userPreferences = this.loadUserPreferences();
  }

  /**
   * Main conversion method - transforms text with intelligent context analysis
   */
  async convertText(originalText, options = {}) {
    const startTime = Date.now();
    
    try {
      // Step 1: Analyze context
      const context = this.contextAnalyzer.analyzeContext(originalText);
      
      // Step 2: Determine target politeness level
      const targetLevel = this.determineTargetLevel(context, options);
      
      // Step 3: Generate multiple conversion approaches
      const conversions = await this.generateConversions(originalText, context, targetLevel);
      
      // Step 4: Select best conversion or provide options
      const selectedConversion = this.selectBestConversion(conversions, context, options);
      
      // Step 5: Generate additional suggestions and variations
      const suggestions = this.generateSuggestions(originalText, selectedConversion, context);
      
      // Step 6: Store conversion for learning
      this.storeConversion(originalText, selectedConversion, context, options);
      
      const processingTime = Date.now() - startTime;
      
      return {
        original: originalText,
        converted: selectedConversion.text,
        context: context,
        level: selectedConversion.level,
        variations: conversions,
        suggestions: suggestions,
        analysis: {
          processingTime: processingTime,
          confidence: selectedConversion.confidence || 0.85,
          improvements: this.analyzeImprovements(originalText, selectedConversion.text),
          detectedIssues: context.needsImprovement
        },
        metadata: {
          conversions: conversions.length,
          timestamp: new Date().toISOString(),
          engine: 'enhanced-v2.0'
        }
      };
      
    } catch (error) {
      console.error('Conversion error:', error);
      return this.createFallbackResponse(originalText, error);
    }
  }

  /**
   * Generate multiple conversion approaches
   */
  async generateConversions(originalText, context, targetLevel) {
    const conversions = [];
    
    // Approach 1: Word-level intelligent conversion
    const wordConversion = this.wordConverter.convertText(originalText, context);
    conversions.push({
      approach: 'word-level',
      text: wordConversion.text,
      level: targetLevel,
      confidence: 0.75,
      details: wordConversion.conversions,
      description: '単語・フレーズレベルの丁寧語変換'
    });

    // Approach 2: Full sentence generation
    const sentenceConversion = this.sentenceGenerator.generatePoliteVersion(originalText, context, targetLevel);
    conversions.push({
      approach: 'sentence-generation',
      text: sentenceConversion,
      level: targetLevel,
      confidence: 0.90,
      description: 'フル文章再構築による自然な丁寧語'
    });

    // Approach 3: Multiple level variations
    const variations = this.sentenceGenerator.generateVariations(originalText, context, targetLevel);
    variations.forEach(variation => {
      conversions.push({
        approach: 'level-variation',
        text: variation.text,
        level: variation.level,
        confidence: 0.80,
        description: variation.description,
        characteristics: variation.characteristics
      });
    });

    // Approach 4: Context-specific optimized version
    if (context.situation !== 'general') {
      const contextOptimized = this.generateContextOptimizedVersion(originalText, context, targetLevel);
      conversions.push({
        approach: 'context-optimized',
        text: contextOptimized,
        level: targetLevel,
        confidence: 0.85,
        description: `${context.situation}コンテキスト最適化版`
      });
    }

    return conversions;
  }

  /**
   * Determine target politeness level based on context and options
   */
  determineTargetLevel(context, options) {
    // User-specified level takes priority
    if (options.level && options.level >= 1 && options.level <= 5) {
      return options.level;
    }

    // Auto-determine based on context
    let targetLevel = 3; // Default level

    // Adjust based on relationship
    if (context.relationship === 'superior') {
      targetLevel = Math.max(targetLevel, 4);
    } else if (context.relationship === 'subordinate') {
      targetLevel = Math.max(targetLevel, 2);
    }

    // Adjust based on urgency
    if (context.urgency === 'urgent') {
      targetLevel = Math.max(targetLevel, 3);
    }

    // Adjust based on situation
    if (context.situation === 'business') {
      targetLevel = Math.max(targetLevel, 3);
    }

    // Adjust based on formality assessment
    if (context.formalityLevel === 'very-casual') {
      targetLevel = Math.max(targetLevel, 4);
    }

    // Apply user preferences
    if (this.userPreferences.defaultLevel) {
      targetLevel = Math.max(targetLevel, this.userPreferences.defaultLevel);
    }

    return Math.min(5, targetLevel); // Cap at level 5
  }

  /**
   * Select the best conversion from available options
   */
  selectBestConversion(conversions, context, options) {
    // If user specified preference for approach
    if (options.preferredApproach) {
      const preferred = conversions.find(c => c.approach === options.preferredApproach);
      if (preferred) return preferred;
    }

    // Score each conversion
    const scoredConversions = conversions.map(conversion => ({
      ...conversion,
      score: this.scoreConversion(conversion, context, options)
    }));

    // Sort by score and return the best
    scoredConversions.sort((a, b) => b.score - a.score);
    return scoredConversions[0];
  }

  /**
   * Score a conversion based on various factors
   */
  scoreConversion(conversion, context, options) {
    let score = conversion.confidence * 100;

    // Bonus for sentence generation approach (more natural)
    if (conversion.approach === 'sentence-generation') {
      score += 10;
    }

    // Bonus for context optimization
    if (conversion.approach === 'context-optimized') {
      score += 15;
    }

    // Adjust for level appropriateness
    const targetLevel = this.determineTargetLevel(context, options);
    const levelDifference = Math.abs(conversion.level - targetLevel);
    score -= levelDifference * 5;

    // Bonus for addressing detected issues
    if (context.needsImprovement.needsImprovement) {
      if (conversion.text.length > context.needsImprovement.issues.length * 20) {
        score += 20; // Bonus for addressing improvement needs
      }
    }

    return score;
  }

  /**
   * Generate context-optimized version
   */
  generateContextOptimizedVersion(originalText, context, targetLevel) {
    // This would use the expression database and situational patterns
    // For now, we'll use the sentence generator with specific context
    const optimizedContext = {
      ...context,
      situation: context.situation,
      intent: context.intent,
      relationship: context.relationship
    };

    return this.sentenceGenerator.generatePoliteVersion(originalText, optimizedContext, targetLevel);
  }

  /**
   * Generate suggestions for improvement
   */
  generateSuggestions(originalText, selectedConversion, context) {
    const suggestions = [];

    // Context-based suggestions
    const contextSuggestions = this.contextAnalyzer.generateSuggestions(context);
    suggestions.push(...contextSuggestions.map(s => ({ type: 'context', message: s })));

    // Word-level suggestions
    const wordSuggestions = this.wordConverter.getSuggestions(selectedConversion.text, context);
    suggestions.push(...wordSuggestions);

    // Sentence quality suggestions
    const qualityAnalysis = this.sentenceGenerator.analyzeSentenceQuality(originalText, selectedConversion.text, context);
    if (qualityAnalysis.suggestions.length > 0) {
      suggestions.push(...qualityAnalysis.suggestions.map(s => ({ type: 'quality', message: s })));
    }

    // Level-specific suggestions
    if (selectedConversion.level < 4 && context.relationship === 'superior') {
      suggestions.push({
        type: 'level',
        message: '上司への連絡の場合、レベル4以上をお勧めします',
        action: 'increase_level'
      });
    }

    return suggestions;
  }

  /**
   * Analyze improvements made during conversion
   */
  analyzeImprovements(originalText, convertedText) {
    const improvements = [];

    // Length improvement
    if (convertedText.length > originalText.length * 1.3) {
      improvements.push('文章が十分に丁寧な長さになりました');
    }

    // Politeness markers
    const politenessMarkers = ['お疲れ', 'よろしく', 'ありがとう', 'すみません', 'いつもお世話'];
    const addedMarkers = politenessMarkers.filter(marker => 
      !originalText.includes(marker) && convertedText.includes(marker)
    );
    if (addedMarkers.length > 0) {
      improvements.push(`丁寧な表現を追加: ${addedMarkers.join(', ')}`);
    }

    // Casual word replacement
    const casualWords = ['アプデ', 'バグ', 'やって', 'して', 'マジで'];
    const replacedWords = casualWords.filter(word => 
      originalText.includes(word) && !convertedText.includes(word)
    );
    if (replacedWords.length > 0) {
      improvements.push(`カジュアルな表現を改善: ${replacedWords.length}個の単語`);
    }

    return improvements;
  }

  /**
   * Store conversion for learning and improvement
   */
  storeConversion(originalText, selectedConversion, context, options) {
    const conversionRecord = {
      timestamp: new Date().toISOString(),
      original: originalText,
      converted: selectedConversion.text,
      context: context,
      level: selectedConversion.level,
      approach: selectedConversion.approach,
      userOptions: options,
      confidence: selectedConversion.confidence
    };

    this.conversionHistory.push(conversionRecord);

    // Keep only recent conversions (last 100)
    if (this.conversionHistory.length > 100) {
      this.conversionHistory = this.conversionHistory.slice(-100);
    }

    // Update user preferences based on usage patterns
    this.updateUserPreferences(conversionRecord);
  }

  /**
   * Update user preferences based on conversion history
   */
  updateUserPreferences(conversionRecord) {
    // Analyze patterns in user's conversion choices
    if (this.conversionHistory.length >= 5) {
      const recentLevels = this.conversionHistory.slice(-5).map(r => r.level);
      const averageLevel = recentLevels.reduce((a, b) => a + b, 0) / recentLevels.length;
      
      // Update default level preference
      this.userPreferences.defaultLevel = Math.round(averageLevel);
      
      // Analyze preferred approaches
      const approaches = this.conversionHistory.slice(-10).map(r => r.approach);
      const approachCounts = {};
      approaches.forEach(approach => {
        approachCounts[approach] = (approachCounts[approach] || 0) + 1;
      });
      
      const preferredApproach = Object.keys(approachCounts).reduce((a, b) => 
        approachCounts[a] > approachCounts[b] ? a : b
      );
      
      this.userPreferences.preferredApproach = preferredApproach;
    }
  }

  /**
   * Load user preferences (in real app this would be from storage)
   */
  loadUserPreferences() {
    return {
      defaultLevel: 3,
      preferredApproach: null,
      enableEmoji: true,
      contextSensitivity: 'high'
    };
  }

  /**
   * Create fallback response in case of errors
   */
  createFallbackResponse(originalText, error) {
    return {
      original: originalText,
      converted: originalText + 'をお願いします。', // Simple fallback
      context: { intent: 'unknown', urgency: 'normal', relationship: 'unknown' },
      level: 2,
      variations: [],
      suggestions: [{ type: 'error', message: 'システムエラーが発生しました。シンプルな変換を適用しました。' }],
      analysis: {
        processingTime: 0,
        confidence: 0.3,
        improvements: [],
        detectedIssues: { needsImprovement: true, issues: ['processing_error'] }
      },
      metadata: {
        conversions: 1,
        timestamp: new Date().toISOString(),
        engine: 'fallback',
        error: error.message
      }
    };
  }

  /**
   * Get conversion statistics
   */
  getConversionStats() {
    return {
      totalConversions: this.conversionHistory.length,
      averageLevel: this.conversionHistory.length > 0 ? 
        this.conversionHistory.reduce((sum, r) => sum + r.level, 0) / this.conversionHistory.length : 0,
      mostUsedApproach: this.getMostUsedApproach(),
      userPreferences: this.userPreferences,
      recentConversions: this.conversionHistory.slice(-5)
    };
  }

  /**
   * Get most frequently used approach
   */
  getMostUsedApproach() {
    if (this.conversionHistory.length === 0) return null;
    
    const approaches = this.conversionHistory.map(r => r.approach);
    const counts = {};
    approaches.forEach(approach => {
      counts[approach] = (counts[approach] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  /**
   * Batch convert multiple texts
   */
  async convertBatch(texts, options = {}) {
    const results = [];
    
    for (const text of texts) {
      const result = await this.convertText(text, options);
      results.push(result);
    }
    
    return {
      results: results,
      summary: {
        total: texts.length,
        successful: results.filter(r => r.metadata.engine !== 'fallback').length,
        averageConfidence: results.reduce((sum, r) => sum + r.analysis.confidence, 0) / results.length
      }
    };
  }
}

module.exports = EnhancedConversionEngine;