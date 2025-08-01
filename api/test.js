/**
 * Test endpoint to verify Vercel deployment and CORS setup
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    console.log('🔧 Test endpoint CORS preflight handled');
    return res.status(200).end();
  }

  const testData = {
    success: true,
    message: '✅ Vercel API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    cors: 'enabled',
    deployment: 'vercel',
    version: '4.0.0-real-ai'
  };

  console.log('🧪 Test endpoint called:', testData);

  return res.status(200).json(testData);
}