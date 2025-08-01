/**
 * Sentence Generator - Advanced Japanese sentence construction
 * Generates natural, polite Japanese sentences with context awareness
 */
class SentenceGenerator {
  constructor() {
    this.loadExpressionData();
  }

  loadExpressionData() {
    this.expressions = {
      greetings: {
        morning: ['おはようございます', 'お疲れ様です', '朝からお忙しい中'],
        afternoon: ['お疲れ様です', 'いつもお世話になっております', '午後もお忙しい中'],
        evening: ['お疲れ様でした', '遅い時間に恐縮です', '本日もお疲れ様です'],
        general: ['いつもお世話になっております', 'お疲れ様です', '恐れ入ります']
      },
      
      cushions: {
        request: [
          'お忙しい中恐縮ですが', 'もしよろしければ', 'お手数をおかけしますが',
          'ご都合がつく際に', 'お時間のある時に', '恐れ入りますが'
        ],
        urgent: [
          '急ぎで恐縮ですが', '緊急でお願いがあります', '至急で申し訳ございませんが',
          '大変恐縮ですが急ぎで', 'お忙しい中申し訳ございませんが緊急で'
        ],
        superior: [
          'お忙しい中申し訳ございませんが', '恐れ入りますが', '不躾なお願いで申し訳ございませんが',
          'ご多忙中恐縮ですが', 'お時間をいただき恐縮ですが'
        ],
        casual: [
          'よろしければ', 'もしお時間があるときに', 'お疲れ様です',
          'いつもありがとうございます'
        ]
      },

      closings: {
        request: [
          'よろしくお願いいたします', 'ご検討のほどよろしくお願いします',
          'お忙しい中ありがとうございます', 'どうぞよろしくお願いします'
        ],
        question: [
          'お教えいただけますと幸いです', 'ご回答いただければと思います',
          'お聞かせいただけませんでしょうか', 'ご意見をお聞かせください'
        ],
        urgent: [
          '急ぎで申し訳ございませんが、よろしくお願いします',
          'お忙しい中恐縮ですが、お急ぎでお願いします',
          '至急対応していただけますと助かります'
        ],
        gratitude: [
          'いつもありがとうございます', 'お忙しい中ありがとうございました',
          'ご協力いただきありがとうございます', '心より感謝申し上げます'
        ]
      },

      transitions: {
        explanation: ['なお', 'また', 'ちなみに', '補足ですが', '念のため'],
        contrast: ['ただし', 'しかしながら', '一方で', 'とはいえ', 'もっとも'],
        addition: ['さらに', '加えて', 'また', '併せて', 'なお'],
        conclusion: ['以上より', 'したがって', 'つきましては', 'そのため', 'よって']
      },

      variations: {
        polite_endings: ['です', 'ます', 'でございます', 'いたします', 'させていただきます'],
        question_endings: ['でしょうか', 'でしょうか？', 'いかがでしょうか', 'はいかがでしょう'],
        request_endings: ['いただけませんでしょうか', 'お願いできますでしょうか', 'いただければと思います']
      }
    };
  }

  /**
   * Generate polite version of text with full sentence construction
   */
  generatePoliteVersion(originalText, context, level = 3) {
    const components = this.analyzeTextComponents(originalText);
    const sentenceStructure = this.planSentenceStructure(components, context, level);
    return this.assembleSentence(sentenceStructure, context, level);
  }

  /**
   * Analyze text into meaningful components
   */
  analyzeTextComponents(text) {
    return {
      mainContent: this.extractMainContent(text),
      requestType: this.identifyRequestType(text),
      keyWords: this.extractKeywords(text),
      emotionalTone: this.detectEmotionalTone(text),
      hasQuestion: text.includes('？') || text.includes('?'),
      hasRequest: /して|やって|お願い/.test(text),
      length: text.length
    };
  }

  /**
   * Extract the core meaning from the text
   */
  extractMainContent(text) {
    // Remove casual particles and focus on main content
    let content = text
      .replace(/ちょっと|やっぱり|とりあえず/g, '')
      .replace(/だよね|じゃん|だっけ/g, '')
      .trim();
    
    return content;
  }

  /**
   * Identify the type of request being made
   */
  identifyRequestType(text) {
    if (/確認|チェック|見て/.test(text)) return 'verification';
    if (/教えて|聞きたい|質問/.test(text)) return 'information';
    if (/作って|やって|対応/.test(text)) return 'action';
    if (/送って|共有/.test(text)) return 'sharing';
    if (/会議|打ち合わせ|ミーティング/.test(text)) return 'meeting';
    if (/報告|連絡|お知らせ/.test(text)) return 'notification';
    return 'general';
  }

  /**
   * Extract important keywords that should be preserved
   */
  extractKeywords(text) {
    const businessKeywords = text.match(/会議|資料|プロジェクト|システム|データ|分析|売上|予算/g) || [];
    const technicalKeywords = text.match(/アプデ|バグ|デプロイ|API|サーバー|データベース/g) || [];
    const timeKeywords = text.match(/明日|今日|来週|月曜|火曜|水曜|木曜|金曜|土曜|日曜/g) || [];
    
    return {
      business: businessKeywords,
      technical: technicalKeywords,
      time: timeKeywords,
      all: [...businessKeywords, ...technicalKeywords, ...timeKeywords]
    };
  }

  /**
   * Detect emotional undertone
   */
  detectEmotionalTone(text) {
    if (/急|緊急|至急|ヤバい|マジで/.test(text)) return 'urgent';
    if (/ありがとう|感謝|助かる/.test(text)) return 'grateful';
    if (/すみません|申し訳|ごめん/.test(text)) return 'apologetic';
    if (/困って|問題|トラブル/.test(text)) return 'troubled';
    if (/よろしく|お願い/.test(text)) return 'requesting';
    return 'neutral';
  }

  /**
   * Plan the overall structure of the polite sentence
   */
  planSentenceStructure(components, context, level) {
    const structure = {
      greeting: this.selectGreeting(context),
      cushion: this.selectCushion(components, context, level),
      mainBody: this.transformMainContent(components, context, level),
      closing: this.selectClosing(components, context, level),
      additionalCourtesy: level >= 4 ? this.addCourtesyElements(context) : null
    };

    return structure;
  }

  /**
   * Select appropriate greeting based on context
   */
  selectGreeting(context) {
    if (!context || !context.timeContext) {
      return this.getRandomElement(this.expressions.greetings.general);
    }

    const timeGreetings = this.expressions.greetings[context.timeContext] || this.expressions.greetings.general;
    return this.getRandomElement(timeGreetings);
  }

  /**
   * Select appropriate cushion phrase
   */
  selectCushion(components, context, level) {
    if (level <= 2) return null;

    if (components.emotionalTone === 'urgent') {
      return this.getRandomElement(this.expressions.cushions.urgent);
    }

    if (context && context.relationship === 'superior') {
      return this.getRandomElement(this.expressions.cushions.superior);
    }

    if (components.requestType === 'action' || components.hasRequest) {
      return this.getRandomElement(this.expressions.cushions.request);
    }

    return this.getRandomElement(this.expressions.cushions.casual);
  }

  /**
   * Transform the main content with appropriate politeness
   */
  transformMainContent(components, context, level) {
    let content = components.mainContent;

    // Apply word-level transformations
    content = this.applyWordTransformations(content, context);
    
    // Apply phrase-level transformations
    content = this.applyPhraseTransformations(content, context, level);
    
    // Apply sentence-level adjustments
    content = this.applySentenceAdjustments(content, components, level);

    return content;
  }

  /**
   * Apply word-level transformations
   */
  applyWordTransformations(text, context) {
    const wordMappings = {
      'アプデ': 'アップデート',
      'バグ': '不具合',
      'チェック': 'ご確認',
      'やって': 'ご対応',
      'して': 'していただく',
      'マジで': '非常に',
      'ヤバい': '大変な状況'
    };

    let result = text;
    for (const [casual, polite] of Object.entries(wordMappings)) {
      result = result.replace(new RegExp(casual, 'g'), polite);
    }

    return result;
  }

  /**
   * Apply phrase-level transformations
   */
  applyPhraseTransformations(text, context, level) {
    let result = text;

    // Transform direct commands to polite requests
    result = result.replace(/確認して/g, level >= 4 ? 'ご確認いただけますでしょうか' : 'ご確認ください');
    result = result.replace(/教えて/g, level >= 3 ? 'お教えいただけませんでしょうか' : 'お教えください');
    result = result.replace(/送って/g, level >= 3 ? 'お送りいただけませんでしょうか' : 'お送りください');

    return result;
  }

  /**
   * Apply sentence-level adjustments
   */
  applySentenceAdjustments(text, components, level) {
    let result = text;

    // Ensure proper sentence endings
    if (!result.endsWith('。') && !result.endsWith('？') && !result.endsWith('です') && !result.endsWith('ます')) {
      if (components.hasQuestion) {
        result += level >= 3 ? 'でしょうか？' : 'ですか？';
      } else {
        result += level >= 3 ? 'いただけますでしょうか。' : 'お願いします。';
      }
    }

    return result;
  }

  /**
   * Select appropriate closing
   */
  selectClosing(components, context, level) {
    if (level <= 2) return null;

    if (components.hasQuestion) {
      return this.getRandomElement(this.expressions.closings.question);
    }

    if (components.emotionalTone === 'urgent') {
      return this.getRandomElement(this.expressions.closings.urgent);
    }

    if (components.emotionalTone === 'grateful') {
      return this.getRandomElement(this.expressions.closings.gratitude);
    }

    return this.getRandomElement(this.expressions.closings.request);
  }

  /**
   * Add additional courtesy elements for higher levels
   */
  addCourtesyElements(context) {
    const elements = [];
    
    if (Math.random() > 0.5) {
      elements.push('何かご不明な点がございましたら、お気軽にお声かけください。');
    }
    
    if (context && context.relationship === 'superior') {
      elements.push('ご多忙中にも関わらず、いつもありがとうございます。');
    }

    return elements.length > 0 ? elements.join(' ') : null;
  }

  /**
   * Assemble the final sentence from all components
   */
  assembleSentence(structure, context, level) {
    const parts = [];

    // Add greeting (for levels 3+)
    if (level >= 3 && structure.greeting) {
      parts.push(structure.greeting + '。');
    }

    // Add cushion phrase
    if (structure.cushion) {
      parts.push(structure.cushion + '、');
    }

    // Add main content
    parts.push(structure.mainBody);

    // Add closing
    if (structure.closing) {
      parts.push(structure.closing + '。');
    }

    // Add additional courtesy
    if (structure.additionalCourtesy) {
      parts.push(structure.additionalCourtesy);
    }

    // Join and clean up
    let result = parts.join(' ').replace(/\s+/g, ' ').trim();
    
    // Add emoji for level 4+
    if (level >= 4) {
      result = this.addEmoji(result, context);
    }

    return result;
  }

  /**
   * Add appropriate emoji for higher politeness levels
   */
  addEmoji(text, context) {
    const emojis = {
      request: ['🙏', '💦', '✨'],
      question: ['❓', '🤔', '💭'],
      urgent: ['⚡', '🔥', '💦'],
      grateful: ['😊', '🙏', '✨'],
      general: ['😊', '✨', '🌸']
    };

    const contextType = this.determineEmojiContext(text);
    const availableEmojis = emojis[contextType] || emojis.general;
    const selectedEmoji = this.getRandomElement(availableEmojis);

    return text + ' ' + selectedEmoji;
  }

  /**
   * Determine emoji context from text
   */
  determineEmojiContext(text) {
    if (/お願い|いただけ/.test(text)) return 'request';
    if (/でしょうか|ますか/.test(text)) return 'question';
    if (/急|至急|緊急/.test(text)) return 'urgent';
    if (/ありがとう|感謝/.test(text)) return 'grateful';
    return 'general';
  }

  /**
   * Generate multiple variations of the same text
   */
  generateVariations(originalText, context, baseLevel = 3) {
    const variations = [];

    // Generate different levels
    for (let level = 2; level <= 5; level++) {
      const variation = this.generatePoliteVersion(originalText, context, level);
      variations.push({
        level: level,
        text: variation,
        description: this.getLevelDescription(level),
        characteristics: this.getLevelCharacteristics(level)
      });
    }

    // Generate style variations for the same level
    const styleVariations = this.generateStyleVariations(originalText, context, baseLevel);
    variations.push(...styleVariations);

    return variations;
  }

  /**
   * Generate style variations (different approaches for same politeness level)
   */
  generateStyleVariations(originalText, context, level) {
    const variations = [];
    
    // Formal business style
    const businessContext = { ...context, situation: 'business', relationship: 'superior' };
    const businessVersion = this.generatePoliteVersion(originalText, businessContext, level);
    variations.push({
      level: level,
      text: businessVersion,
      description: 'ビジネス調',
      style: 'business'
    });

    // Friendly polite style
    const friendlyContext = { ...context, situation: 'casual', relationship: 'colleague' };
    const friendlyVersion = this.generatePoliteVersion(originalText, friendlyContext, level);
    variations.push({
      level: level, 
      text: friendlyVersion,
      description: '親しみやすい丁寧調',
      style: 'friendly'
    });

    return variations;
  }

  /**
   * Get description for politeness level
   */
  getLevelDescription(level) {
    const descriptions = {
      1: '基本的な丁寧語',
      2: '標準的な敬語',
      3: '丁寧で気遣いのある表現',
      4: '非常に丁寧で配慮深い表現',
      5: '最高レベルの敬語と絵文字付き'
    };
    return descriptions[level] || '標準';
  }

  /**
   * Get characteristics for each level
   */
  getLevelCharacteristics(level) {
    const characteristics = {
      1: ['です・ます調', '基本的な敬語'],
      2: ['クッション言葉', 'より丁寧な表現'],
      3: ['挨拶付き', '配慮表現', '適切な締め'],
      4: ['高度な敬語', '追加の気遣い', '絵文字'],
      5: ['最高敬語', '複数の配慮表現', '感情豊かな絵文字']
    };
    return characteristics[level] || [];
  }

  /**
   * Utility function to get random element from array
   */
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Analyze and provide improvement suggestions
   */
  analyzeSentenceQuality(originalText, generatedText, context) {
    const analysis = {
      improvements: [],
      strengths: [],
      suggestions: [],
      score: 0
    };

    // Check for politeness markers
    const politenessMarkers = ['お疲れ', 'いつもお世話', 'よろしく', 'ありがとう', 'すみません'];
    const hasMarkers = politenessMarkers.some(marker => generatedText.includes(marker));
    
    if (hasMarkers) {
      analysis.strengths.push('適切な挨拶・締めの言葉が含まれています');
      analysis.score += 20;
    } else {
      analysis.improvements.push('挨拶や締めの言葉を追加すると更に丁寧になります');
    }

    // Check for context appropriateness
    if (context && context.urgency === 'urgent' && generatedText.includes('急')) {
      analysis.strengths.push('緊急性が適切に表現されています');
      analysis.score += 15;
    }

    // Check sentence flow
    if (generatedText.length > originalText.length * 1.5) {
      analysis.strengths.push('元の文章より十分に丁寧な表現になりました');
      analysis.score += 25;
    }

    // Overall score calculation
    analysis.score = Math.min(100, analysis.score + 40); // Base score of 40

    return analysis;
  }
}

module.exports = SentenceGenerator;