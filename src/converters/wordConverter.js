/**
 * Word Converter - Intelligent word-level Japanese text conversion
 * Converts casual words and phrases to polite equivalents based on context
 */
class WordConverter {
  constructor() {
    // Load conversion data
    this.loadConversionData();
  }

  loadConversionData() {
    // In a real implementation, this would load from the JSON file
    // For now, we'll include the data directly
    this.conversionData = {
      words: {
        "アプデ": "アップデート",
        "バグ": "不具合", 
        "レス": "お返事",
        "リスケ": "スケジュール変更",
        "ググる": "検索する",
        "ヤバい": "大変な状況",
        "マジで": "非常に",
        "オッケー": "承知いたしました",
        "NG": "お受けできません",
        "チェック": "確認",
        "フィックス": "修正",
        "デバッグ": "不具合調査",
        "リリース": "公開",
        "デプロイ": "配置",
        "タスク": "作業",
        "アサイン": "担当指定",
        "アポ": "お約束",
        "ミーティング": "会議",
        "プレゼン": "発表",
        "レビュー": "確認",
        "フィードバック": "ご意見",
        "デッドライン": "期限",
        "スケジュール": "予定",
        "ステータス": "状況",
        "イシュー": "課題",
        "リクエスト": "ご依頼",
        "レスポンス": "お返事",
        "サポート": "支援",
        "ヘルプ": "お手伝い"
      },
      phrases: {
        "やって": "やっていただけませんか",
        "して": "していただけませんか",
        "確認して": "ご確認いただけますでしょうか", 
        "チェックして": "お確かめいただけますでしょうか",
        "教えて": "教えていただけませんか",
        "送って": "お送りいただけませんか",
        "作って": "作成していただけませんか",
        "修正して": "修正していただけませんか",
        "対応して": "ご対応いただけませんか",
        "見て": "ご覧いただけませんか",
        "読んで": "お読みいただけませんか",
        "連絡して": "ご連絡いただけませんか",
        "報告して": "ご報告いただけませんか",
        "手伝って": "お手伝いいただけませんか",
        "待って": "お待ちいただけませんか",
        "変更して": "変更していただけませんか",
        "更新して": "更新していただけませんか"
      },
      contextual: {
        business: {
          "やって": "お忙しい中恐縮ですが、対応していただけますでしょうか",
          "確認して": "お時間のある際に、ご確認いただけると助かります",
          "教えて": "もしよろしければ、教えていただけませんでしょうか"
        },
        urgent: {
          "やって": "急ぎで恐縮ですが、対応していただけませんでしょうか", 
          "確認して": "至急確認していただけますでしょうか",
          "教えて": "緊急でお聞きしたいことがあるのですが"
        },
        superior: {
          "やって": "お忙しい中申し訳ございませんが、対応していただけますでしょうか",
          "確認して": "恐れ入りますが、ご確認いただけますでしょうか", 
          "教えて": "不躾な質問で申し訳ございませんが、教えていただけませんでしょうか"
        }
      }
    };
  }

  /**
   * Convert text with intelligent word and phrase replacement
   */
  convertText(text, context) {
    let convertedText = text;
    const conversions = [];

    // First pass: Convert individual words
    convertedText = this.convertWords(convertedText, conversions);
    
    // Second pass: Convert phrases based on context
    convertedText = this.convertPhrases(convertedText, context, conversions);
    
    // Third pass: Handle special patterns
    convertedText = this.handleSpecialPatterns(convertedText, context, conversions);

    return {
      text: convertedText,
      conversions: conversions,
      originalLength: text.length,
      convertedLength: convertedText.length
    };
  }

  /**
   * Convert individual casual words to polite equivalents
   */
  convertWords(text, conversions) {
    let result = text;
    
    for (const [casual, polite] of Object.entries(this.conversionData.words)) {
      const regex = new RegExp(casual, 'g');
      if (regex.test(result)) {
        const matches = result.match(regex);
        result = result.replace(regex, polite);
        
        conversions.push({
          type: 'word',
          original: casual,
          converted: polite,
          count: matches ? matches.length : 0,
          reason: 'カジュアルな表現を丁寧な言葉に変換'
        });
      }
    }
    
    return result;
  }

  /**
   * Convert phrases based on context
   */
  convertPhrases(text, context, conversions) {
    let result = text;
    
    // Choose appropriate phrase conversion based on context
    let phraseSet = this.conversionData.phrases;
    
    if (context && context.situation === 'business' && this.conversionData.contextual.business) {
      phraseSet = { ...phraseSet, ...this.conversionData.contextual.business };
    }
    
    if (context && context.urgency === 'urgent' && this.conversionData.contextual.urgent) {
      phraseSet = { ...phraseSet, ...this.conversionData.contextual.urgent };
    }
    
    if (context && context.relationship === 'superior' && this.conversionData.contextual.superior) {
      phraseSet = { ...phraseSet, ...this.conversionData.contextual.superior };
    }

    // Apply phrase conversions
    for (const [casual, polite] of Object.entries(phraseSet)) {
      const regex = new RegExp(casual, 'g');
      if (regex.test(result)) {
        const matches = result.match(regex);
        result = result.replace(regex, polite);
        
        conversions.push({
          type: 'phrase',
          original: casual,
          converted: polite,
          count: matches ? matches.length : 0,
          reason: '直接的な表現を丁寧な依頼形に変換',
          context: context ? `${context.situation || ''} / ${context.urgency || ''} / ${context.relationship || ''}` : ''
        });
      }
    }
    
    return result;
  }

  /**
   * Handle special patterns and edge cases
   */
  handleSpecialPatterns(text, context, conversions) {
    let result = text;
    
    // Pattern 1: Questions ending with だっけ？
    result = result.replace(/(.+)だっけ？/g, (match, content) => {
      conversions.push({
        type: 'pattern',
        original: match,
        converted: `${content}でしたでしょうか？`,
        reason: 'カジュアルな疑問文を丁寧な表現に変換'
      });
      return `${content}でしたでしょうか？`;
    });

    // Pattern 2: Casual sentence endings
    result = result.replace(/(.+)じゃん/g, (match, content) => {
      const polite = `${content}ですね`;
      conversions.push({
        type: 'pattern',
        original: match,
        converted: polite,
        reason: 'カジュアルな文末を丁寧語に変換'
      });
      return polite;
    });

    // Pattern 3: だよね pattern
    result = result.replace(/(.+)だよね/g, (match, content) => {
      const polite = `${content}ですよね`;
      conversions.push({
        type: 'pattern', 
        original: match,
        converted: polite,
        reason: 'カジュアルな同意表現を丁寧語に変換'
      });
      return polite;
    });

    // Pattern 4: って言って pattern
    result = result.replace(/(.+)って言って/g, (match, content) => {
      const polite = `${content}とお伝えください`;
      conversions.push({
        type: 'pattern',
        original: match,
        converted: polite,
        reason: 'カジュアルな伝言表現を丁寧語に変換'
      });
      return polite;
    });

    // Pattern 5: なんで？ why questions
    result = result.replace(/なんで(.+)？/g, (match, content) => {
      const polite = `なぜ${content}のでしょうか？`;
      conversions.push({
        type: 'pattern',
        original: match,
        converted: polite,
        reason: 'カジュアルな質問を丁寧な疑問文に変換'
      });
      return polite;
    });

    // Pattern 6: Simple command forms
    result = result.replace(/^([ぁ-んァ-ヶー]+)$/g, (match) => {
      if (match.endsWith('して') || match.endsWith('やって')) {
        // Already handled in phrase conversion
        return match;
      }
      
      const polite = `${match}をお願いします`;
      conversions.push({
        type: 'pattern',
        original: match,
        converted: polite,
        reason: '簡潔すぎる表現に丁寧な依頼形を追加'
      });
      return polite;
    });

    return result;
  }

  /**
   * Get conversion suggestions for improvement
   */
  getSuggestions(text, context) {
    const suggestions = [];
    
    // Check for missed casual words
    const casualWords = this.findCasualWords(text);
    if (casualWords.length > 0) {
      suggestions.push({
        type: 'improvement',
        message: `以下のカジュアルな表現が残っています: ${casualWords.join(', ')}`,
        words: casualWords
      });
    }

    // Check for abrupt tone
    if (this.isAbrupt(text)) {
      suggestions.push({
        type: 'tone',
        message: '文章がやや直接的です。クッション言葉を追加することをお勧めします。',
        examples: ['お忙しい中恐縮ですが', 'もしよろしければ', 'お時間のある時に']
      });
    }

    // Context-specific suggestions
    if (context) {
      if (context.urgency === 'urgent' && !text.includes('急') && !text.includes('至急')) {
        suggestions.push({
          type: 'urgency',
          message: '緊急性を示す表現を追加することをお勧めします。',
          examples: ['急ぎで恐縮ですが', '至急お願いしたいのですが']
        });
      }

      if (context.relationship === 'superior' && !text.includes('恐れ入り') && !text.includes('申し訳')) {
        suggestions.push({
          type: 'relationship',
          message: '上司への敬意を示す表現を追加することをお勧めします。',
          examples: ['恐れ入りますが', '申し訳ございませんが', 'お忙しい中申し訳ございませんが']
        });
      }
    }

    return suggestions;
  }

  /**
   * Find remaining casual words in text
   */
  findCasualWords(text) {
    const casualWords = [];
    
    // Check for words in our dictionary
    for (const casual of Object.keys(this.conversionData.words)) {
      if (text.includes(casual)) {
        casualWords.push(casual);
      }
    }

    // Check for other common casual patterns
    const patterns = [
      /やっぱり/, /やっぱ/, /てか/, /というか/, /つーか/, /まじ/, /やばい/,
      /すげー/, /でかい/, /ちっちゃい/, /うざい/, /むかつく/, /だりー/
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        casualWords.push(...matches);
      }
    });

    return [...new Set(casualWords)]; // Remove duplicates
  }

  /**
   * Check if text tone is too abrupt
   */
  isAbrupt(text) {
    // Check for lack of politeness markers
    const politenessMarkers = [
      /お疲れ/, /よろしく/, /ありがとう/, /すみません/, /恐縮/, /失礼/,
      /お忙しい/, /恐れ入り/, /申し訳/, /いつもお世話/
    ];

    const hasMarkers = politenessMarkers.some(pattern => pattern.test(text));
    
    // Check for direct command patterns
    const directCommands = [
      /^[やして]/, /^確認/, /^送/, /^作/, /^修正/, /^対応/
    ];

    const hasDirectCommands = directCommands.some(pattern => pattern.test(text));

    return !hasMarkers && (hasDirectCommands || text.length < 15);
  }

  /**
   * Generate multiple conversion variations
   */
  generateVariations(text, context, level = 2) {
    const variations = [];
    
    // Base conversion
    const baseConversion = this.convertText(text, context);
    variations.push({
      level: level,
      text: baseConversion.text,
      type: 'standard',
      description: '標準的な丁寧語変換'
    });

    // More formal version
    const formalContext = { ...context, relationship: 'superior' };
    const formalConversion = this.convertText(text, formalContext);
    variations.push({
      level: level + 1,
      text: formalConversion.text,
      type: 'formal',
      description: 'より敬語を重視した変換'
    });

    // Casual-polite version  
    const casualPoliteContext = { ...context, situation: 'casual' };
    const casualPoliteConversion = this.convertText(text, casualPoliteContext);
    variations.push({
      level: level - 1,
      text: casualPoliteConversion.text,
      type: 'casual-polite',
      description: '親しみやすさを残した丁寧な変換'
    });

    return variations;
  }
}

module.exports = WordConverter;