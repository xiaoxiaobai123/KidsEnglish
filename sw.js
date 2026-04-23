/**
 * sw.js · cache-first 离线缓存
 * ============================================================
 * 策略:
 *   install 阶段:预缓存"核心文件"(HTML / JS / CSS / manifests / 图标)
 *   运行时:所有请求 cache-first(先查本地缓存,没有再网络)
 *         网络响应也顺便存进 cache,下次秒出
 *
 * 效果:
 *   首次访问:~15-30 秒下载 30MB 到 pad 存储
 *   之后:所有交互零网络延迟,跟本地 APP 一样
 *   断网:仍可用
 *
 * 升级:每次 VERSION 变,旧缓存自动清
 * ============================================================ */

const VERSION = '20260422l';
const CACHE_NAME = `englishkids-${VERSION}`;

// 小文件,install 时一次性拉下来
const CORE_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data-vocab.js',
  './data-sentences.js',
  './data-coach.js',
  './data-quiz.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './audio/manifest.json',
  './audio/images/manifest.json',
  './audio/tangtang-spell-manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] install precache failed:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(n => n !== CACHE_NAME ? caches.delete(n) : null))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for same-origin static assets; network for everything else
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const isCacheable = /\.(mp3|jpg|jpeg|png|woff2|json|js|css|html|ico)$/.test(url.pathname) || url.pathname === '/' || url.pathname.endsWith('/');
  if (!isCacheable) return;

  // 判断是否为媒体资源(<audio>/<video> 会发 Range 请求,必须特殊处理)
  const isMedia = /\.(mp3|mp4|wav|webm|ogg|m4a)$/.test(url.pathname);

  event.respondWith((async () => {
    // 1. 查缓存(忽略 Range 头差异 · 缓存存的是完整文件)
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req, { ignoreSearch: false, ignoreVary: true });
    if (cached) return cached;

    // 2. 媒体资源:用不带 Range 的新请求抓**完整文件**,避免 206 Partial Content 进缓存
    const fetchReq = isMedia ? new Request(req.url, { mode: 'cors', credentials: 'same-origin' }) : req;
    try {
      const resp = await fetch(fetchReq);
      // 只缓存 200(完整响应),不缓存 206(部分响应)
      if (resp.ok && resp.status === 200) {
        cache.put(req, resp.clone()).catch(() => {});
      }
      return resp;
    } catch (e) {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
