// Main application logic for the renderer process
// Check if we're in Electron environment
const isElectron = typeof window !== 'undefined' && window.electronAPI;

// Enhanced Intelligent Conversion Engine
class EnhancedConversionEngine {
  constructor() {
    this.contextAnalyzer = new ContextAnalyzer();
    this.wordConverter = new WordConverter();
    this.sentenceGenerator = new SentenceGenerator();
    this.conversionHistory = [];
  }

  async convertText(originalText, options = {}) {
    const startTime = Date.now();
    
    try {
      // Step 1: Analyze context
      const context = this.contextAnalyzer.analyzeContext(originalText);
      
      // Step 2: Determine target politeness level
      const targetLevel = this.determineTargetLevel(context, options);
      
      // Step 3: Generate conversion
      const conversion = this.generateConversion(originalText, context, targetLevel);
      
      // Step 4: Generate suggestions
      const suggestions = this.generateSuggestions(originalText, conversion, context);
      
      const processingTime = Date.now() - startTime;
      
      return {
        original: originalText,
        converted: conversion.text,
        context: context,
        level: conversion.level,
        suggestions: suggestions,
        analysis: {
          processingTime: processingTime,
          confidence: conversion.confidence || 0.85,
          improvements: this.analyzeImprovements(originalText, conversion.text)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          engine: 'enhanced-v2.1',
          version: '2.1.0',
          features: ['context-analysis', 'word-conversion', 'sentence-generation', 'complete-polite-unification']
        }
      };
      
    } catch (error) {
      console.error('Conversion error:', error);
      return this.createFallbackResponse(originalText, error);
    }
  }

  determineTargetLevel(context, options) {
    if (options.level && options.level >= 1 && options.level <= 5) {
      return options.level;
    }

    let targetLevel = 3;

    if (context.relationship === 'superior') {
      targetLevel = Math.max(targetLevel, 4);
    }
    if (context.urgency === 'urgent') {
      targetLevel = Math.max(targetLevel, 3);
    }
    if (context.situation === 'business') {
      targetLevel = Math.max(targetLevel, 3);
    }
    if (context.formalityLevel === 'very-casual') {
      targetLevel = Math.max(targetLevel, 4);
    }

    return Math.min(5, targetLevel);
  }

  generateConversion(originalText, context, targetLevel) {
    // Use word-level conversion first
    const wordConversion = this.wordConverter.convertText(originalText, context);
    
    // Then enhance with sentence generation
    const enhancedText = this.sentenceGenerator.generatePoliteVersion(originalText, context, targetLevel);
    
    return {
      text: enhancedText,
      level: targetLevel,
      confidence: 0.90,
      approach: 'enhanced-intelligent'
    };
  }

  generateSuggestions(originalText, conversion, context) {
    const suggestions = [];

    if (context.needsImprovement.needsImprovement) {
      context.needsImprovement.issues.forEach(issue => {
        switch(issue) {
          case 'casual_language':
            suggestions.push('カジュアルな表現をより丁寧な言葉に変換しました');
            break;
          case 'lacks_politeness_markers':
            suggestions.push('挨拶や締めの言葉を追加しました');
            break;
          case 'too_brief':
            suggestions.push('適切な詳しさの説明を加えました');
            break;
          case 'too_direct':
            suggestions.push('直接的な表現を柔らかい依頼形に変更しました');
            break;
        }
      });
    }

    if (conversion.level >= 4) {
      suggestions.push('絵文字を追加してより温かみのある表現にしました');
    }

    return suggestions;
  }

  analyzeImprovements(originalText, convertedText) {
    const improvements = [];

    if (convertedText.length > originalText.length * 1.3) {
      improvements.push('文章が十分に丁寧な長さになりました');
    }

    const politenessMarkers = ['お疲れ', 'よろしく', 'ありがとう', 'すみません'];
    const addedMarkers = politenessMarkers.filter(marker => 
      !originalText.includes(marker) && convertedText.includes(marker)
    );
    if (addedMarkers.length > 0) {
      improvements.push(`丁寧な表現を追加: ${addedMarkers.join(', ')}`);
    }

    return improvements;
  }

  createFallbackResponse(originalText, error) {
    return {
      original: originalText,
      converted: this.basicConvert(originalText, 2),
      context: { intent: 'unknown', urgency: 'normal' },
      level: 2,
      suggestions: ['システムエラーが発生しました。基本的な変換を適用しました。'],
      analysis: { processingTime: 0, confidence: 0.3, improvements: [] },
      metadata: { timestamp: new Date().toISOString(), engine: 'fallback' }
    };
  }

  basicConvert(text, level) {
    switch(level) {
      case 1: return text + 'です。';
      case 2: return `お疲れ様です。${text}。よろしくお願いします。`;
      case 3: return `いつもお世話になっております。${text}。どうぞよろしくお願いいたします。`;
      case 4: return `いつもお世話になっております😊 ${text}✨ よろしくお願いいたします🙏`;
      case 5: return `🌸いつもお世話になっております😊💕 ${text}✨🌟 心より感謝いたします🙏💖`;
      default: return text;
    }
  }
}

// Context Analyzer (Simplified for browser)
class ContextAnalyzer {
  analyzeContext(text) {
    const intent = this.analyzeIntent(text);
    const urgency = this.detectUrgency(text);
    const relationship = this.estimateRelationship(text);
    const situation = this.detectSituation(text);
    const formalityLevel = this.assessFormality(text);

    return {
      intent,
      urgency, 
      relationship,
      situation,
      formalityLevel,
      needsImprovement: this.needsImprovement(text)
    };
  }

  analyzeIntent(text) {
    if (/して|やって|お願い|確認|チェック/.test(text)) return 'request';
    if (/\?|？|どう|いかが|どこ|いつ/.test(text)) return 'question';
    if (/報告|お知らせ|完了|終了/.test(text)) return 'report';
    if (/すみません|申し訳|ごめん/.test(text)) return 'apology';
    return 'general';
  }

  detectUrgency(text) {
    if (/急|緊急|至急|今すぐ|ヤバい|マジで/.test(text)) return 'urgent';
    if (/ゆっくり|のんびり|後で|今度/.test(text)) return 'relaxed';
    return 'normal';
  }

  estimateRelationship(text) {
    if (/部長|課長|社長|お疲れ様|恐れ入り/.test(text)) return 'superior';
    if (/さん|君|よろしく|一緒に/.test(text)) return 'colleague';
    if (/お客|ご利用|サービス/.test(text)) return 'customer';
    return 'unknown';
  }

  detectSituation(text) {
    if (/会議|資料|企画|プロジェクト|売上/.test(text)) return 'business';
    if (/システム|アプリ|サーバー|バグ/.test(text)) return 'technical';
    if (/飲み|ランチ|休憩|趣味/.test(text)) return 'casual';
    return 'general';
  }

  assessFormality(text) {
    let score = 0;
    if (/です|ます|ございます|いただき/.test(text)) score += 2;
    if (/だよ|だね|じゃん|やつ|マジで/.test(text)) score -= 3;
    
    if (score >= 3) return 'very-formal';
    if (score >= 1) return 'formal';
    if (score >= -2) return 'neutral';
    if (score >= -5) return 'casual';
    return 'very-casual';
  }

  needsImprovement(text) {
    const issues = [];
    
    const casualWords = ['アプデ', 'バグ', 'やって', 'して', 'マジで', 'いい感じ', 'どう', 'OK', 'オッケー', 'わかった', 'できた', 'やばい', 'すげー', 'だめ'];
    if (casualWords.some(word => text.includes(word))) {
      issues.push('casual_language');
    }
    
    if (!text.includes('お疲れ') && !text.includes('よろしく') && 
        !text.includes('ありがとう') && !text.includes('すみません')) {
      issues.push('lacks_politeness_markers');
    }
    
    if (text.length < 10) {
      issues.push('too_brief');
    }
    
    if (/^[やして]/.test(text)) {
      issues.push('too_direct');
    }

    return {
      needsImprovement: issues.length > 0,
      issues: issues,
      severity: issues.length >= 3 ? 'high' : issues.length >= 1 ? 'medium' : 'low'
    };
  }
}

// Word Converter (Simplified for browser)
class WordConverter {
  constructor() {
    this.conversionData = {
      words: {
        "アプデ": "アップデート", "バグ": "不具合", "レス": "お返事",
        "リスケ": "スケジュール変更", "ググる": "検索する", "ヤバい": "大変な状況",
        "マジで": "非常に", "オッケー": "承知いたしました", "NG": "お受けできません",
        "チェック": "確認", "やって": "対応", "して": "していただく",
        "いい感じ": "良好な状況", "どう": "いかが", "大丈夫": "問題ございません",
        "わかった": "承知いたしました", "できた": "完了いたしました", "終わった": "終了いたしました",
        "OK": "承知いたしました", "すげー": "非常に", "やばい": "大変な", "だめ": "いけません"
      },
      phrases: {
        "やって": "やっていただけませんか", "して": "していただけませんか",
        "確認して": "ご確認いただけますでしょうか", "教えて": "教えていただけませんか",
        "送って": "お送りいただけませんか", "作って": "作成していただけませんか"
      }
    };
  }

  convertText(text, context) {
    let convertedText = text;
    const conversions = [];

    // Convert words
    for (const [casual, polite] of Object.entries(this.conversionData.words)) {
      if (convertedText.includes(casual)) {
        convertedText = convertedText.replace(new RegExp(casual, 'g'), polite);
        conversions.push({ type: 'word', original: casual, converted: polite });
      }
    }

    // Convert phrases
    for (const [casual, polite] of Object.entries(this.conversionData.phrases)) {
      if (convertedText.includes(casual)) {
        convertedText = convertedText.replace(new RegExp(casual, 'g'), polite);
        conversions.push({ type: 'phrase', original: casual, converted: polite });
      }
    }

    return { text: convertedText, conversions: conversions };
  }
}

// Sentence Generator (Simplified for browser)
class SentenceGenerator {
  generatePoliteVersion(originalText, context, level = 3) {
    const components = this.analyzeTextComponents(originalText);
    return this.assembleSentence(components, context, level);
  }

  analyzeTextComponents(text) {
    return {
      mainContent: text.replace(/ちょっと|やっぱり|とりあえず/g, '').trim(),
      hasQuestion: text.includes('？') || text.includes('?'),
      hasRequest: /して|やって|お願い/.test(text),
      emotionalTone: this.detectEmotionalTone(text)
    };
  }

  detectEmotionalTone(text) {
    if (/急|緊急|至急|ヤバい|マジで/.test(text)) return 'urgent';
    if (/ありがとう|感謝|助かる/.test(text)) return 'grateful';
    if (/すみません|申し訳|ごめん/.test(text)) return 'apologetic';
    return 'neutral';
  }

  assembleSentence(components, context, level) {
    const parts = [];

    // Add greeting for levels 3+
    if (level >= 3) {
      const greetings = ['いつもお世話になっております', 'お疲れ様です', '恐れ入ります'];
      parts.push(greetings[Math.floor(Math.random() * greetings.length)] + '。');
    }

    // Add cushion for urgent/business context
    if (components.emotionalTone === 'urgent' || context.situation === 'business') {
      const cushions = ['お忙しい中恐縮ですが', '急ぎで申し訳ございませんが', '恐れ入りますが'];
      parts.push(cushions[Math.floor(Math.random() * cushions.length)] + '、');
    }

    // Main content with transformations
    let mainContent = this.transformMainContent(components.mainContent, context, level);
    parts.push(mainContent);

    // Add closing
    if (level >= 3) {
      const closings = ['よろしくお願いいたします', 'ご検討のほどよろしくお願いします'];
      parts.push(closings[Math.floor(Math.random() * closings.length)] + '。');
    }

    let result = parts.join(' ').replace(/\s+/g, ' ').trim();

    // Add emoji for level 4+
    if (level >= 4) {
      result = this.addEmoji(result, components.emotionalTone);
    }

    return result;
  }

  transformMainContent(content, context, level) {
    let result = content;

    // Transform common patterns
    result = result.replace(/確認して/g, level >= 4 ? 'ご確認いただけますでしょうか' : 'ご確認ください');
    result = result.replace(/教えて/g, level >= 3 ? 'お教えいただけませんでしょうか' : 'お教えください');
    result = result.replace(/やって/g, level >= 3 ? 'ご対応いただけませんでしょうか' : 'お願いします');
    
    // Transform casual expressions to polite
    result = result.replace(/いい感じ\?/g, 'いかがでしょうか？');
    result = result.replace(/いい感じ？/g, 'いかがでしょうか？');
    result = result.replace(/どう\?/g, 'いかがでしょうか？');
    result = result.replace(/どう？/g, 'いかがでしょうか？');
    result = result.replace(/大丈夫\?/g, '問題ございませんでしょうか？');
    result = result.replace(/大丈夫？/g, '問題ございませんでしょうか？');
    result = result.replace(/オッケー\?/g, 'よろしいでしょうか？');
    result = result.replace(/オッケー？/g, 'よろしいでしょうか？');
    result = result.replace(/OK\?/g, 'よろしいでしょうか？');
    result = result.replace(/OK？/g, 'よろしいでしょうか？');
    result = result.replace(/わかった\?/g, 'ご理解いただけましたでしょうか？');
    result = result.replace(/わかった？/g, 'ご理解いただけましたでしょうか？');
    result = result.replace(/できた\?/g, '完了いたしましたでしょうか？');
    result = result.replace(/できた？/g, '完了いたしましたでしょうか？');
    result = result.replace(/終わった\?/g, '終了いたしましたでしょうか？');
    result = result.replace(/終わった？/g, '終了いたしましたでしょうか？');

    // Ensure proper sentence ending
    if (!result.endsWith('。') && !result.endsWith('？') && !result.endsWith('です') && !result.endsWith('ます')) {
      result += level >= 3 ? 'いただけますでしょうか。' : 'お願いします。';
    }

    return result;
  }

  addEmoji(text, emotionalTone) {
    const emojiSets = {
      urgent: ['⚡', '🔥', '💦'],
      grateful: ['😊', '🙏', '✨'],
      apologetic: ['🙏', '💦', '😅'],
      neutral: ['😊', '✨', '🌸']
    };

    const emojis = emojiSets[emotionalTone] || emojiSets.neutral;
    const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    return text + ' ' + selectedEmoji;
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const engine = new EnhancedConversionEngine();
  
  // Display version info in console
  console.log('🌸 Japanese Gentle Converter v2.1 🌸');
  console.log('🧠 Enhanced Intelligent Conversion System');
  console.log('✅ Features: Context Analysis, Complete Polite Unification, Natural Sentence Generation');
  console.log('📅 Built:', new Date().toLocaleDateString('ja-JP'));
  
  // Get DOM elements
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  const levelSlider = document.getElementById('levelSlider');
  const levelValue = document.getElementById('levelValue');
  const convertBtn = document.querySelector('.convert-btn');
  const copyBtn = document.getElementById('copyBtn');
  const setDefaultBtn = document.getElementById('setDefaultBtn');
  const resetDefaultBtn = document.getElementById('resetDefaultBtn');
  const defaultLevelInfo = document.getElementById('defaultLevelInfo');
  
  // Initialize default level
  function initializeDefaultLevel() {
    const savedDefault = localStorage.getItem('defaultLevel');
    if (savedDefault) {
      const level = parseInt(savedDefault);
      levelSlider.value = level;
      levelValue.textContent = level;
      defaultLevelInfo.textContent = `📌 デフォルトレベル: ${level} に設定済み`;
    }
  }
  
  // Update level display
  levelSlider.addEventListener('input', function() {
    levelValue.textContent = this.value;
  });
  
  // Set default level
  setDefaultBtn.addEventListener('click', function() {
    const currentLevel = parseInt(levelSlider.value);
    localStorage.setItem('defaultLevel', currentLevel);
    defaultLevelInfo.textContent = `📌 デフォルトレベル: ${currentLevel} に設定しました！`;
    defaultLevelInfo.style.color = '#28a745';
    
    setTimeout(() => {
      defaultLevelInfo.textContent = `📌 デフォルトレベル: ${currentLevel} に設定済み`;
    }, 2000);
  });
  
  // Reset default level
  resetDefaultBtn.addEventListener('click', function() {
    localStorage.removeItem('defaultLevel');
    levelSlider.value = 3;
    levelValue.textContent = 3;
    defaultLevelInfo.textContent = '🔄 デフォルトレベルをリセットしました';
    defaultLevelInfo.style.color = '#dc3545';
    
    setTimeout(() => {
      defaultLevelInfo.textContent = '';
    }, 2000);
  });
  
  // Convert text - AI Enhanced Version
  window.convertText = async function() {
    const text = inputText.value.trim();
    const level = parseInt(levelSlider.value);
    
    if (!text) {
      alert('変換したい文章を入力してください。');
      return;
    }
    
    try {
      let result;
      
      // Use AI conversion if available
      if (window.aiEngine && window.aiEngine.isAIEnabled) {
        console.log('🤖 Using AI conversion...');
        result = await window.aiEngine.convertText(text, { level: level });
      } else if (window.electronAPI) {
        console.log('🖥️ Using Electron conversion...');
        result = await window.electronAPI.convertText(text, level);
      } else {
        console.log('🔄 Using fallback conversion...');
        result = await engine.convertText(text, { level: level });
      }
      
      outputText.value = result.converted;
      copyBtn.style.display = 'inline-block';
      
      // Show suggestions if available
      if (result.suggestions && result.suggestions.length > 0) {
        console.log('改善提案:', result.suggestions);
        // Could add UI to display suggestions in the future
      }
      
      // Log analysis for debugging
      if (result.analysis) {
        console.log('分析結果:', {
          処理時間: result.analysis.processingTime + 'ms',
          信頼度: Math.round(result.analysis.confidence * 100) + '%',
          改善点: result.analysis.improvements,
          エンジン: result.metadata?.engine || 'unknown'
        });
      }
      
      // Show AI feedback panel if using AI
      if (window.aiEngine && result.provider !== 'fallback') {
        setTimeout(() => {
          if (window.aiEngine.showFeedbackPanel) {
            window.aiEngine.showFeedbackPanel(result);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('変換に失敗しました。');
    }
  };
  
  // Copy to clipboard
  async function copyToClipboard() {
    const text = outputText.value;
    
    try {
      if (window.electronAPI) {
        await window.electronAPI.setClipboard(text);
      } else {
        await navigator.clipboard.writeText(text);
      }
      
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ コピーしました！';
      copyBtn.style.background = '#218838';
      
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '#28a745';
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('コピーに失敗しました。');
    }
  }
  
  // Event listeners
  convertBtn.addEventListener('click', convertText);
  copyBtn.addEventListener('click', copyToClipboard);
  
  // Initialize default level on page load
  initializeDefaultLevel();
  
  // Global paste function
  async function globalPaste() {
    try {
      // Try to read from clipboard
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        inputText.value = text;
        inputText.focus();
        return true;
      }
    } catch (error) {
      console.log('Clipboard access failed, falling back to focus method');
    }
    
    // Fallback: focus input and let browser handle paste
    inputText.focus();
    inputText.select();
    return false;
  }

  // Global copy function
  async function globalCopy() {
    if (!outputText.value) {
      alert('変換結果がありません。先に変換を実行してください。');
      return false;
    }
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(outputText.value);
        showCopyFeedback();
        return true;
      }
    } catch (error) {
      console.log('Clipboard write failed, falling back to selection method');
    }
    
    // Fallback: select output text
    outputText.focus();
    outputText.select();
    try {
      document.execCommand('copy');
      showCopyFeedback();
      return true;
    } catch (error) {
      alert('コピーに失敗しました。手動でコピーしてください。');
      return false;
    }
  }

  // Show copy feedback
  function showCopyFeedback() {
    // Update copy button if visible
    if (copyBtn.style.display !== 'none') {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ コピーしました！';
      copyBtn.style.background = '#218838';
      
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '#28a745';
      }, 2000);
    } else {
      // Show temporary notification
      const notification = document.createElement('div');
      notification.textContent = '✅ 変換結果をコピーしました！';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
      `;
      
      // Add animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 3000);
    }
  }

  // Global keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter: Convert text
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      convertText();
    }
    
    // Ctrl/Cmd + V: Global paste to input
    if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
      // Only prevent default if we're not in an input field that should handle paste naturally
      if (document.activeElement !== inputText && 
          document.activeElement.tagName !== 'INPUT' && 
          document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        globalPaste();
      }
    }
    
    // Ctrl/Cmd + C: Global copy from output
    if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
      // Only prevent default if we're not in a field with selected text
      const hasSelection = window.getSelection().toString().length > 0;
      const isInInputField = document.activeElement.tagName === 'INPUT' || 
                           document.activeElement.tagName === 'TEXTAREA';
      
      if (!hasSelection && (!isInInputField || document.activeElement === outputText)) {
        e.preventDefault();
        globalCopy();
      }
    }
    
    // Escape: Clear focus
    if (e.key === 'Escape') {
      document.activeElement.blur();
    }
  });
  
  // Input field specific shortcuts
  inputText.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter: Convert
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      convertText();
    }
    
    // Ctrl/Cmd + A: Select all in input
    if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
      // Let browser handle this naturally
    }
  });
  
  // Output field specific shortcuts
  outputText.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + C: Copy output
    if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      copyToClipboard();
    }
    
    // Ctrl/Cmd + A: Select all in output
    if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      outputText.select();
    }
  });
  
  // Auto-focus input on page load
  inputText.focus();
});

// Export for CommonJS if available, otherwise assign to window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnhancedConversionEngine, ContextAnalyzer, WordConverter, SentenceGenerator };
} else {
  window.EnhancedConversionEngine = EnhancedConversionEngine;
  window.ContextAnalyzer = ContextAnalyzer;
  window.WordConverter = WordConverter;
  window.SentenceGenerator = SentenceGenerator;
}