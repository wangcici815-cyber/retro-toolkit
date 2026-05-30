/**
 * Cloudflare Worker — DeepSeek API Proxy
 *
 * 部署方法：
 * 1. 在 Cloudflare Dashboard → Workers & Pages → 创建 Application → 创建 Worker
 * 2. 把本文件内容粘贴到 Worker 编辑器
 * 3. ⚠️ 设置 API Key（二选一）：
 *    方式 A（推荐）：Settings → Variables → Add secret → 变量名 DEEPSEEK_API_KEY，值填你的 Key
 *    方式 B（快捷）：把下面第 20 行的 'YOUR_DEEPSEEK_API_KEY' 替换成你的真实 Key
 * 4. 部署
 * 5. 记下生成的 workers.dev 域名（如 retro-toolkit-proxy.xxx.workers.dev）
 * 6. 把该域名填到 ai-assist.js 的 WORKER_URL 里
 */

const HARDCODED_KEY = 'YOUR_DEEPSEEK_API_KEY';
const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions';

export default {
  async fetch(request, env) {
    // 优先使用 env 环境变量（Secrets），其次用硬编码 key
    const apiKey = env.DEEPSEEK_API_KEY || HARDCODED_KEY;

    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 只接受 POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // 检查 Key 是否已配置
    if (!apiKey || apiKey === 'YOUR_DEEPSEEK_API_KEY') {
      return new Response(JSON.stringify({ error: 'DeepSeek API key not configured. Set DEEPSEEK_API_KEY in Worker secrets.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      // 直接把前端发来的 body 透传给 DeepSeek
      const body = await request.json();

      const response = await fetch(DEEPSEEK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
        },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
