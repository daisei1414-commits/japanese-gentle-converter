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
      // Check for API keys
      const anthropicKey = localStorage.getItem('anthropic_api_key');
      const openaiKey = localStorage.getItem('openai_api_key');
      
      // Initialize AI components if available and API keys exist
      if (modules.AITextConverter && (anthropicKey || openaiKey)) {
        this.aiConverter = new modules.AITextConverter();
        this.realTimeConverter = new modules.RealTimeConverter(this.aiConverter);
        this.isAIEnabled = true;
        console.log('🤖 AI components initialized with API keys');
      } else {
        this.isAIEnabled = false;
        console.log('🔄 AI components not available or no API keys found');
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
      // Check if we have API keys and should attempt AI conversion
      const anthropicKey = localStorage.getItem('anthropic_api_key');
      const openaiKey = localStorage.getItem('openai_api_key');
      
      if (this.isAIEnabled && (anthropicKey || openaiKey)) {
        try {
          // Attempt AI conversion (simplified for now since LLM modules might not be fully loaded)
          console.log('🤖 Attempting AI conversion...');
          const result = await this.performAIConversion(originalText, options);
          this.handleConversionSuccess(result, 'ai');
          return result;
        } catch (aiError) {
          console.warn('AI conversion failed, falling back to rule-based:', aiError);
          // Fall through to legacy conversion
        }
      }
      
      // Use legacy conversion
      console.log('🔄 Using rule-based conversion');
      const result = await this.legacyConverter.convertText(originalText, options);
      this.handleConversionSuccess(result, 'legacy');
      return result;
      
    } catch (error) {
      console.error('Conversion failed:', error);
      return this.handleConversionError(originalText, options, error);
    }
  }

  /**
   * Perform AI conversion using actual LLM APIs
   */
  async performAIConversion(originalText, options) {
    const anthropicKey = localStorage.getItem('anthropic_api_key');
    const openaiKey = localStorage.getItem('openai_api_key');
    
    // Try Anthropic Claude first
    if (anthropicKey) {
      try {
        console.log('🤖 Using Claude API for conversion...');
        const result = await this.callClaudeAPI(originalText, options, anthropicKey);
        return result;
      } catch (error) {
        console.warn('Claude API failed:', error.message);
      }
    }
    
    // Try OpenAI GPT if Claude fails or isn't available
    if (openaiKey) {
      try {
        console.log('🤖 Using OpenAI API for conversion...');
        const result = await this.callOpenAIAPI(originalText, options, openaiKey);
        return result;
      } catch (error) {
        console.warn('OpenAI API failed:', error.message);
      }
    }
    
    // If all AI attempts fail, throw error to trigger fallback
    throw new Error('All AI providers failed');
  }

  /**
   * Call Claude API for text conversion
   */
  async callClaudeAPI(originalText, options, apiKey) {
    const level = options.level || 3;
    const prompt = this.buildConversionPrompt(originalText, level);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const convertedText = data.content[0].text.trim();

    return {
      original: originalText,
      converted: convertedText,
      provider: 'claude',
      confidence: 0.92,
      analysis: {
        processingTime: Date.now(),
        confidence: 0.92,
        improvements: ['AI自然語処理', '文脈理解', '敬語最適化']
      },
      metadata: {
        timestamp: new Date().toISOString(),
        engine: 'claude-3-haiku',
        version: '3.0.0',
        features: ['llm-processing', 'context-aware', 'natural-generation']
      },
      suggestions: [{
        type: 'ai_success',
        message: 'Claude AIにより自然な敬語表現に変換されました',
        priority: 'info'
      }]
    };
  }

  /**
   * Call OpenAI API for text conversion
   */
  async callOpenAIAPI(originalText, options, apiKey) {
    const level = options.level || 3;
    const prompt = this.buildConversionPrompt(originalText, level);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const convertedText = data.choices[0].message.content.trim();

    return {
      original: originalText,
      converted: convertedText,
      provider: 'openai',
      confidence: 0.90,
      analysis: {
        processingTime: Date.now(),
        confidence: 0.90,
        improvements: ['AI自然語処理', '文脈理解', '敬語最適化']
      },
      metadata: {
        timestamp: new Date().toISOString(),
        engine: 'gpt-3.5-turbo',
        version: '3.0.0',
        features: ['llm-processing', 'context-aware', 'natural-generation']
      },
      suggestions: [{
        type: 'ai_success',
        message: 'ChatGPT AIにより自然な敬語表現に変換されました',
        priority: 'info'
      }]
    };
  }

  /**
   * Build conversion prompt for AI
   */
  buildConversionPrompt(originalText, level) {
    const levelDescriptions = {
      1: '基本的な丁寧語',
      2: '気遣いのある表現',
      3: '温かみのある敬語',
      4: '絵文字を含む親しみやすい敬語',
      5: '非常に温かく親しみやすい表現'
    };

    return `以下の日本語テキストを${levelDescriptions[level]}に変換してください。変換されたテキストのみを出力してください。

元のテキスト: ${originalText}

変換要件:
- レベル${level}: ${levelDescriptions[level]}
- 自然で読みやすい日本語
- 文脈に適した敬語表現
- 過度に長くならないよう簡潔に
${level >= 4 ? '- 適度に絵文字を使用' : ''}

変換後のテキスト:`;
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
    // Check if status badge already exists in header
    const existingBadge = document.getElementById('ai-status-badge');
    if (existingBadge) {
      // Use existing badge, just add click handler
      existingBadge.addEventListener('click', () => {
        this.showStatusDetails();
      });
      return;
    }
    
    // Fallback: create floating status indicator if header doesn't exist
    const statusHtml = `
      <div id="ai-status-indicator" style="position: fixed; top: 10px; right: 10px; z-index: 1000;">
        <div id="ai-status-badge" class="ai-status-fallback" style="
          background: #6c757d; color: white; padding: 4px 8px; border-radius: 12px; 
          font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; cursor: pointer;
        ">
          <span id="ai-status-icon">🔄</span>
          <span id="ai-status-text">ルールベース</span>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', statusHtml);
    
    // Add click handler
    document.getElementById('ai-status-badge').addEventListener('click', () => {
      this.showStatusDetails();
    });
  }

  showStatusDetails() {
    const stats = this.getPerformanceStats();
    const anthropicKey = localStorage.getItem('anthropic_api_key');
    const openaiKey = localStorage.getItem('openai_api_key');
    
    const details = `
AI エンジン: ${this.isAIEnabled ? 'AI + ルールベース' : 'ルールベースのみ'}
APIキー状況: ${anthropicKey ? 'Anthropic ✓' : ''} ${openaiKey ? 'OpenAI ✓' : ''} ${!anthropicKey && !openaiKey ? 'なし' : ''}
変換回数: ${stats.totalConversions || 0}回
平均応答時間: ${Math.round(stats.averageResponseTime || 0)}ms
    `;
    
    alert(details);
  }

  addAPIKeyConfiguration() {
    const configHtml = `
      <div id="api-config-panel" style="display: none; position: fixed; top: 50%; left: 50%; 
        transform: translate(-50%, -50%); background: white; border-radius: 12px; 
        padding: 25px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 2000; min-width: 450px; max-width: 90vw;">
        <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px;">🔑 API キー設定</h3>
        <div style="margin-bottom: 18px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">Anthropic Claude API Key:</label>
          <input type="password" id="anthropic-key" placeholder="sk-ant-api03-..." 
            style="width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
          <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">
            Claude Sonnet/Haiku用のAPIキー
          </div>
        </div>
        <div style="margin-bottom: 18px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">OpenAI API Key:</label>
          <input type="password" id="openai-key" placeholder="sk-..." 
            style="width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
          <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">
            ChatGPT-4/3.5用のAPIキー
          </div>
        </div>
        <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; color: #495057;">
          💡 <strong>ヒント:</strong> どちらか一つのキーを入力するだけでAI機能が使用できます。複数設定した場合は自動的にフォールバックします。
        </div>
        <div style="display: flex; gap: 12px;">
          <button id="save-api-keys" style="flex: 1; background: linear-gradient(135deg, #28a745, #20c997); color: white; 
            border: none; padding: 12px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;">
            💾 保存して有効化
          </button>
          <button id="close-api-config" style="flex: 1; background: #6c757d; color: white; 
            border: none; padding: 12px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;">
            ❌ キャンセル
          </button>
        </div>
      </div>
      <div id="api-config-overlay" style="display: none; position: fixed; top: 0; left: 0; 
        width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1999;"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', configHtml);
    
    // Add event handlers
    document.getElementById('save-api-keys').addEventListener('click', () => {
      const anthropicKey = document.getElementById('anthropic-key').value.trim();
      const openaiKey = document.getElementById('openai-key').value.trim();
      
      // Validate that at least one key is provided
      if (!anthropicKey && !openaiKey) {
        this.showNotification('⚠️ 少なくとも一つのAPIキーを入力してください', 'warning');
        return;
      }
      
      // Save keys to localStorage
      let savedKeys = [];
      if (anthropicKey) {
        localStorage.setItem('anthropic_api_key', anthropicKey);
        savedKeys.push('Anthropic Claude');
      }
      if (openaiKey) {
        localStorage.setItem('openai_api_key', openaiKey);
        savedKeys.push('OpenAI GPT');
      }
      
      this.closeAPIConfig();
      this.reinitializeAI();
      
      // Show success notification
      this.showNotification(`✅ APIキーが保存されました (${savedKeys.join(', ')})`, 'success');
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
    
    const ratingStars = document.getElementById('rating-stars');
    if (ratingStars) {
      ratingStars.addEventListener('mouseleave', () => {
        this.updateStarRating(selectedRating);
      });
    }
    
    // Submit feedback
    const submitBtn = document.getElementById('submit-feedback');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (selectedRating > 0) {
          const correctionText = document.getElementById('user-correction');
          this.submitFeedback(selectedRating, correctionText ? correctionText.value : '');
        } else {
          this.showNotification('⚠️ 評価を選択してください', 'warning');
        }
      });
    }
    
    const skipBtn = document.getElementById('skip-feedback');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.hideFeedbackPanel();
      });
    }
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
      // Check if we have any API keys
      const anthropicKey = localStorage.getItem('anthropic_api_key');
      const openaiKey = localStorage.getItem('openai_api_key');
      
      if (anthropicKey || openaiKey) {
        this.initializeComponents();
        this.isAIEnabled = true;
        this.updateAIStatus('active');
        console.log('✅ AI components reinitialized successfully');
      } else {
        this.isAIEnabled = false;
        this.updateAIStatus('fallback');
        console.log('⚠️ No API keys found, using fallback mode');
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

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    if (this.realTimeConverter && this.realTimeConverter.getPerformanceStats) {
      return this.realTimeConverter.getPerformanceStats();
    }
    
    return {
      totalConversions: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      cacheSize: 0,
      queueLength: 0,
      isConverting: false,
      debounceTime: 1200,
      typingPatterns: {
        averageTypingSpeed: 0,
        pausePatterns: [],
        completionPatterns: []
      }
    };
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#007bff'
    };
    
    notification.innerHTML = message;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 3000;
      background: ${colors[type] || colors.info}; color: white;
      padding: 12px 20px; border-radius: 8px; font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transform: translateX(100%); transition: transform 0.3s ease;
      max-width: 350px; font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize the enhanced engine when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.aiEngine = new AIEnhancedConversionEngine();
  
  // Check and initialize AI status
  setTimeout(() => {
    const anthropicKey = localStorage.getItem('anthropic_api_key');
    const openaiKey = localStorage.getItem('openai_api_key');
    
    if (anthropicKey || openaiKey) {
      window.aiEngine.isAIEnabled = true;
      window.aiEngine.updateAIStatus('active');
      console.log('✅ AI keys detected, AI mode activated');
    } else {
      window.aiEngine.isAIEnabled = false;
      window.aiEngine.updateAIStatus('fallback');
      console.log('⚠️ No API keys found, using fallback mode');
    }
  }, 500);
  
  // Expose to global scope for testing
  window.convertWithAI = (text, options) => window.aiEngine.convertText(text, options);
  
  console.log('🌸 AI-Enhanced Japanese Gentle Converter ready!');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIEnhancedConversionEngine };
}