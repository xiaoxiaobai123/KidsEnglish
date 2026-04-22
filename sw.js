/**
 * sw.js · 最小 Service Worker
 * ============================================================
 * 目的(第一版):
 *   1) 满足 PWA 自动"安装"提示的基本条件(有 fetch handler)
 *   2) 不做复杂缓存,先走浏览器默认 HTTP 缓存
 *
 * 以后可以升级:pre-cache 所有 audio/*.mp3 → 真正离线可用
 * ============================================================ */

const VERSION = '20260422j';

self.addEventListener('install', (event) => {
  // 立即激活,不等旧版 SW 释放控制
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 接管所有 open 的页面
  event.waitUntil(self.clients.claim());
});

// Fetch handler · 网络优先透传(以后升级 cache-first 可离线)
// 必须有 respondWith 才不被 Chrome 当 no-op handler 警告
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => new Response('', { status: 504 })));
});
