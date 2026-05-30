/**
 * Cloudflare Pages Function — DeepSeek API Proxy
 *
 * 部署方法：
 * 1. 本文件放在 functions/api/chat.js，自动部署为 /api/chat 路由
 * 2. 在 Cloudflare Pages Dashboard → Settings → Environment Variables → Add secret
 *    变量名：DEEPSEEK_API_KEY，值：你的 DeepSeek API Key
 * 3. 重新部署 Pages 站点即可生效
 *
 * 注意：因为和站点同域名，不需要 CORS 配置
 */

const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions';

export async function onRequest(context) {
  const { request, env } = context;

  // 只接受 POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = env.DEEPSEEK_API_KEY;

  // 检查 Key 是否已配置
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'DeepSeek API key not configured. Set DEEPSEEK_API_KEY in Pages environment variables.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
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
        'Cache-Control': 'no-store',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
