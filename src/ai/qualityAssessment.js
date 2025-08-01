/**
 * Quality Assessment System for AI-generated Japanese Text Conversion
 * Evaluates naturalness, intent preservation, appropriateness, and completeness
 */

class QualityAssessment {
  constructor() {
    this.metrics = {
      naturalness: new NaturalnessEvaluator(),
      intentPreservation: new IntentPreservationEvaluator(),
      appropriateness: new AppropriatenessEvaluator(),
      completeness: new CompletenessEvaluator()
    };
    
    this.weights = {
      naturalness: 0.3,
      intentPreservation: 0.3,
      appropriateness: 0.25,
      completeness: 0.15
    };
    
    this.benchmarkData = this.loadBenchmarkData();
  }

  /**
   * Assess overall conversion quality
   */
  async assessConversion(original, converted, options = {}) {
    const scores = {};
    const details = {};
    
    // Evaluate each metric
    for (const [metricName, evaluator] of Object.entries(this.metrics)) {
      try {
        const result = await evaluator.evaluate(original, converted, options);
        scores[metricName] = result.score;
        details[metricName] = result.details;
      } catch (error) {
        console.warn(`Quality assessment failed for ${metricName}:`, error);
        scores[metricName] = 0.5; // Default neutral score
        details[metricName] = { error: error.message };
      }
    }
    
    // Calculate weighted overall score
    const overall = this.calculateOverallScore(scores);
    
    // Generate quality report
    const report = this.generateQualityReport(scores, details, overall);
    
    return {
      overall,
      scores,
      details,
      report,
      recommendations: this.generateRecommendations(scores, details),
      timestamp: Date.now()
    };
  }

  /**
   * Calculate weighted overall quality score
   */
  calculateOverallScore(scores) {
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const [metric, score] of Object.entries(scores)) {
      const weight = this.weights[metric] || 0.25;
      weightedSum += score * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  /**
   * Generate quality report with insights
   */
  generateQualityReport(scores, details, overall) {
    const report = {
      grade: this.getQualityGrade(overall),
      summary: this.getQualitySummary(overall),
      strengths: [],
      weaknesses: [],
      criticalIssues: []
    };
    
    // Identify strengths and weaknesses
    for (const [metric, score] of Object.entries(scores)) {
      if (score >= 0.8) {
        report.strengths.push(this.getMetricDescription(metric, 'strength'));
      } else if (score <= 0.4) {
        report.weaknesses.push(this.getMetricDescription(metric, 'weakness'));
        if (score <= 0.2) {
          report.criticalIssues.push(this.getMetricDescription(metric, 'critical'));
        }
      }
    }
    
    return report;
  }

  /**
   * Get quality grade based on overall score
   */
  getQualityGrade(score) {
    if (score >= 0.9) return 'A+';
    if (score >= 0.8) return 'A';
    if (score >= 0.7) return 'B+';
    if (score >= 0.6) return 'B';
    if (score >= 0.5) return 'C+';
    if (score >= 0.4) return 'C';
    if (score >= 0.3) return 'D';
    return 'F';
  }

  /**
   * Get quality summary message
   */
  getQualitySummary(score) {
    if (score >= 0.9) return '非常に高品質な変換です';
    if (score >= 0.8) return '高品質な変換です';
    if (score >= 0.7) return '良好な変換です';
    if (score >= 0.6) return '標準的な変換です';
    if (score >= 0.5) return '改善の余地があります';
    if (score >= 0.4) return '品質に問題があります';
    return '大幅な改善が必要です';
  }

  /**
   * Get metric description for reports
   */
  getMetricDescription(metric, type) {
    const descriptions = {
      naturalness: {
        strength: '自然で流暢な日本語表現',
        weakness: '不自然な表現が含まれています',
        critical: '日本語として極めて不自然です'
      },
      intentPreservation: {
        strength: '元の意図が正確に保持されています',
        weakness: '元の意図が一部失われています',
        critical: '元の意図が大きく変わっています'
      },
      appropriateness: {
        strength: '文脈に適した適切な敬語レベル',
        weakness: '敬語レベルが不適切です',
        critical: '文脈に全く適していません'
      },
      completeness: {
        strength: '完全で包括的な変換',
        weakness: '一部の要素が欠けています',
        critical: '重要な情報が大幅に欠落しています'
      }
    };
    
    return descriptions[metric]?.[type] || `${metric}に関する${type}`;
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(scores, details) {
    const recommendations = [];
    
    // Naturalness recommendations
    if (scores.naturalness < 0.7) {
      recommendations.push({
        metric: 'naturalness',
        priority: 'high',
        message: 'より自然な日本語表現を使用することをお勧めします',
        suggestions: [
          '硬い表現を柔らかい表現に変更',
          '重複する敬語を整理',
          '文章の流れを改善'
        ]
      });
    }
    
    // Intent preservation recommendations
    if (scores.intentPreservation < 0.7) {
      recommendations.push({
        metric: 'intentPreservation',
        priority: 'high',
        message: '元の意図をより正確に伝える必要があります',
        suggestions: [
          '重要なニュアンスの保持',
          '感情表現の適切な変換',
          '文脈の一貫性確保'
        ]
      });
    }
    
    // Appropriateness recommendations
    if (scores.appropriateness < 0.6) {
      recommendations.push({
        metric: 'appropriateness',
        priority: 'medium',
        message: '敬語レベルを調整することをお勧めします',
        suggestions: [
          '関係性に応じた敬語選択',
          '場面に適した表現使用',
          'ビジネス慣習への配慮'
        ]
      });
    }
    
    return recommendations;
  }

  /**
   * Load benchmark data for quality comparison
   */
  loadBenchmarkData() {
    return {
      highQuality: [
        {
          original: "アプデしといて",
          converted: "恐れ入りますが、アップデートをお願いできますでしょうか",
          scores: { naturalness: 0.9, intentPreservation: 0.95, appropriateness: 0.9, completeness: 0.85 }
        },
        {
          original: "みんなも欲しがってるやん",
          converted: "皆さんも関心を持たれているようですね",
          scores: { naturalness: 0.95, intentPreservation: 0.9, appropriateness: 0.85, completeness: 0.9 }
        }
      ],
      lowQuality: [
        {
          original: "バグった",
          converted: "恐れ入ります。バグったいただけますでしょうか。ご検討のほどよろしくお願いします。",
          scores: { naturalness: 0.2, intentPreservation: 0.3, appropriateness: 0.4, completeness: 0.3 }
        }
      ]
    };
  }
}

/**
 * Naturalness Evaluator - Assesses how natural the Japanese text sounds
 */
class NaturalnessEvaluator {
  constructor() {
    this.unnaturalPatterns = [
      /です。。+/, // Multiple periods
      /ます。です/, // Awkward politeness mixing
      /いただけますでしょうかお願いします/, // Redundant requests
      /恐れ入ります.*恐縮です.*申し訳/, // Excessive apologies
      /[ぁ-んァ-ヶー]+いただけますでしょうか/, // Unconverted casual + formal
    ];
    
    this.naturalPatterns = [
      /です$|ます$/, // Proper sentence endings
      /いただけ(ませんか|ますでしょうか)/, // Natural request forms
      /恐れ入りますが/, // Natural politeness markers
    ];
  }

  async evaluate(original, converted, options) {
    let score = 0.8; // Start with good base score
    const issues = [];
    
    // Check for unnatural patterns
    for (const pattern of this.unnaturalPatterns) {
      if (pattern.test(converted)) {
        score -= 0.2;
        issues.push(`Unnatural pattern detected: ${pattern.source}`);
      }
    }
    
    // Bonus for natural patterns
    let naturalCount = 0;
    for (const pattern of this.naturalPatterns) {
      if (pattern.test(converted)) {
        naturalCount++;
      }
    }
    score += naturalCount * 0.05;
    
    // Check sentence flow
    const flowScore = this.assessSentenceFlow(converted);
    score = score * 0.7 + flowScore * 0.3;
    
    // Check for appropriate conjunctions and particles
    const particleScore = this.assessParticleUsage(converted);
    score = score * 0.9 + particleScore * 0.1;
    
    return {
      score: Math.max(0, Math.min(1, score)),
      details: {
        issues,
        flowScore,
        particleScore,
        naturalPatterns: naturalCount
      }
    };
  }

  assessSentenceFlow(text) {
    // Simple heuristic: check for smooth transitions
    const sentences = text.split(/[。！？]/);
    if (sentences.length <= 1) return 0.8;
    
    let flowScore = 0.8;
    
    // Check for abrupt transitions
    for (let i = 1; i < sentences.length; i++) {
      const prev = sentences[i-1].trim();
      const curr = sentences[i].trim();
      
      if (prev && curr) {
        // Look for connecting elements
        if (!/^(また|さらに|なお|ところで|それで|そして)/.test(curr)) {
          flowScore -= 0.1;
        }
      }
    }
    
    return Math.max(0, flowScore);
  }

  assessParticleUsage(text) {
    const particles = text.match(/[はがをにでとからまでより]/g) || [];
    const totalChars = text.length;
    
    // Expect 5-15% particle usage for natural Japanese
    const particleRatio = particles.length / totalChars;
    
    if (particleRatio >= 0.05 && particleRatio <= 0.15) {
      return 0.9;
    } else if (particleRatio >= 0.03 && particleRatio <= 0.20) {
      return 0.7;
    } else {
      return 0.5;
    }
  }
}

/**
 * Intent Preservation Evaluator - Checks if original intent is maintained
 */
class IntentPreservationEvaluator {
  constructor() {
    this.intentKeywords = {
      request: ['して', 'やって', 'お願い', '頼む'],
      question: ['？', 'どう', 'なに', 'いつ', 'どこ'],
      apology: ['ごめん', 'すみません', '申し訳'],
      gratitude: ['ありがとう', '感謝', '助かる'],
      report: ['しました', '完了', '終了', '済み']
    };
  }

  async evaluate(original, converted, options) {
    let score = 0.8;
    const analysis = {
      originalIntent: this.detectIntent(original),
      convertedIntent: this.detectIntent(converted),
      keywordPreservation: 0,
      emotionalToneMatch: 0
    };
    
    // Check intent preservation
    if (analysis.originalIntent === analysis.convertedIntent) {
      score += 0.1;
    } else {
      score -= 0.3;
    }
    
    // Check keyword preservation (semantic meaning)
    analysis.keywordPreservation = this.assessKeywordPreservation(original, converted);
    score = score * 0.7 + analysis.keywordPreservation * 0.3;
    
    // Check emotional tone preservation
    analysis.emotionalToneMatch = this.assessEmotionalToneMatch(original, converted);
    score = score * 0.8 + analysis.emotionalToneMatch * 0.2;
    
    return {
      score: Math.max(0, Math.min(1, score)),
      details: analysis
    };
  }

  detectIntent(text) {
    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return intent;
      }
    }
    return 'general';
  }

  assessKeywordPreservation(original, converted) {
    // Extract important content words (nouns, verbs)
    const originalWords = this.extractContentWords(original);
    const convertedWords = this.extractContentWords(converted);
    
    if (originalWords.length === 0) return 0.8;
    
    let preservedCount = 0;
    for (const word of originalWords) {
      if (convertedWords.includes(word) || this.hasSynonym(word, convertedWords)) {
        preservedCount++;
      }
    }
    
    return preservedCount / originalWords.length;
  }

  extractContentWords(text) {
    // Simple content word extraction (would be more sophisticated in production)
    const words = text.match(/[ぁ-んァ-ヶー一-龯]+/g) || [];
    return words.filter(word => 
      word.length >= 2 && 
      !['です', 'ます', 'した', 'ある', 'いる', 'する', 'なる'].includes(word)
    );
  }

  hasSynonym(word, wordList) {
    const synonyms = {
      'アプデ': ['アップデート', '更新'],
      'バグ': ['不具合', 'エラー'],
      'やって': ['対応', '実行', '処理'],
      '確認': ['チェック', '点検']
    };
    
    const synList = synonyms[word] || [];
    return synList.some(syn => wordList.includes(syn));
  }

  assessEmotionalToneMatch(original, converted) {
    const originalTone = this.detectEmotionalTone(original);
    const convertedTone = this.detectEmotionalTone(converted);
    
    // Exact match
    if (originalTone === convertedTone) return 1.0;
    
    // Compatible tones
    const compatibleTones = {
      'urgent': ['serious', 'formal'],
      'casual': ['friendly', 'neutral'],
      'angry': ['serious', 'formal']
    };
    
    if (compatibleTones[originalTone]?.includes(convertedTone)) {
      return 0.8;
    }
    
    return 0.5;
  }

  detectEmotionalTone(text) {
    const tonePatterns = {
      urgent: /急|緊急|至急|すぐ|早く|ヤバい/,
      angry: /ムカつく|腹立つ|イライラ|怒/,
      happy: /嬉しい|楽しい|良かった|最高/,
      sad: /悲しい|残念|がっかり|落ち込/,
      casual: /だよね|じゃん|やん|だべ/,
      formal: /いたします|ございます|申し上げ/
    };
    
    for (const [tone, pattern] of Object.entries(tonePatterns)) {
      if (pattern.test(text)) return tone;
    }
    
    return 'neutral';
  }
}

/**
 * Appropriateness Evaluator - Checks context and relationship appropriateness
 */
class AppropriatenessEvaluator {
  async evaluate(original, converted, options) {
    let score = 0.8;
    const analysis = {
      levelMatch: 0,
      contextMatch: 0,
      relationshipMatch: 0
    };
    
    // Check politeness level appropriateness
    analysis.levelMatch = this.assessPolitenessLevel(converted, options.level || 2);
    score = score * 0.4 + analysis.levelMatch * 0.6;
    
    // Check context appropriateness
    analysis.contextMatch = this.assessContextMatch(converted, options.context || 'business');
    score = score * 0.8 + analysis.contextMatch * 0.2;
    
    // Check relationship appropriateness
    analysis.relationshipMatch = this.assessRelationshipMatch(converted, options.relationship || 'colleague');
    score = score * 0.8 + analysis.relationshipMatch * 0.2;
    
    return {
      score: Math.max(0, Math.min(1, score)),
      details: analysis
    };
  }

  assessPolitenessLevel(text, expectedLevel) {
    const actualLevel = this.detectPolitenessLevel(text);
    const levelDiff = Math.abs(actualLevel - expectedLevel);
    
    if (levelDiff === 0) return 1.0;
    if (levelDiff === 1) return 0.8;
    if (levelDiff === 2) return 0.6;
    return 0.4;
  }

  detectPolitenessLevel(text) {
    if (/申し上げ|いたします|ございます/.test(text)) return 5;
    if (/いただけますでしょうか|恐縮/.test(text)) return 4;
    if (/いただけ|お願いします|よろしく/.test(text)) return 3;
    if (/です|ます/.test(text)) return 2;
    return 1;
  }

  assessContextMatch(text, expectedContext) {
    const contextIndicators = {
      business: /お疲れ|会議|資料|企画|よろしく/,
      technical: /システム|アプリ|バグ|アップデート/,
      casual: /ありがとう|助かる|楽しい/,
      formal: /恐れ入り|申し上げ|いたします/
    };
    
    const pattern = contextIndicators[expectedContext];
    return pattern && pattern.test(text) ? 1.0 : 0.7;
  }

  assessRelationshipMatch(text, expectedRelationship) {
    const relationshipIndicators = {
      superior: /恐れ入り|申し訳|失礼/,
      colleague: /お疲れ|よろしく|ありがとう/,
      subordinate: /お願い|確認/,
      client: /いつもお世話|ご利用|サービス/
    };
    
    const pattern = relationshipIndicators[expectedRelationship];
    return pattern && pattern.test(text) ? 1.0 : 0.8;
  }
}

/**
 * Completeness Evaluator - Checks if conversion is complete and comprehensive
 */
class CompletenessEvaluator {
  async evaluate(original, converted, options) {
    let score = 0.8;
    const analysis = {
      lengthRatio: 0,
      informationPreservation: 0,
      structurePreservation: 0
    };
    
    // Check length appropriateness
    analysis.lengthRatio = converted.length / original.length;
    if (analysis.lengthRatio >= 1.2 && analysis.lengthRatio <= 3.0) {
      score += 0.1;
    } else if (analysis.lengthRatio < 0.8 || analysis.lengthRatio > 4.0) {
      score -= 0.2;
    }
    
    // Check information preservation
    analysis.informationPreservation = this.assessInformationPreservation(original, converted);
    score = score * 0.6 + analysis.informationPreservation * 0.4;
    
    // Check structure preservation
    analysis.structurePreservation = this.assessStructurePreservation(original, converted);
    score = score * 0.9 + analysis.structurePreservation * 0.1;
    
    return {
      score: Math.max(0, Math.min(1, score)),
      details: analysis
    };
  }

  assessInformationPreservation(original, converted) {
    // Extract key information elements
    const originalElements = this.extractInformationElements(original);
    const convertedElements = this.extractInformationElements(converted);
    
    if (originalElements.length === 0) return 0.9;
    
    let preservedCount = 0;
    for (const element of originalElements) {
      if (convertedElements.some(ce => this.areElementsSimilar(element, ce))) {
        preservedCount++;
      }
    }
    
    return preservedCount / originalElements.length;
  }

  extractInformationElements(text) {
    // Extract dates, numbers, names, and key concepts
    const elements = [];
    
    // Numbers and dates
    const numbers = text.match(/\d+/g) || [];
    elements.push(...numbers);
    
    // Key nouns (simplified)
    const nouns = text.match(/[ぁ-んァ-ヶー一-龯]{2,}/g) || [];
    elements.push(...nouns.filter(noun => noun.length >= 2));
    
    return elements;
  }

  areElementsSimilar(element1, element2) {
    // Simple similarity check
    return element1 === element2 || 
           element1.includes(element2) || 
           element2.includes(element1);
  }

  assessStructurePreservation(original, converted) {
    // Check if sentence structure is preserved
    const originalSentences = original.split(/[。！？]/).filter(s => s.trim());
    const convertedSentences = converted.split(/[。！？]/).filter(s => s.trim());
    
    // Similar number of sentences is good
    const sentenceRatio = convertedSentences.length / Math.max(1, originalSentences.length);
    
    if (sentenceRatio >= 0.8 && sentenceRatio <= 1.5) {
      return 0.9;
    } else if (sentenceRatio >= 0.5 && sentenceRatio <= 2.0) {
      return 0.7;
    } else {
      return 0.5;
    }
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    QualityAssessment,
    NaturalnessEvaluator,
    IntentPreservationEvaluator,
    AppropriatenessEvaluator,
    CompletenessEvaluator
  };
} else {
  window.QualityAssessment = QualityAssessment;
  window.NaturalnessEvaluator = NaturalnessEvaluator;
  window.IntentPreservationEvaluator = IntentPreservationEvaluator;
  window.AppropriatenessEvaluator = AppropriatenessEvaluator;
  window.CompletenessEvaluator = CompletenessEvaluator;
}