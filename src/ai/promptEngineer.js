/**
 * Advanced Prompt Engineering System for Japanese Text Conversion
 * Generates context-aware prompts with few-shot learning and dynamic optimization
 */

class PromptEngineer {
  constructor() {
    this.fewShotExamples = this.loadFewShotExamples();
    this.contextTemplates = this.loadContextTemplates();
    this.dialectPatterns = this.loadDialectPatterns();
    this.qualityMetrics = new Map();
  }

  /**
   * Build optimized conversion prompt based on context and options
   */
  buildConversionPrompt(text, options = {}) {
    const {
      level = 2,
      context = 'business',
      relationship = 'colleague',
      urgency = 'normal',
      formality = 'standard',
      includeEmoji = false,
      preserveIntent = true
    } = options;

    // Analyze input text for better context understanding
    const textAnalysis = this.analyzeInputText(text);
    
    // Select appropriate few-shot examples
    const examples = this.selectRelevantExamples(textAnalysis, options);
    
    // Build the main prompt
    const prompt = this.assemblePrompt({
      text,
      level,
      context,
      relationship,
      urgency,
      formality,
      includeEmoji,
      preserveIntent,
      examples,
      textAnalysis
    });

    return {
      prompt,
      metadata: {
        textAnalysis,
        selectedExamples: examples.length,
        estimatedTokens: this.estimateTokens(prompt)
      }
    };
  }

  /**
   * Analyze input text for context clues
   */
  analyzeInputText(text) {
    return {
      hasDialect: this.detectDialect(text),
      hasCasualLanguage: this.detectCasualLanguage(text),
      hasSlang: this.detectSlang(text),
      intent: this.detectIntent(text),
      emotionalTone: this.detectEmotionalTone(text),
      technicalTerms: this.detectTechnicalTerms(text),
      length: text.length,
      complexity: this.assessComplexity(text)
    };
  }

  /**
   * Detect dialect patterns (Kansai, Tohoku, etc.)
   */
  detectDialect(text) {
    const dialects = {
      kansai: /やん|やで|やねん|せやな|ほんま|なんでやねん|あかん|おおきに/,
      tohoku: /だべ|だっぺ|んだ|ずら|べ$/,
      kyushu: /ばい|たい|っちゃ|やけん/,
      hiroshima: /じゃけー|じゃけん|ほうじゃ/,
      nagoya: /だがや|みゃー|でら/
    };

    for (const [dialect, pattern] of Object.entries(dialects)) {
      if (pattern.test(text)) {
        return dialect;
      }
    }
    return null;
  }

  /**
   * Detect casual language patterns
   */
  detectCasualLanguage(text) {
    const casualPatterns = [
      /やって|して$|ちょうだい/,
      /じゃん|だよね|でしょ？/,
      /マジで|ヤバい|すげー|でかい/,
      /アプデ|バグる|ググる|リスケ/
    ];

    return casualPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Detect slang and internet language
   */
  detectSlang(text) {
    const slangPatterns = [
      /w+$|草|ｗ/, // Internet slang
      /オワタ|キタ━|GJ|乙/,
      /ワロタ|ｋｋｋ|うぽつ/,
      /リア充|陰キャ|陽キャ/
    ];

    return slangPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Detect intent from text
   */
  detectIntent(text) {
    const intentPatterns = {
      request: /してほしい|頼む|お願い|やって|してくれ|してください/,
      question: /どう|なに|いつ|どこ|だれ|なぜ|？|ですか|でしょうか/,
      report: /しました|完了|終わり|報告|状況|結果/,
      apology: /ごめん|すみません|申し訳|失礼|謝/,
      greeting: /おはよう|こんにちは|こんばんは|お疲れ|よろしく/,
      complaint: /困る|問題|おかしい|ダメ|いけない|ムカつく/,
      appreciation: /ありがとう|感謝|助かる|嬉しい/
    };

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(text)) return intent;
    }
    return 'general';
  }

  /**
   * Detect emotional tone
   */
  detectEmotionalTone(text) {
    const emotionPatterns = {
      positive: /嬉しい|楽しい|良い|素晴らしい|最高|ありがとう/,
      negative: /悲しい|つらい|困る|大変|ダメ|ムカつく|イライラ/,
      urgent: /急ぎ|至急|緊急|すぐに|早く|ヤバい/,
      excited: /！|!|すげー|マジで|ヤベー|最高/,
      neutral: /です|ます|である|思う|考える/
    };

    for (const [emotion, pattern] of Object.entries(emotionPatterns)) {
      if (pattern.test(text)) return emotion;
    }
    return 'neutral';
  }

  /**
   * Detect technical terms
   */
  detectTechnicalTerms(text) {
    const techPatterns = [
      /API|データベース|サーバー|クライアント/,
      /プログラム|コード|バグ|デバッグ/,
      /アプリ|システム|ネットワーク|セキュリティ/,
      /アップデート|デプロイ|リリース|マージ/
    ];

    return techPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Assess text complexity
   */
  assessComplexity(text) {
    const factors = {
      length: text.length > 50 ? 2 : 1,
      kanji: (text.match(/[\u4e00-\u9faf]/g) || []).length,
      particles: (text.match(/は|が|を|に|で|と|から|まで/g) || []).length,
      punctuation: (text.match(/。|、|？|！/g) || []).length
    };

    const score = factors.length + (factors.kanji * 0.5) + factors.particles + factors.punctuation;
    
    if (score > 20) return 'high';
    if (score > 10) return 'medium';
    return 'low';
  }

  /**
   * Select relevant few-shot examples based on analysis
   */
  selectRelevantExamples(analysis, options) {
    let relevantExamples = [...this.fewShotExamples];

    // Filter by intent
    if (analysis.intent !== 'general') {
      relevantExamples = relevantExamples.filter(ex => 
        ex.intent === analysis.intent || ex.intent === 'general'
      );
    }

    // Filter by dialect
    if (analysis.hasDialect) {
      const dialectExamples = relevantExamples.filter(ex => ex.hasDialect);
      if (dialectExamples.length > 0) {
        relevantExamples = dialectExamples;
      }
    }

    // Filter by complexity
    relevantExamples = relevantExamples.filter(ex => 
      ex.complexity === analysis.complexity || ex.complexity === 'medium'
    );

    // Select best 3-5 examples
    return relevantExamples
      .sort((a, b) => this.calculateExampleRelevance(b, analysis, options) - 
                     this.calculateExampleRelevance(a, analysis, options))
      .slice(0, Math.min(5, relevantExamples.length));
  }

  /**
   * Calculate example relevance score
   */
  calculateExampleRelevance(example, analysis, options) {
    let score = 0;

    // Intent match
    if (example.intent === analysis.intent) score += 3;
    
    // Level match
    if (example.level === options.level) score += 2;
    
    // Context match
    if (example.context === options.context) score += 2;
    
    // Dialect match
    if (example.hasDialect === analysis.hasDialect) score += 1;
    
    // Complexity match
    if (example.complexity === analysis.complexity) score += 1;

    return score;
  }

  /**
   * Assemble the final prompt
   */
  assemblePrompt(params) {
    const {
      text, level, context, relationship, urgency, formality,
      includeEmoji, preserveIntent, examples, textAnalysis
    } = params;

    let prompt = `あなたは日本語コミュニケーションの専門家です。以下の条件で自然な日本語に変換してください。

【変換対象】
"${text}"

【変換条件】
- 丁寧度レベル: ${level}/5 (1=基本丁寧, 2=ビジネス適切, 3=非常に丁寧, 4=絵文字付き, 5=最上級敬語)
- 文脈: ${context} (business/casual/formal/technical)
- 関係性: ${relationship} (superior/colleague/subordinate/client/friend)
- 緊急度: ${urgency} (low/normal/urgent)
- 公式度: ${formality} (casual/standard/formal)`;

    if (includeEmoji && level >= 4) {
      prompt += `\n- 絵文字使用: 適度に使用して温かみを演出`;
    }

    prompt += `\n\n【変換ルール】
1. 原文の意図と感情を正確に保持する
2. 不自然な敬語の重複を避ける
3. 文脈に適した自然な表現を使用する`;

    if (textAnalysis.hasDialect) {
      prompt += `\n4. 方言は標準語の適切な表現に変換する`;
    }

    if (textAnalysis.hasCasualLanguage) {
      prompt += `\n5. カジュアルな表現は適切な敬語に変換する`;
    }

    if (textAnalysis.hasSlang) {
      prompt += `\n6. スラングや俗語は一般的な表現に置き換える`;
    }

    // Add few-shot examples if available
    if (examples.length > 0) {
      prompt += `\n\n【変換例】`;
      examples.forEach((example, index) => {
        prompt += `\n例${index + 1}: "${example.input}" → "${example.output}"`;
      });
    }

    prompt += `\n\n【出力形式】
変換されたテキストのみを出力してください（説明は不要）。

変換結果:`;

    return prompt;
  }

  /**
   * Estimate token usage for cost optimization
   */
  estimateTokens(prompt) {
    // Rough estimation: 1 token ≈ 0.75 words for Japanese
    const japaneseChars = (prompt.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g) || []).length;
    const englishWords = (prompt.match(/[a-zA-Z]+/g) || []).length;
    
    return Math.ceil(japaneseChars / 3 + englishWords);
  }

  /**
   * Load few-shot examples for different scenarios
   */
  loadFewShotExamples() {
    return [
      // Kansai dialect examples
      {
        input: "みんなも欲しがってるやん",
        output: "皆さんも関心を持たれているようですね",
        intent: "general",
        context: "business",
        level: 2,
        hasDialect: true,
        complexity: "low"
      },
      {
        input: "アプデしといてくれる？",
        output: "アップデートをお願いできますでしょうか",
        intent: "request",
        context: "technical",
        level: 2,
        hasDialect: false,
        complexity: "low"
      },
      {
        input: "バグったわ、どないしよ",
        output: "不具合が発生いたしました。対応方法をご相談させてください",
        intent: "report",
        context: "technical", 
        level: 3,
        hasDialect: true,
        complexity: "medium"
      },
      {
        input: "マジでヤバいことになってる",
        output: "緊急事態が発生しております",
        intent: "report",
        context: "business",
        level: 3,
        hasDialect: false,
        complexity: "medium"
      },
      {
        input: "おつかれさまでした！",
        output: "本日もお疲れ様でした",
        intent: "greeting",
        context: "business",
        level: 2,
        hasDialect: false,
        complexity: "low"
      },
      {
        input: "すみません、遅れます",
        output: "申し訳ございません。少々遅れる見込みです",
        intent: "apology",
        context: "business",
        level: 3,
        hasDialect: false,
        complexity: "low"
      },
      {
        input: "わからんから教えて",
        output: "理解できておりませんので、ご指導いただけませんでしょうか",
        intent: "question",
        context: "business",
        level: 3,
        hasDialect: true,
        complexity: "medium"
      },
      {
        input: "ありがとうございます！助かりました",
        output: "ありがとうございます。大変助かりました",
        intent: "appreciation",
        context: "business",
        level: 2,
        hasDialect: false,
        complexity: "low"
      }
    ];
  }

  /**
   * Load context-specific templates
   */
  loadContextTemplates() {
    return {
      business: {
        greeting: "いつもお世話になっております。",
        closing: "よろしくお願いいたします。",
        urgentPrefix: "急ぎで恐縮ですが、"
      },
      casual: {
        greeting: "お疲れ様です。",
        closing: "よろしくお願いします。",
        urgentPrefix: "急ぎですが、"
      },
      formal: {
        greeting: "恐れ入ります。",
        closing: "何卒よろしくお願い申し上げます。",
        urgentPrefix: "至急で恐縮に存じますが、"
      }
    };
  }

  /**
   * Load dialect patterns for better recognition
   */
  loadDialectPatterns() {
    return {
      kansai: {
        endings: ["やん", "やで", "やねん", "わ", "さかい"],
        particles: ["やから", "やけど", "やのに"],
        expressions: ["せやな", "ほんま", "あかん", "おおきに"]
      },
      tohoku: {
        endings: ["だべ", "べ", "んだ"],
        particles: ["から", "けども"],
        expressions: ["んだっぺ", "だっぺよ"]
      }
    };
  }

  /**
   * Record prompt performance for optimization
   */
  recordPromptPerformance(promptId, metrics) {
    this.qualityMetrics.set(promptId, {
      timestamp: Date.now(),
      ...metrics
    });
  }

  /**
   * Get optimization suggestions based on performance data
   */
  getOptimizationSuggestions() {
    const suggestions = [];
    
    // Analyze performance patterns
    for (const [promptId, metrics] of this.qualityMetrics.entries()) {
      if (metrics.userRating < 3) {
        suggestions.push({
          type: 'low_quality',
          promptId,
          suggestion: 'Consider adding more relevant examples or adjusting context detection'
        });
      }
      
      if (metrics.tokenUsage > 500) {
        suggestions.push({
          type: 'high_cost',
          promptId,
          suggestion: 'Reduce prompt length by optimizing example selection'
        });
      }
    }
    
    return suggestions;
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PromptEngineer };
} else {
  window.PromptEngineer = PromptEngineer;
}