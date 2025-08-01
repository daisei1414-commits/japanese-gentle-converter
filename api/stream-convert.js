/**
 * Vercel Serverless Function for Streaming AI Text Conversion
 * Ultra-fast response with real-time streaming
 */

export default async function handler(req, res) {
  // Comprehensive CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔧 CORS preflight request handled for streaming');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, level = 3, apiKey, provider = 'claude' } = req.body;

    if (!text || !apiKey) {
      return res.status(400).json({ error: 'Text and API key are required' });
    }

    console.log(`🚀 Streaming AI Conversion: ${provider}, level: ${level}`);

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Send immediate response to reduce perceived latency
    res.write('🤖 AI processing started...\n');

    if (provider === 'openai' || provider === 'gpt') {
      await streamOpenAIConversion(text, level, apiKey, res);
    } else {
      // Claude doesn't support streaming in the same way, so we use chunked response
      await streamClaudeConversion(text, level, apiKey, res);
    }

  } catch (error) {
    console.error('❌ Streaming AI Error:', error);
    res.write(`❌ Error: ${error.message}\n`);
    res.end();
  }
}

/**
 * Stream OpenAI conversion with real-time chunks
 */
async function streamOpenAIConversion(text, level, apiKey, res) {
  const prompt = buildConversionPrompt(text, level);
  
  try {
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
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    res.write('📡 Receiving AI response...\n');

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              fullResponse += content;
              res.write(content);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }

    res.write('\n✅ Streaming complete!\n');
    res.write(`RESULT:${fullResponse}\n`);
    res.end();

  } catch (error) {
    throw new Error(`Streaming failed: ${error.message}`);
  }
}

/**
 * Stream Claude conversion with chunked response simulation
 */
async function streamClaudeConversion(text, level, apiKey, res) {
  const prompt = buildConversionPrompt(text, level);
  
  try {
    res.write('📡 Calling Claude AI...\n');
    
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
      throw new Error(`Claude API error: ${response.status}`);
    }

    res.write('🧠 Processing response...\n');
    
    const data = await response.json();
    const convertedText = data.content[0].text.trim();

    // Simulate streaming by sending text in chunks
    const words = convertedText.split('');
    for (let i = 0; i < words.length; i += 5) {
      const chunk = words.slice(i, i + 5).join('');
      res.write(chunk);
      
      // Small delay to simulate real-time streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    res.write('\n✅ Claude conversion complete!\n');
    res.write(`RESULT:${convertedText}\n`);
    res.end();

  } catch (error) {
    throw new Error(`Claude streaming failed: ${error.message}`);
  }
}

/**
 * Build optimized conversion prompt for streaming
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

  return `日本語敬語変換: "${originalText}" を${description}変換してください。変換結果のみを出力:`;
}