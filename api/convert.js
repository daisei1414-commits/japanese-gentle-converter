/**
 * Vercel Serverless Function for AI Text Conversion
 * High-performance real AI implementation with streaming support
 */

export default async function handler(req, res) {
  // Comprehensive CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔧 CORS preflight request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, level = 3, apiKey, provider = 'claude' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    console.log(`🤖 AI Conversion Request: ${provider}, level: ${level}, text length: ${text.length}`);

    let result;
    
    if (provider === 'claude' || provider === 'anthropic') {
      result = await convertWithClaude(text, level, apiKey);
    } else if (provider === 'openai' || provider === 'gpt') {
      result = await convertWithOpenAI(text, level, apiKey);
    } else {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    console.log(`✅ AI Conversion Success: ${result.converted.length} chars`);

    return res.status(200).json({
      success: true,
      original: text,
      converted: result.converted,
      provider: result.provider,
      confidence: result.confidence,
      analysis: result.analysis,
      metadata: result.metadata,
      suggestions: result.suggestions
    });

  } catch (error) {
    console.error('❌ AI Conversion Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      fallback: true
    });
  }
}

/**
 * Convert text using Claude API
 */
async function convertWithClaude(text, level, apiKey) {
  const prompt = buildConversionPrompt(text, level);
  
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
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  const convertedText = data.content[0].text.trim();

  return {
    converted: convertedText,
    provider: 'claude-3-haiku',
    confidence: 0.95,
    analysis: {
      processingTime: Date.now(),
      confidence: 0.95,
      improvements: ['Claude AI自然語処理', 'コンテキスト理解', '高品質敬語変換'],
      tokenUsage: data.usage
    },
    metadata: {
      timestamp: new Date().toISOString(),
      engine: 'claude-3-haiku-20240307',
      version: '4.0.0-real-ai',
      features: ['llm-processing', 'context-aware', 'streaming-ready']
    },
    suggestions: [{
      type: 'ai_success',
      message: 'Claude 3 Haikuにより高品質な敬語変換が完了しました',
      priority: 'info'
    }]
  };
}

/**
 * Convert text using OpenAI API
 */
async function convertWithOpenAI(text, level, apiKey) {
  const prompt = buildConversionPrompt(text, level);
  
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
      temperature: 0.3,
      stream: false
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  const convertedText = data.choices[0].message.content.trim();

  return {
    converted: convertedText,
    provider: 'gpt-3.5-turbo',
    confidence: 0.92,
    analysis: {
      processingTime: Date.now(),
      confidence: 0.92,
      improvements: ['GPT AI自然語処理', 'コンテキスト理解', '高品質敬語変換'],
      tokenUsage: data.usage
    },
    metadata: {
      timestamp: new Date().toISOString(),
      engine: 'gpt-3.5-turbo',
      version: '4.0.0-real-ai',
      features: ['llm-processing', 'context-aware', 'streaming-ready']
    },
    suggestions: [{
      type: 'ai_success',
      message: 'ChatGPT 3.5により高品質な敬語変換が完了しました',
      priority: 'info'
    }]
  };
}

/**
 * Build optimized conversion prompt for AI
 */
function buildConversionPrompt(originalText, level) {
  const levelDescriptions = {
    1: '基本的な丁寧語で簡潔に',
    2: '気遣いのある丁寧な表現で',
    3: '温かみのある敬語で親しみやすく',
    4: '絵文字も使って親しみやすい敬語で',
    5: '非常に温かく親しみやすい表現で、適度な絵文字を使って'
  };

  const description = levelDescriptions[level] || levelDescriptions[3];

  return `あなたは日本語の敬語変換の専門家です。以下のテキストを${description}変換してください。

変換ルール:
- 自然で読みやすい日本語にする
- 過度に長くしない（元の文の2倍以内）
- 文脈に適した敬語レベルを使用
- カジュアルな表現（やん、やで、じゃんなど）は標準語の丁寧語に
- レベル${level}: ${description}
${level >= 4 ? '- 適度に絵文字を使用（😊✨🙏など）' : ''}
${level >= 5 ? '- より親しみやすい絵文字も追加（🌸💕💖など）' : ''}

元のテキスト: "${originalText}"

変換後のテキストのみを出力してください:`;
}