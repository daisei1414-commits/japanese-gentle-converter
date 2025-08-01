/**
 * Context Analyzer - Intelligent Japanese text context recognition
 * Analyzes intent, situation, urgency, and relationship from text
 */
class ContextAnalyzer {
  constructor() {
    this.intentPatterns = {
      request: [
        /して/, /してください/, /お願い/, /頼む/, /やって/, /確認/, /チェック/, 
        /見て/, /教えて/, /送って/, /作って/, /修正/, /対応/, /処理/
      ],
      question: [
        /\?/, /？/, /どう/, /いかが/, /どこ/, /いつ/, /なぜ/, /なに/, /どれ/, 
        /大丈夫/, /可能/, /できる/, /わかる/, /知って/
      ],
      report: [
        /報告/, /お知らせ/, /完了/, /終了/, /済み/, /できました/, /しました/, 
        /進捗/, /状況/, /結果/, /について/, /件で/
      ],
      apology: [
        /すみません/, /申し訳/, /ごめん/, /失礼/, /遅れ/, /ミス/, /間違い/, 
        /忘れ/, /できません/, /困って/
      ],
      greeting: [
        /おはよう/, /こんにちは/, /こんばんは/, /お疲れ/, /失礼します/, 
        /よろしく/, /ありがとう/, /感謝/
      ],
      complaint: [
        /問題/, /困る/, /おかしい/, /変/, /ダメ/, /不具合/, /エラー/, 
        /動かない/, /できない/, /遅い/
      ]
    };

    this.urgencyIndicators = {
      urgent: [
        /急/, /緊急/, /至急/, /ASAP/, /今すぐ/, /すぐに/, /早く/, /急いで/, 
        /待って/, /ヤバい/, /マジで/, /本当に/, /大変/, /危険/
      ],
      normal: [
        /よろしく/, /お願い/, /いつでも/, /可能でしたら/, /お時間/
      ],
      relaxed: [
        /ゆっくり/, /のんびり/, /空いてる時/, /余裕/, /後で/, /今度/, 
        /いつか/, /そのうち/
      ]
    };

    this.relationshipIndicators = {
      superior: [
        /部長/, /課長/, /社長/, /お疲れ様/, /恐れ入り/, /失礼/, /申し訳/, 
        /いつもお世話/, /ありがとうございます/
      ],
      colleague: [
        /さん/, /君/, /よろしく/, /一緒に/, /手伝/, /相談/, /どう思う/
      ],
      subordinate: [
        /頼む/, /やって/, /確認して/, /急いで/, /大丈夫？/
      ],
      customer: [
        /お客/, /ご利用/, /サービス/, /お問い合わせ/, /ご質問/, /ご不明/
      ]
    };

    this.casualWords = [
      'アプデ', 'バグ', 'レス', 'リスケ', 'ググる', 'ヤバい', 'マジで',
      'やって', 'して', 'ダメ', 'オッケー', 'NG', 'OK', 'チェック'
    ];
  }

  /**
   * Analyze the overall context of the text
   */
  analyzeContext(text) {
    const intent = this.analyzeIntent(text);
    const urgency = this.detectUrgency(text);
    const relationship = this.estimateRelationship(text);
    const situation = this.detectSituation(text);
    const formalityLevel = this.assessFormality(text);
    const timeContext = this.detectTimeContext(text);

    return {
      intent,
      urgency, 
      relationship,
      situation,
      formalityLevel,
      timeContext,
      needsImprovement: this.needsImprovement(text),
      casualWords: this.findCasualWords(text)
    };
  }

  /**
   * Analyze the intent/purpose of the text
   */
  analyzeIntent(text) {
    const scores = {};
    
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      scores[intent] = 0;
      
      for (const pattern of patterns) {
        const matches = (text.match(pattern) || []).length;
        scores[intent] += matches;
      }
    }

    // Find the highest scoring intent
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'unknown';
    
    return Object.keys(scores).find(key => scores[key] === maxScore);
  }

  /**
   * Detect urgency level
   */
  detectUrgency(text) {
    for (const [level, patterns] of Object.entries(this.urgencyIndicators)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return level;
        }
      }
    }
    return 'normal';
  }

  /**
   * Estimate relationship with recipient
   */
  estimateRelationship(text) {
    const scores = {};
    
    for (const [relationship, patterns] of Object.entries(this.relationshipIndicators)) {
      scores[relationship] = 0;
      
      for (const pattern of patterns) {
        const matches = (text.match(pattern) || []).length;
        scores[relationship] += matches;
      }
    }

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'unknown';
    
    return Object.keys(scores).find(key => scores[key] === maxScore);
  }

  /**
   * Detect the overall situation/setting
   */
  detectSituation(text) {
    // Business-related keywords
    const businessKeywords = [
      /会議/, /資料/, /企画/, /プロジェクト/, /売上/, /予算/, /契約/, 
      /クライアント/, /顧客/, /営業/, /部署/, /チーム/
    ];

    // Technical keywords
    const technicalKeywords = [
      /システム/, /アプリ/, /サーバー/, /データベース/, /API/, /バグ/, 
      /デプロイ/, /テスト/, /実装/, /設計/
    ];

    // Casual/social keywords
    const casualKeywords = [
      /飲み/, /ランチ/, /休憩/, /趣味/, /映画/, /ゲーム/, /旅行/, 
      /週末/, /プライベート/
    ];

    if (businessKeywords.some(pattern => pattern.test(text))) {
      return 'business';
    }
    if (technicalKeywords.some(pattern => pattern.test(text))) {
      return 'technical';
    }
    if (casualKeywords.some(pattern => pattern.test(text))) {
      return 'casual';
    }
    
    return 'general';
  }

  /**
   * Assess current formality level of the text
   */
  assessFormality(text) {
    let formalityScore = 0;

    // Formal indicators (+)
    const formalIndicators = [
      /です/, /ます/, /ございます/, /いただき/, /いたします/, /申し上げ/, 
      /恐れ入り/, /失礼/, /お世話になっております/
    ];

    // Casual indicators (-)
    const casualIndicators = [
      /だよ/, /だね/, /じゃん/, /って/, /やつ/, /すげー/, /マジで/, 
      /ヤバい/, /オッケー/
    ];

    formalIndicators.forEach(pattern => {
      formalityScore += (text.match(pattern) || []).length * 2;
    });

    casualIndicators.forEach(pattern => {
      formalityScore -= (text.match(pattern) || []).length * 3;
    });

    if (formalityScore >= 3) return 'very-formal';
    if (formalityScore >= 1) return 'formal';
    if (formalityScore >= -2) return 'neutral';
    if (formalityScore >= -5) return 'casual';
    return 'very-casual';
  }

  /**
   * Detect time context (morning, afternoon, etc.)
   */
  detectTimeContext(text) {
    const timePatterns = {
      morning: [/おはよう/, /朝/, /午前/, /今朝/],
      afternoon: [/こんにちは/, /午後/, /昼/, /ランチ/],
      evening: [/こんばんは/, /夕方/, /夜/, /お疲れ様/],
      general: [/今日/, /明日/, /昨日/, /今週/, /来週/]
    };

    for (const [time, patterns] of Object.entries(timePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return time;
        }
      }
    }

    // Guess based on current time if no indicators
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * Check if text needs improvement
   */
  needsImprovement(text) {
    const issues = [];

    // Check for casual words that need conversion
    const casualWords = this.findCasualWords(text);
    if (casualWords.length > 0) {
      issues.push('casual_language');
    }

    // Check for abrupt tone
    if (!text.includes('お疲れ') && !text.includes('よろしく') && 
        !text.includes('ありがとう') && !text.includes('すみません')) {
      issues.push('lacks_politeness_markers');
    }

    // Check for missing context
    if (text.length < 10) {
      issues.push('too_brief');
    }

    // Check for direct commands
    if (/^[やして]/.test(text)) {
      issues.push('too_direct');
    }

    return {
      needsImprovement: issues.length > 0,
      issues: issues,
      severity: issues.length >= 3 ? 'high' : issues.length >= 1 ? 'medium' : 'low'
    };
  }

  /**
   * Find casual words that should be converted
   */
  findCasualWords(text) {
    return this.casualWords.filter(word => text.includes(word));
  }

  /**
   * Generate improvement suggestions
   */
  generateSuggestions(context) {
    const suggestions = [];

    if (context.needsImprovement.issues.includes('casual_language')) {
      suggestions.push('カジュアルな表現をより丁寧な言葉に変換することをお勧めします');
    }

    if (context.needsImprovement.issues.includes('lacks_politeness_markers')) {
      suggestions.push('挨拶や締めの言葉を追加すると、より丁寧な印象になります');
    }

    if (context.needsImprovement.issues.includes('too_brief')) {
      suggestions.push('もう少し詳しい説明を加えると、相手に気遣いが伝わります');
    }

    if (context.needsImprovement.issues.includes('too_direct')) {
      suggestions.push('直接的な表現を柔らかい依頼形に変更することをお勧めします');
    }

    return suggestions;
  }
}

module.exports = ContextAnalyzer;