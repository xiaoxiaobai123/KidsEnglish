/**
 * sw.js · Eager pre-cache · 首次安装时下全部音频/图片
 * ============================================================
 * 策略:
 *   install 阶段:
 *     1) 核心文件(HTML/JS/CSS/manifest/icons)同步预缓存 — 快
 *     2) 读 audio manifest 等清单 → 后台并发下载全部媒体 — 不阻塞 install
 *   运行时:
 *     所有请求 cache-first(含音频/图片/字母)
 *     MP3 特别处理:发送不带 Range 的 fetch 避免 206 Partial 跳过缓存
 *
 * 效果:
 *   首次安装完,后台 30-60 秒下完所有 ~30MB 资源 → 之后永久零延迟
 *   中间网挂也没事,下次打开接着下
 * ============================================================ */

const VERSION = '20260424m';
const CACHE_NAME = `englishkids-${VERSION}`;

// 核心文件(小,一定要下,install 阻塞直到完成)
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
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try { await cache.addAll(CORE_FILES); } catch (e) { console.warn('[SW] core precache fail', e); }
    // 非阻塞:后台预下全部媒体(不影响 install 完成)
    precacheMedia(cache).catch(err => console.warn('[SW] media precache fail', err));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(n => n !== CACHE_NAME ? caches.delete(n) : null));
    await self.clients.claim();
  })());
});

// ─── Eager precache:后台下全部 audio + images ────────────────
// 失败重试 2 次,最后漏的会广播出去,UI 可提示 "retry"
async function precacheMedia(cache) {
  const urls = await buildMediaUrlList();
  broadcast({ type: 'precache-start', total: urls.length });

  const BATCH = 15;
  const MAX_RETRY = 2;
  const failed = new Set();
  let done = 0;

  // 尝试抓一个 URL,返回 true/false(成功与否)
  // 30s timeout 防止单个 hang fetch 拖死整批
  async function tryFetch(url) {
    try {
      const req = new Request(url);
      if (await cache.match(req)) return true;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 30000);
      try {
        const resp = await fetch(url, { mode: 'same-origin', signal: ctrl.signal });
        if (resp.ok && resp.status === 200) {
          await cache.put(req, resp);
          return true;
        }
      } finally {
        clearTimeout(t);
      }
    } catch (e) { /* swallow (timeout / network / 4xx-5xx) */ }
    return false;
  }

  // 每完成一个就上报进度 (不等整批),避免"卡在某一批"的假象
  let lastBroadcast = 0;
  function reportProgress() {
    const now = Date.now();
    // 节流:最多 300ms 一次,避免广播风暴
    if (now - lastBroadcast > 300 || done === urls.length) {
      lastBroadcast = now;
      broadcast({ type: 'precache-progress', done, total: urls.length, failed: failed.size });
    }
  }

  // 流式并发:始终保持 BATCH 个 worker,一个完成立刻接下一个 URL
  // 避免"批里 14 个秒下完 + 1 个 hang 30s 拖死整批"
  async function runConcurrent(list, workerFn, concurrency) {
    let idx = 0;
    const workers = [];
    for (let w = 0; w < concurrency; w++) {
      workers.push((async () => {
        while (idx < list.length) {
          const i = idx++;
          await workerFn(list[i]);
        }
      })());
    }
    await Promise.all(workers);
  }

  // 第一轮
  await runConcurrent(urls, async (url) => {
    const ok = await tryFetch(url);
    if (!ok) failed.add(url);
    done++;
    reportProgress();
  }, BATCH);

  // 重试轮(失败 URL 指数退避,最多 MAX_RETRY 次)
  for (let retry = 1; retry <= MAX_RETRY && failed.size; retry++) {
    broadcast({ type: 'precache-retry', round: retry, count: failed.size });
    const toRetry = Array.from(failed);
    failed.clear();
    await new Promise(r => setTimeout(r, 800 * retry));
    await runConcurrent(toRetry, async (url) => {
      const ok = await tryFetch(url);
      if (!ok) failed.add(url);
    }, BATCH);
  }

  broadcast({
    type: 'precache-done',
    total: urls.length,
    cached: urls.length - failed.size,
    failed: failed.size,
    failedList: Array.from(failed).slice(0, 20),
  });
}

async function buildMediaUrlList() {
  const urls = new Set();
  // 1. audio manifest
  try {
    const m = await fetch('./audio/manifest.json').then(r => r.json());
    (m.sentences || []).forEach(id => urls.add(`./audio/sentences/${id}.mp3`));
    (m.vocab || []).forEach(id => urls.add(`./audio/vocab/${id}.mp3`));
    Object.keys(m.coach || {}).forEach(id => {
      urls.add(`./audio/coach/${id}.mp3`);
      urls.add(`./audio/coach/${id}_ethan.mp3`);  // 多名字兜底
    });
  } catch (e) {}
  // 2. images manifest
  try {
    const m = await fetch('./audio/images/manifest.json').then(r => r.json());
    (m.vocab || []).forEach(id => urls.add(`./audio/images/vocab/${id}.jpg`));
    (m.sentences || []).forEach(id => urls.add(`./audio/images/sentences/${id}.jpg`));
  } catch (e) {}
  // 3. letters + phonemes (A-Z,两套)
  for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    urls.add(`./audio/letters/${c}.mp3`);
    urls.add(`./audio/phonemes/${c}.mp3`);
  }
  // 4. tangtang 奖励 + spell 拼读
  // 注意:manifest 结构是 { tangtang_voice: "...", spell_voice: "...", tangtang: [...], spell: [...] }
  // - tangtang_voice / spell_voice 是 metadata 字符串,不是文件名,要跳过
  // - tangtang 数组 → ./audio/tangtang/<id>.mp3
  // - spell 数组 → ./audio/spell/<id>.mp3(不是 tangtang 目录!)
  try {
    const m = await fetch('./audio/tangtang-spell-manifest.json').then(r => r.json());
    (Array.isArray(m.tangtang) ? m.tangtang : []).forEach(id =>
      typeof id === 'string' && urls.add(`./audio/tangtang/${id}.mp3`));
    (Array.isArray(m.spell) ? m.spell : []).forEach(id =>
      typeof id === 'string' && urls.add(`./audio/spell/${id}.mp3`));
  } catch (e) {}
  return Array.from(urls);
}

function broadcast(msg) {
  self.clients.matchAll().then(clients => clients.forEach(c => c.postMessage(msg)));
}

// 客户端发来手动重试请求(点击失败徽章时)
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'precache-retry-manual') return;
  caches.open(CACHE_NAME).then(cache => precacheMedia(cache));
});

// ─── 运行时 fetch handler ────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const isCacheable = /\.(mp3|jpg|jpeg|png|woff2|json|js|css|html|ico)$/.test(url.pathname) || url.pathname === '/' || url.pathname.endsWith('/');
  if (!isCacheable) return;

  const isMedia = /\.(mp3|mp4|wav|webm|ogg|m4a)$/.test(url.pathname);

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req, { ignoreSearch: false, ignoreVary: true });
    if (cached) return cached;

    const fetchReq = isMedia ? new Request(req.url, { mode: 'same-origin' }) : req;
    try {
      const resp = await fetch(fetchReq);
      if (resp.ok && resp.status === 200) {
        cache.put(req, resp.clone()).catch(() => {});
      }
      return resp;
    } catch (e) {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
