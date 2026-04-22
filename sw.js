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

// 透传 fetch(不缓存,但必须有 handler 否则 Chrome 不认 PWA)
self.addEventListener('fetch', (event) => {
  // 网络优先,失败就直接挂(以后换 cache-first 就能离线)
  // 不调用 respondWith 意味着走浏览器默认逻辑,相当于"什么都不改"
  return;
});
