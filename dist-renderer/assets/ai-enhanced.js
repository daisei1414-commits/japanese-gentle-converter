/**
 * AI-Enhanced Japanese Gentle Converter
 * Browser-optimized version with LLM integration and advanced features
 */

// Load required AI modules with fallback
const modules = {};

try {
  // Try to load modules (in production, these would be bundled)
  if (typeof window !== 'undefined') {
    // Browser environment - modules loaded via script tags
    modules.LLMProvider = window.LLMProvider || class { isAvailable() { return false; } };
    modules.PromptEngineer = window.PromptEngineer || class { buildConversionPrompt() { return { prompt: '', metadata: {} }; } };
    modules.AITextConverter = window.AITextConverter || null;
    modules.QualityAssessment = window.QualityAssessment || class { async assessConversion() { return { overall: 0.5, scores: {}, details: {} }; } };
    modules.FeedbackLearning = window.FeedbackLearning || class { collectFeedback() {} };
    modules.RealTimeConverter = window.RealTimeConverter || null;
  }
} catch (error) {
  console.warn('Some AI modules failed to load, using fallback modes');
}

/**
 * Enhanced Conversion Engine with AI Integration
 */
class AIEnhancedConversionEngine {
  constructor() {
    this.initializeComponents();
    this.setupFallbackMode();
    this.setupUIIntegration();
    
    console.log('🤖 AI-Enhanced Conversion Engine initialized');
  }

  initializeComponents() {
    try {
      // Initialize AI components if available
      if (modules.AITextConverter) {
        this.aiConverter = new modules.AITextConverter();
        this.realTimeConverter = new modules.RealTimeConverter(this.aiConverter);
        this.isAIEnabled = true;
      } else {
        this.isAIEnabled = false;
      }
      
      this.feedbackLearning = new modules.FeedbackLearning();
      
      // Initialize legacy converter as fallback
      this.legacyConverter = new EnhancedConversionEngine(); // From existing code
      
    } catch (error) {
      console.warn('AI components initialization failed:', error);
      this.isAIEnabled = false;
      this.setupFallbackMode();
    }
  }

  setupFallbackMode() {
    if (!this.isAIEnabled) {
      console.log('🔄 Running in fallback mode (rule-based conversion)');
      this.realTimeConverter = {
        convertWithDebounce: (text, options, callbacks) => {
          setTimeout(async () => {
            try {
              const result = await this.legacyConverter.convertText(text, options);
              if (callbacks.onSuccess) callbacks.onSuccess(result);
            } catch (error) {
              if (callbacks.onError) callbacks.onError(error);
            }
          }, 800);
        }
      };
    }
  }

  setupUIIntegration() {
    // Add AI status indicator to UI
    this.addAIStatusIndicator();
    
    // Add API key configuration UI
    this.addAPIKeyConfiguration();
    
    // Add feedback UI components
    this.addFeedbackUI();
    
    // Add real-time conversion indicators
    this.addRealTimeIndicators();
  }

  /**
   * Main conversion method with AI/fallback logic
   */
  async convertText(originalText, options = {}) {
    const startTime = Date.now();
    
    try {
      // Use AI conversion if available
      if (this.isAIEnabled && this.aiConverter) {
        const result = await this.aiConverter.convertText(originalText, options);
        this.handleConversionSuccess(result, 'ai');
        return result;
      } else {
        // Use legacy conversion
        const result = await this.legacyConverter.convertText(originalText, options);
        this.handleConversionSuccess(result, 'legacy');
        return result;
      }
      
    } catch (error) {
      console.error('Conversion failed:', error);
      return this.handleConversionError(originalText, options, error);
    }
  }

  /**
   * Real-time conversion with debouncing
   */
  convertWithRealTime(text, options, callbacks) {
    if (this.realTimeConverter) {
      this.realTimeConverter.convertWithDebounce(text, options, {
        onTyping: () => this.showTypingIndicator(),
        onProgress: (progress) => this.updateProgressBar(progress),
        onSuccess: (result) => {
          this.hideTypingIndicator();
          this.hideProgressBar();
          if (callbacks.onSuccess) callbacks.onSuccess(result);
        },
        onError: (error) => {
          this.hideTypingIndicator();
          this.hideProgressBar();
          if (callbacks.onError) callbacks.onError(error);
        }
      });
    }
  }

  /**
   * Handle successful conversion
   */
  handleConversionSuccess(result, engine) {
    // Update AI status
    this.updateAIStatus(engine === 'ai' ? 'active' : 'fallback');
    
    // Show quality indicators
    if (result.quality) {
      this.showQualityIndicators(result.quality);
    }
    
    // Update performance metrics
    this.updatePerformanceDisplay(result.analysis);
  }

  /**
   * Handle conversion error
   */
  handleConversionError(originalText, options, error) {
    this.updateAIStatus('error');
    
    // Create fallback result
    return {
      original: originalText,
      converted: this.basicFallbackConversion(originalText, options.level || 2),
      provider: 'fallback',
      confidence: 0.3,
      error: error.message,
      suggestions: [{
        type: 'error',
        message: 'AI変換でエラーが発生しました。基本変換を使用しています。',
        priority: 'high'
      }],
      analysis: {
        processingTime: 0,
        tokenUsage: 0
      },
      metadata: {
        timestamp: new Date().toISOString(),
        engine: 'fallback-error'
      }
    };
  }

  /**
   * Basic fallback conversion
   */
  basicFallbackConversion(text, level) {
    let converted = text
      .replace(/やん$|やで$/g, 'です')
      .replace(/アプデ/g, 'アップデート')
      .replace(/バグ/g, '不具合');

    switch (level) {
      case 1: return converted.endsWith('です') ? converted : converted + 'です';
      case 2: return 'お疲れ様です。' + converted + '。';
      case 3: return 'いつもお世話になっております。' + converted + '。よろしくお願いいたします。';
      case 4: return 'いつもお世話になっております😊 ' + converted + '✨ よろしくお願いいたします🙏';
      case 5: return '🌸いつもお世話になっております😊💕 ' + converted + '✨🌟 心より感謝いたします🙏💖';
      default: return converted;
    }
  }

  /**
   * UI Integration Methods
   */
  addAIStatusIndicator() {
    const statusHtml = `
      <div id="ai-status-indicator" style="position: fixed; top: 10px; right: 10px; z-index: 1000;">
        <div id="ai-status-badge" class="ai-status-fallback" style="
          background: #6c757d; color: white; padding: 4px 8px; border-radius: 12px; 
          font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px;
        ">
          <span id="ai-status-icon">🔄</span>
          <span id="ai-status-text">ルールベース</span>
        </div>
        <div id="ai-status-details" style="display: none; margin-top: 5px; background: white; 
          border-radius: 8px; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 11px;">
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', statusHtml);
    
    // Add click handler for details
    document.getElementById('ai-status-badge').addEventListener('click', () => {
      const details = document.getElementById('ai-status-details');
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
      this.updateStatusDetails();
    });
  }

  addAPIKeyConfiguration() {
    const configHtml = `
      <div id="api-config-panel" style="display: none; position: fixed; top: 50%; left: 50%; 
        transform: translate(-50%, -50%); background: white; border-radius: 12px; 
        padding: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 2000; min-width: 400px;">
        <h3 style="margin: 0 0 15px 0; color: #333;">🔑 API設定</h3>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Anthropic API Key:</label>
          <input type="password" id="anthropic-key" placeholder="sk-ant-..." 
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">OpenAI API Key:</label>
          <input type="password" id="openai-key" placeholder="sk-..." 
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="save-api-keys" style="flex: 1; background: #28a745; color: white; 
            border: none; padding: 10px; border-radius: 6px; font-weight: 600;">保存</button>
          <button id="close-api-config" style="flex: 1; background: #6c757d; color: white; 
            border: none; padding: 10px; border-radius: 6px; font-weight: 600;">閉じる</button>
        </div>
      </div>
      <div id="api-config-overlay" style="display: none; position: fixed; top: 0; left: 0; 
        width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1999;"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', configHtml);
    
    // Add event handlers
    document.getElementById('save-api-keys').addEventListener('click', () => {
      const anthropicKey = document.getElementById('anthropic-key').value;
      const openaiKey = document.getElementById('openai-key').value;
      
      if (anthropicKey) localStorage.setItem('anthropic_api_key', anthropicKey);
      if (openaiKey) localStorage.setItem('openai_api_key', openaiKey);
      
      this.closeAPIConfig();
      this.reinitializeAI();
    });
    
    document.getElementById('close-api-config').addEventListener('click', () => {
      this.closeAPIConfig();
    });
    
    document.getElementById('api-config-overlay').addEventListener('click', () => {
      this.closeAPIConfig();
    });
  }

  addFeedbackUI() {
    const feedbackHtml = `
      <div id="feedback-panel" style="display: none; margin-top: 15px; 
        background: rgba(40, 167, 69, 0.1); padding: 15px; border-radius: 8px; 
        border-left: 4px solid #28a745;">
        <h4 style="margin: 0 0 10px 0; color: #28a745;">💬 変換品質の評価</h4>
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 5px;">評価 (1-5):</label>
          <div id="rating-stars" style="display: flex; gap: 2px;">
            ${[1,2,3,4,5].map(i => `<span class="star" data-rating="${i}" style="cursor: pointer; font-size: 20px;">⭐</span>`).join('')}
          </div>
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 5px;">修正案 (任意):</label>
          <textarea id="user-correction" placeholder="より良い変換案があれば入力してください..." 
            style="width: 100%; height: 60px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="submit-feedback" style="background: #28a745; color: white; border: none; 
            padding: 8px 16px; border-radius: 4px; font-weight: 600;">送信</button>
          <button id="skip-feedback" style="background: #6c757d; color: white; border: none; 
            padding: 8px 16px; border-radius: 4px; font-weight: 600;">スキップ</button>
        </div>
      </div>
    `;
    
    // Add to output section
    const outputSection = document.querySelector('.output-section');
    if (outputSection) {
      outputSection.insertAdjacentHTML('beforeend', feedbackHtml);
      this.setupFeedbackHandlers();
    }
  }

  setupFeedbackHandlers() {
    // Star rating
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;
    
    stars.forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.rating);
        this.updateStarRating(selectedRating);
      });
      
      star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.dataset.rating);
        this.highlightStars(rating);
      });
    });
    
    document.getElementById('rating-stars').addEventListener('mouseleave', () => {
      this.updateStarRating(selectedRating);
    });
    
    // Submit feedback
    document.getElementById('submit-feedback').addEventListener('click', () => {
      if (selectedRating > 0) {
        this.submitFeedback(selectedRating, document.getElementById('user-correction').value);
      } else {
        alert('評価を選択してください');
      }
    });
    
    document.getElementById('skip-feedback').addEventListener('click', () => {
      this.hideFeedbackPanel();
    });
  }

  addRealTimeIndicators() {
    const indicatorsHtml = `
      <div id="typing-indicator" style="display: none; color: #6c757d; font-size: 14px; margin-top: 5px;">
        <span class="typing-dots">💭 変換準備中</span>
      </div>
      <div id="progress-bar-container" style="display: none; margin-top: 10px;">
        <div style="background: #e9ecef; height: 4px; border-radius: 2px; overflow: hidden;">
          <div id="progress-bar" style="background: linear-gradient(90deg, #667eea, #764ba2); 
            height: 100%; width: 0%; transition: width 0.3s ease;"></div>
        </div>
        <div id="progress-text" style="font-size: 12px; color: #6c757d; margin-top: 5px;"></div>
      </div>
    `;
    
    const inputSection = document.querySelector('.input-section');
    if (inputSection) {
      inputSection.insertAdjacentHTML('beforeend', indicatorsHtml);
    }
  }

  /**
   * UI Update Methods
   */
  updateAIStatus(status) {
    const badge = document.getElementById('ai-status-badge');
    const icon = document.getElementById('ai-status-icon');
    const text = document.getElementById('ai-status-text');
    
    if (!badge) return;
    
    const statusConfig = {
      active: { icon: '🤖', text: 'AI変換', color: '#28a745' },
      fallback: { icon: '🔄', text: 'ルールベース', color: '#6c757d' },
      error: { icon: '⚠️', text: 'エラー', color: '#dc3545' },
      loading: { icon: '⏳', text: '処理中', color: '#007bff' }
    };
    
    const config = statusConfig[status] || statusConfig.fallback;
    icon.textContent = config.icon;
    text.textContent = config.text;
    badge.style.background = config.color;
  }

  updateStatusDetails() {
    const details = document.getElementById('ai-status-details');
    if (!details) return;
    
    const stats = this.realTimeConverter?.getPerformanceStats() || {};
    
    details.innerHTML = `
      <div><strong>エンジン:</strong> ${this.isAIEnabled ? 'AI + ルールベース' : 'ルールベースのみ'}</div>
      <div><strong>変換回数:</strong> ${stats.totalConversions || 0}</div>
      <div><strong>平均応答時間:</strong> ${Math.round(stats.averageResponseTime || 0)}ms</div>
      <div><strong>キャッシュヒット率:</strong> ${Math.round((stats.cacheHitRate || 0) * 100)}%</div>
      ${!this.isAIEnabled ? '<div style="margin-top: 8px;"><button onclick="window.aiEngine.showAPIConfig()" style="background: #007bff; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px;">API設定</button></div>' : ''}
    `;
  }

  showQualityIndicators(quality) {
    // Show quality score and suggestions in UI
    const grade = quality.report?.grade || 'C';
    const score = Math.round(quality.overall * 100);
    
    // Add quality indicator to output
    const outputSection = document.querySelector('.output-section');
    if (outputSection) {
      let qualityIndicator = document.getElementById('quality-indicator');
      if (!qualityIndicator) {
        qualityIndicator = document.createElement('div');
        qualityIndicator.id = 'quality-indicator';
        outputSection.appendChild(qualityIndicator);
      }
      
      qualityIndicator.innerHTML = `
        <div style="margin-top: 10px; padding: 8px 12px; background: ${this.getGradeColor(grade)}; 
          color: white; border-radius: 6px; font-size: 12px; display: flex; align-items: center; gap: 8px;">
          <span>品質スコア: ${grade} (${score}%)</span>
          <button onclick="this.parentElement.style.display='none'" 
            style="background: none; border: none; color: white; cursor: pointer;">×</button>
        </div>
      `;
    }
  }

  getGradeColor(grade) {
    const colors = {
      'A+': '#28a745', 'A': '#28a745', 'B+': '#20c997', 'B': '#20c997',
      'C+': '#ffc107', 'C': '#ffc107', 'D': '#fd7e14', 'F': '#dc3545'
    };
    return colors[grade] || '#6c757d';
  }

  showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.style.display = 'block';
      this.animateTypingDots();
    }
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.style.display = 'none';
  }

  updateProgressBar(progress) {
    const container = document.getElementById('progress-bar-container');
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    
    if (!container) return;
    
    container.style.display = 'block';
    if (bar) bar.style.width = (progress.progress * 100) + '%';
    if (text) text.textContent = progress.message || `${Math.round(progress.progress * 100)}%完了`;
  }

  hideProgressBar() {
    const container = document.getElementById('progress-bar-container');
    if (container) container.style.display = 'none';
  }

  animateTypingDots() {
    const indicator = document.querySelector('.typing-dots');
    if (!indicator) return;
    
    let dots = '';
    let count = 0;
    
    const interval = setInterval(() => {
      dots = '.'.repeat(count % 4);
      indicator.textContent = `💭 変換準備中${dots}`;
      count++;
      
      if (indicator.parentElement.style.display === 'none') {
        clearInterval(interval);
      }
    }, 300);
  }

  /**
   * API Configuration Methods
   */
  showAPIConfig() {
    document.getElementById('api-config-panel').style.display = 'block';
    document.getElementById('api-config-overlay').style.display = 'block';
    
    // Load existing keys
    const anthropicKey = localStorage.getItem('anthropic_api_key');
    const openaiKey = localStorage.getItem('openai_api_key');
    
    if (anthropicKey) document.getElementById('anthropic-key').value = anthropicKey;
    if (openaiKey) document.getElementById('openai-key').value = openaiKey;
  }

  closeAPIConfig() {
    document.getElementById('api-config-panel').style.display = 'none';
    document.getElementById('api-config-overlay').style.display = 'none';
  }

  reinitializeAI() {
    try {
      this.initializeComponents();
      if (this.isAIEnabled) {
        this.updateAIStatus('active');
        console.log('✅ AI components reinitialized successfully');
      }
    } catch (error) {
      console.error('AI reinitialization failed:', error);
      this.updateAIStatus('error');
    }
  }

  /**
   * Feedback Methods
   */
  showFeedbackPanel(conversionResult) {
    this.currentConversionResult = conversionResult;
    const panel = document.getElementById('feedback-panel');
    if (panel) panel.style.display = 'block';
  }

  hideFeedbackPanel() {
    const panel = document.getElementById('feedback-panel');
    if (panel) panel.style.display = 'none';
    this.resetFeedbackForm();
  }

  submitFeedback(rating, correction) {
    if (this.currentConversionResult && this.feedbackLearning) {
      this.feedbackLearning.collectFeedback({
        originalText: this.currentConversionResult.original,
        convertedText: this.currentConversionResult.converted,
        userRating: rating,
        userCorrection: correction,
        context: this.currentConversionResult.context,
        options: this.currentConversionResult.options
      });
      
      console.log(`📝 Feedback submitted: ${rating}/5 stars`);
    }
    
    this.hideFeedbackPanel();
    this.showFeedbackThankYou();
  }

  showFeedbackThankYou() {
    // Show temporary thank you message
    const thankYou = document.createElement('div');
    thankYou.innerHTML = '✅ フィードバックありがとうございます！';
    thankYou.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #28a745; color: white; padding: 12px 20px; border-radius: 8px;
      font-weight: 600; z-index: 3000;
    `;
    
    document.body.appendChild(thankYou);
    setTimeout(() => thankYou.remove(), 2000);
  }

  updateStarRating(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
      star.textContent = index < rating ? '⭐' : '☆';
    });
  }

  highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
      star.textContent = index < rating ? '⭐' : '☆';
    });
  }

  resetFeedbackForm() {
    document.getElementById('user-correction').value = '';
    this.updateStarRating(0);
  }

  /**
   * Performance monitoring
   */
  updatePerformanceDisplay(analysis) {
    if (analysis?.processingTime) {
      console.log(`⚡ Conversion completed in ${analysis.processingTime}ms`);
    }
  }
}

// Initialize the enhanced engine when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.aiEngine = new AIEnhancedConversionEngine();
  
  // Expose to global scope for testing
  window.convertWithAI = (text, options) => window.aiEngine.convertText(text, options);
  
  console.log('🌸 AI-Enhanced Japanese Gentle Converter ready!');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIEnhancedConversionEngine };
}