/* ============================================================
 * app.js · 一年级下册英语闯关 PWA
 * Phase 1 核心业务逻辑
 * ============================================================
 * 模块清单：
 *   1. 配置 & 常量
 *   2. 状态管理 + localStorage 持久化
 *   3. TTS 语音（Web Speech API）
 *   4. DOM / 工具函数（$, h, shuffle 等）
 *   5. 屏幕路由（10 屏切换）
 *   6. UI 辅助（toast / modal / confetti / 家长评星）
 *   7. 主菜单
 *   8. 闯关 5 关流程（听 / 跟 / 填 / 背 / 换）
 *   9. 结算页
 *  10. 闪卡板块
 *  11. 词库板块
 *  12. 句库板块
 *  13. 单元测验（每单元 10 题 · 自动生成）
 *  14. 进度看板
 *  15. Day 切换 & 顶栏
 *  16. 占位屏幕（默写 / 打印）
 *  17. 启动入口
 * ============================================================ */
(function () {
  'use strict';

  // ==================== 1. 配置 ====================
  const CONFIG = {
    STORAGE_KEY:  'eng1b_state_v1',
    MIN_DAY:      1,
    MAX_DAY:      25,
    DEFAULT_DAY:  (typeof DEFAULT_DAY !== 'undefined') ? DEFAULT_DAY : 9,
    TTS_RATE:     1.00,           // 默认:音频 -40% 源速即 🐢 慢(最清晰,phonics 学习)
    TTS_PITCH:    1.00,           // 合成器 1.0 原生最自然（调高反而机械）
    TTS_LANG:     'en-US',
    CONFETTI_N:   40,
    MASTERY_THRESHOLD: 2,         // 连续答对 N 次即"掌握"
  };

  // TTS 三档速率 · 基于 Edge -40% 源音频的 playbackRate
  //   🐢 慢:  1.00 = 播放源速(≈-40%)   · 学新词,phonics 最清晰
  //   🐰 中:  1.33 = ≈-20%              · 日常复习
  //   🐒 快:  1.67 = ≈正常语速          · 熟练朗读
  const RATE_PRESETS = [
    { key: 'slow',   label: '🐢 慢', rate: 1.00 },
    { key: 'normal', label: '🐰 中', rate: 1.33 },
    { key: 'fast',   label: '🐒 快', rate: 1.67 },
  ];

  // Voice 白名单：Neural / Cloud 声音最自然，放最前；系统声音次之
  const VOICE_WHITELIST = [
    // —— 最自然（神经网络声，能识别为"人"而非机器）——
    /Neural/i, /Wavenet/i, /Natural/i, /Online/i, /Studio/i,
    // —— Android（华为 Pad 默认）——
    /en-us-x-/i, /en-US-Language/i, /Samsung.*US/i, /Samsung.*English/i,
    // —— Google（Chrome 内嵌）——
    /Google US English/i, /Google UK English Female/i, /Google.*English/i,
    // —— Apple（iPad）——
    /Samantha/i, /Karen/i, /Tessa/i, /Moira/i, /Serena/i,
    // —— Microsoft Neural（Edge）——
    /Aria/i, /Jenny/i, /Sonia/i, /Nancy/i, /Ana/i,
    // —— Microsoft 经典声（Windows 默认）——
    /Microsoft Zira/i, /Microsoft Hazel/i, /Microsoft Eva/i,
    // —— 兜底 ——
    /female/i,
  ];

  // 单元 → 天 范围（与 data-vocab.js 的 UNIT_DAYS 对齐）
  const UNIT_DAY_RANGES = {
    1: [1, 2, 3], 2: [4, 5], 3: [6, 7, 8], 4: [9, 10, 11],
    5: [12, 13], 6: [14, 15], 7: [16, 17], 8: [18, 19],
  };
  function unitForDay(day) {
    for (const u in UNIT_DAY_RANGES) {
      if (UNIT_DAY_RANGES[u].includes(day)) return UNITS.find(x => x.id === +u);
    }
    return null;
  }

  // ==================== 2. 状态 ====================
  const DEFAULT_STATE = {
    version:        2,
    currentDay:     CONFIG.DEFAULT_DAY,
    score:          0,
    streak:         0,
    lastActiveDate: null,
    daily:          {},  // { day: {completed, stars, score, starBreakdown, date} }
    unitTests:      {},  // { unit: {bestScore, lastScore, lastDate} }
    mastery:        {},  // { sentenceId: {correct: N, total: N, streak: N, status: 'new'|'learning'|'mastered', lastSeen: date} }
    mistakeBank:    {},  // { sentenceId: {wrong: N, lastWrong: date} }
    vocabSRS:       {},  // { wordId: {interval: N days, ease: 2.5, due: date, lastSeen: date} }
    tasksDone:      {},  // { date: { lesson: true, vocabSrs: true, follow: true } }
    popStreak:      0,   // 当前连对数（pop quiz 或 vocab SRS）
    popWordsKnown:  [],  // 已至少拼对过 1 次的 word id 数组（里程碑用）
    popMilestones:  [],  // 已解锁的里程碑阈值 [10, 30, 50, 100]
    settings: {
      ttsRate:       CONFIG.TTS_RATE,
      ttsPitch:      CONFIG.TTS_PITCH,                  // 用户可调音调（只对 TTS 兜底有效）
      soundOn:       true,
      coachName:     'Cat',                             // 教练昵称，可设置
      childName:     'Cory',                            // 孩子英文名（默认：可乐→Cory），用于英语引导
      showCoachZh:   true,                              // Cory 台词是否显示中文
      englishGuide:  true,                              // 是否开启英文引导
      lessonMode:    'unit-full',                       // 'daily' | 'unit-full'
      voicePref:     null,                              // 用户锁定的 voice.name；null 用白名单
      useMp3:        true,                              // 优先播放 Ana 真人录音 mp3（没有才退 TTS）
      phonicsMode:   'off',                             // 'off' 不念 | 'names' 字母名 | 'phonics' 字母音 | 'both' 都念
    },
  };
  let STATE = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // 深合并 settings，避免老数据缺少新字段
        STATE = Object.assign({}, DEFAULT_STATE, parsed);
        STATE.settings = Object.assign({}, DEFAULT_STATE.settings, parsed.settings || {});
        STATE.mastery     = parsed.mastery     || {};
        STATE.mistakeBank = parsed.mistakeBank || {};
        STATE.vocabSRS    = parsed.vocabSRS    || {};
        STATE.tasksDone   = parsed.tasksDone   || {};
        STATE.popStreak    = parsed.popStreak    || 0;
        STATE.popWordsKnown = parsed.popWordsKnown || [];
        STATE.popMilestones = parsed.popMilestones || [];
        // 迁移:旧版 ttsRate (0.60/0.80/1.00) 是针对 MiniMax 原速音频;
        // 新版源音频已 -40%,旧值会把声音拖到不可听。重置到新默认慢档。
        if (STATE.settings.ttsRate < 0.95) STATE.settings.ttsRate = 1.00;
      } else {
        STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
    } catch (e) {
      console.warn('[State] load fail:', e);
      STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }
  function saveState() {
    try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(STATE)); }
    catch (e) { console.warn('[State] save fail:', e); }
  }
  function resetState() {
    STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
  }

  /* ---------- 掌握度 & 错题银行 ---------- */
  function markCorrect(sentenceId) {
    if (!sentenceId) return;
    const m = STATE.mastery[sentenceId] || { correct: 0, total: 0, streak: 0, status: 'new' };
    m.correct++; m.total++; m.streak++;
    m.lastSeen = new Date().toISOString().slice(0, 10);
    if (m.streak >= CONFIG.MASTERY_THRESHOLD) m.status = 'mastered';
    else if (m.total > 0)                    m.status = 'learning';
    STATE.mastery[sentenceId] = m;
    saveState();
  }
  function markWrong(sentenceId) {
    if (!sentenceId) return;
    const m = STATE.mastery[sentenceId] || { correct: 0, total: 0, streak: 0, status: 'new' };
    m.total++; m.streak = 0; m.status = 'learning';
    m.lastSeen = new Date().toISOString().slice(0, 10);
    STATE.mastery[sentenceId] = m;
    const b = STATE.mistakeBank[sentenceId] || { wrong: 0 };
    b.wrong++;
    b.lastWrong = m.lastSeen;
    STATE.mistakeBank[sentenceId] = b;
    saveState();
  }
  function getMastery(sentenceId) {
    return STATE.mastery[sentenceId]?.status || 'new';
  }

  // ==================== 3. TTS & MP3 音频 + 图片 ====================
  // 音频清单（由 scripts/gen-audio.py 预生成，Ana 儿童声）
  let AUDIO_MANIFEST = null;          // { sentences: [ids], vocab: [ids], coach: { hash: en } }
  let COACH_LINE_TO_ID = null;        // en → c_xxx 快查
  // 糖糖姐 + 拼读三连清单
  let TT_MANIFEST = null;             // { tangtang: [keys], spell: [wordIds], ... }
  async function loadTangtangManifest() {
    try {
      const r = await fetch('./audio/tangtang-spell-manifest.json', { cache: 'no-store' });
      if (r.ok) {
        TT_MANIFEST = await r.json();
        console.log(`[TT] 糖糖姐 ${TT_MANIFEST.tangtang.length} 条 + 拼读 ${TT_MANIFEST.spell.length} 条`);
      }
    } catch (e) { console.warn('[TT] manifest 加载失败:', e); }
  }
  function playTangtang(key, onEnd) {
    if (!TT_MANIFEST?.tangtang?.includes(key)) { onEnd && onEnd(); return; }
    const url = `./audio/tangtang/${key}.mp3`;
    stopCurrent();
    const a = new Audio(url);
    currentAudio = a;
    a.onended = a.onerror = () => { if (currentAudio === a) currentAudio = null; onEnd && onEnd(); };
    a.play().catch(() => onEnd && onEnd());
  }
  // 动态拼接播放:整词 → 字母(每个单独 MP3) → 整词
  //   不再依赖旧的 spell/*.mp3(它们会被忽略)
  //   字母发音根据 settings.phonicsMode 选: names(字母名)| phonics(字母音)| both
  function playSpell(wordOrId, onEnd) {
    const word = (typeof wordOrId === 'string')
      ? (VOCAB.core.find(w => w.id === wordOrId) || null)
      : wordOrId;
    if (!word || !word.en) { onEnd && onEnd(); return; }

    const letters = word.en.toUpperCase().split('').filter(c => /[A-Z]/.test(c));
    const mode = STATE?.settings?.phonicsMode || 'names';

    const queue = [];
    queue.push({ type: 'word', id: word.id, gap: 400 });
    letters.forEach((L, i) => {
      if (mode === 'names' || mode === 'both') queue.push({ type: 'letter', L, gap: 150 });
      if (mode === 'phonics' || mode === 'both') queue.push({ type: 'phoneme', L, gap: 150 });
    });
    queue.push({ type: 'gap', gap: 300 });
    queue.push({ type: 'word', id: word.id, gap: 0 });

    playQueue(queue, onEnd);
  }

  // 单个字母播放(被 recite 阶段的同步高亮调用)
  function playLetterAudio(L, onEnd) {
    const mode = STATE?.settings?.phonicsMode || 'names';
    const queue = [];
    if (mode === 'names' || mode === 'both') queue.push({ type: 'letter', L, gap: 100 });
    if (mode === 'phonics' || mode === 'both') queue.push({ type: 'phoneme', L, gap: 0 });
    playQueue(queue, onEnd);
  }

  // 顺序播放音频 queue: {type, id/L, gap}
  function playQueue(queue, onEnd) {
    stopCurrent();
    let i = 0;
    function next() {
      if (i >= queue.length) return onEnd && onEnd();
      const item = queue[i++];
      if (item.type === 'gap') {
        setTimeout(next, item.gap || 0);
        return;
      }
      let url = null;
      if (item.type === 'word')    url = resolveQuizAsset('vocab:' + item.id, 'audio') || `./audio/vocab/${item.id}.mp3`;
      if (item.type === 'letter')  url = `./audio/letters/${item.L}.mp3`;
      if (item.type === 'phoneme') url = `./audio/phonemes/${item.L}.mp3`;
      if (!url) { next(); return; }
      const a = new Audio(url);
      currentAudio = a;
      a.onended = a.onerror = () => {
        if (currentAudio === a) currentAudio = null;
        if (item.gap > 0) setTimeout(next, item.gap);
        else next();
      };
      a.play().catch(() => {
        if (currentAudio === a) currentAudio = null;
        next();
      });
    }
    next();
  }
  // 随机从一组 key 中挑一个 tangtang 语音
  function playTangtangRandom(keyPrefix, onEnd) {
    const keys = (TT_MANIFEST?.tangtang || []).filter(k => k.startsWith(keyPrefix));
    if (keys.length === 0) { onEnd && onEnd(); return; }
    playTangtang(keys[Math.floor(Math.random() * keys.length)], onEnd);
  }

  // 图片清单（由 scripts/gen-images.py 预生成，Flux 卡通插图）
  let IMAGE_MANIFEST = null;          // { vocab: [ids], sentences: [ids] }
  async function loadImageManifest() {
    try {
      const r = await fetch('./audio/images/manifest.json', { cache: 'no-store' });
      if (!r.ok) return;
      IMAGE_MANIFEST = await r.json();
      const vs = (IMAGE_MANIFEST.vocab || []).length;
      const ss = (IMAGE_MANIFEST.sentences || []).length;
      console.log(`[Image] Manifest loaded · ${vs} vocab + ${ss} sentence images`);
    } catch (e) {
      console.warn('[Image] manifest 未加载，只用 emoji:', e);
    }
  }
  // 返回句子对应的 hero 图片 URL（没则返回 null）
  function getSentenceImageUrl(sentenceId) {
    if (!IMAGE_MANIFEST || !sentenceId) return null;
    if ((IMAGE_MANIFEST.sentences || []).includes(sentenceId)) {
      return `./audio/images/sentences/${sentenceId}.jpg`;
    }
    return null;
  }
  // 返回单词对应的图片 URL
  function getVocabImageUrl(vocabId) {
    if (!IMAGE_MANIFEST || !vocabId) return null;
    if ((IMAGE_MANIFEST.vocab || []).includes(vocabId)) {
      return `./audio/images/vocab/${vocabId}.jpg`;
    }
    return null;
  }
  let currentAudio = null;            // 正在播的 <audio>
  async function loadAudioManifest() {
    try {
      const r = await fetch('./audio/manifest.json', { cache: 'no-store' });
      if (!r.ok) return;
      AUDIO_MANIFEST = await r.json();
      // 反向索引：en 原文 → coach hash
      COACH_LINE_TO_ID = {};
      for (const [cid, en] of Object.entries(AUDIO_MANIFEST.coach || {})) {
        COACH_LINE_TO_ID[en] = cid;
      }
      console.log(`[Audio] Manifest loaded · ${AUDIO_MANIFEST.sentences.length} sent + ${AUDIO_MANIFEST.vocab.length} vocab + ${Object.keys(AUDIO_MANIFEST.coach).length} coach`);
    } catch (e) {
      console.warn('[Audio] manifest 加载失败，只用 TTS:', e);
    }
  }
  // 两层停止：
  //   stopCurrent()  — 仅停当前正在播的 MP3/TTS（内部用，不打断循环）
  //   stopAllAudio() — 用户主动"停"：既停当前音频，也打断正在跑的循环（epoch++）
  let AUDIO_EPOCH = 0;
  function stopCurrent() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.src = ''; } catch(e){}
      currentAudio = null;
    }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
  function stopAllAudio() {
    AUDIO_EPOCH++;   // 打断所有 await highlightAndSpeak / playAll 循环
    stopCurrent();
  }
  function audioEpoch() { return AUDIO_EPOCH; }
  // 给音频 URL 加版本号,绕过浏览器/CDN 缓存
  // (音频文件本身没带哈希/版本,只能靠 query string)
  function withVersion(url) {
    if (!url) return url;
    const v = window.__APP_VERSION__ || '1';
    return url + (url.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(v);
  }

  // 播一个 MP3（返回 Promise,结束 resolve）
  function playMp3(url, { rate = 1.0 } = {}) {
    return new Promise(resolve => {
      stopCurrent();   // 只停上一段，不动 epoch，不打断调用者的循环
      const a = new Audio(withVersion(url));
      currentAudio = a;
      a.playbackRate = rate;
      a.onended = () => { if (currentAudio === a) currentAudio = null; resolve(); };
      a.onerror = () => { console.warn('[Audio] play fail:', url); resolve(); };
      a.play().catch(err => {
        console.warn('[Audio] play() blocked:', err);
        resolve();
      });
    });
  }

  let ttsVoice = null;
  let ttsVoices = [];
  let ttsVoicesReady = false;
  const ttsReadyListeners = [];

  function onTTSReady(cb) {
    if (ttsVoicesReady) { cb(); return; }
    ttsReadyListeners.push(cb);
  }

  function initTTS() {
    if (!('speechSynthesis' in window)) return;
    const pick = () => {
      ttsVoices = speechSynthesis.getVoices();
      if (!ttsVoices || ttsVoices.length === 0) return false;
      ttsVoicesReady = true;
      // 优先 1：用户锁定
      if (STATE?.settings?.voicePref) {
        const v = ttsVoices.find(x => x.name === STATE.settings.voicePref);
        if (v) { ttsVoice = v; return true; }
      }
      // 优先 2：en-US + female（最接近原版行为）
      const enUS = ttsVoices.filter(v => /^en[-_]US/i.test(v.lang));
      const enAny = ttsVoices.filter(v => /^en[-_]/i.test(v.lang));
      // Neural 神经声优先
      for (const re of [/Neural/i, /Wavenet/i, /Natural/i, /Online/i, /Studio/i]) {
        const hit = enUS.find(v => re.test(v.name)) || enAny.find(v => re.test(v.name));
        if (hit) { ttsVoice = hit; return true; }
      }
      // 女声（原始逻辑）—— 只挑英文声音，没有就为 null（不能用中文声读英文）
      ttsVoice = enUS.find(v => /female/i.test(v.name)) ||
                 enUS[0] || enAny[0] || null;
      return true;
    };

    if (!pick()) {
      // 第一次空，挂监听再试
      const onChange = () => {
        if (pick()) {
          speechSynthesis.removeEventListener('voiceschanged', onChange);
          fireReady();
        }
      };
      speechSynthesis.addEventListener('voiceschanged', onChange);
      // Chrome 有时不触发 voiceschanged，轮询兜底
      let tries = 0;
      const poll = setInterval(() => {
        tries++;
        if (pick() || tries > 20) {
          clearInterval(poll);
          if (ttsVoicesReady) fireReady();
        }
      }, 200);
    } else {
      fireReady();
    }
  }
  function fireReady() {
    ttsReadyListeners.splice(0).forEach(cb => { try { cb(); } catch(e) {} });
  }
  function listEnVoices() {
    return (ttsVoices || []).filter(v => /^en[-_]/i.test(v.lang));
  }
  // 主朗读函数：优先播放 MP3（Ana 儿童声），否则退回系统 TTS
  // opts: { rate, pitch, audioId, audioKind }
  //   audioId: 'sentence' id 或 'vocab' id，直接查音频库
  //   audioKind: 'sentence' | 'vocab' | 'coach'
  function speak(text, opts = {}) {
    if (!STATE?.settings?.soundOn) return Promise.resolve();
    const rate = opts.rate || STATE.settings.ttsRate;
    // 用户禁用了 MP3 直接走 TTS
    if (STATE.settings.useMp3 === false) return speakTTS(text, opts);

    // 尝试查到 MP3 路径
    const url = resolveAudioUrl(text, opts);
    if (url) {
      // MP3 默认生成时已经是儿童声 + 稍慢（-10%），playbackRate 再基于用户设置微调
      // TTS rate 1.0 = 正常, 0.8 = 慢 → MP3 playbackRate 对应 1.0, 0.8
      return playMp3(url, { rate }).then(() => {}, () => speakTTS(text, opts));
    }
    // 没有 MP3 → 走 TTS
    return speakTTS(text, opts);
  }

  // 根据 text 或 audioId 找到对应的 mp3 URL
  function resolveAudioUrl(text, opts) {
    if (!AUDIO_MANIFEST) return null;
    // 1. 明确指定 audioId
    if (opts.audioId && opts.audioKind) {
      if (opts.audioKind === 'sentence' && AUDIO_MANIFEST.sentences.includes(opts.audioId)) {
        return `./audio/sentences/${opts.audioId}.mp3`;
      }
      if (opts.audioKind === 'vocab' && AUDIO_MANIFEST.vocab.includes(opts.audioId)) {
        return resolveQuizAsset('vocab:' + opts.audioId, 'audio') || `./audio/vocab/${opts.audioId}.mp3`;
      }
    }
    // 2. Coach 台词：按 en 原文反查（即使带 {name} 占位符也能查到）
    //    如果台词含 {name},按当前孩子名字选带后缀的音频(c_xxx_ethan.mp3)
    //    默认(Cory)无后缀(c_xxx.mp3)
    const raw = opts.coachLineRaw || text;
    if (COACH_LINE_TO_ID) {
      const cid = COACH_LINE_TO_ID[raw];
      if (cid) {
        const childName = (STATE.settings.childName || 'Cory').toLowerCase();
        // 只有台词含 {name} 占位符才需要多套音频(不含的话所有名字听起来一样)
        const needsVariant = /\{name\}/.test(raw) && childName !== 'cory';
        if (needsVariant) {
          // 带后缀,app.js 无法检测文件存在,fallback 通过 audio onerror 机制(playMp3 已有)
          return `./audio/coach/${cid}_${childName}.mp3`;
        }
        return `./audio/coach/${cid}.mp3`;
      }
    }
    // 3. 用 text 匹配 sentence.en（如果 startsWith 或完全等于）
    if (typeof SENTENCES_BY_ID !== 'undefined' && AUDIO_MANIFEST.sentences.length > 0) {
      const hit = Object.values(SENTENCES_BY_ID).find(s => s.en === text);
      if (hit) return `./audio/sentences/${hit.id}.mp3`;
    }
    // 4. 匹配 vocab.en
    if (typeof VOCAB !== 'undefined') {
      const allV = [...(VOCAB.core||[]), ...(VOCAB.rhyme||[])];
      const hit = allV.find(w => w.en === text);
      if (hit && AUDIO_MANIFEST.vocab.includes(hit.id)) return resolveQuizAsset('vocab:' + hit.id, 'audio') || `./audio/vocab/${hit.id}.mp3`;
    }
    return null;
  }

  function speakTTS(text, opts = {}) {
    if (!('speechSynthesis' in window)) return Promise.resolve();
    speechSynthesis.cancel();
    return new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      if (ttsVoice) u.voice = ttsVoice;
      u.lang  = CONFIG.TTS_LANG;
      u.rate  = opts.rate  || STATE.settings.ttsRate;
      u.pitch = opts.pitch != null ? opts.pitch : (STATE.settings.ttsPitch ?? CONFIG.TTS_PITCH);
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
    });
  }

  // 教练专用
  function speakAsCoach(text, opts = {}) {
    // 把 raw 台词（含 {name} 占位符）传给 resolveAudioUrl 用来查 mp3
    return speak(text, Object.assign({ coachLineRaw: opts.coachLineRaw }, opts));
  }

  /* ---------- Cory 教练气泡 ---------- */
  function showCoach(sceneKey, vars = {}, { speak: doSpeak = true, duration = 0 } = {}) {
    const bubble = $('#coach-bubble');
    if (!bubble || typeof COACH === 'undefined') return;
    const childName = STATE.settings.childName || 'Cory';
    const coachName = STATE.settings.coachName || 'Cat';
    const line = COACH.line(sceneKey, Object.assign({ name: childName, coach: coachName }, vars));
    if (!line.en) return;
    $('#coach-avatar').textContent = COACH.meta.defaultAvatar;
    $('#coach-en').textContent = line.en;
    const zhEl = $('#coach-zh');
    zhEl.textContent = line.zh;
    zhEl.classList.toggle('hidden', !STATE.settings.showCoachZh);
    bubble.classList.remove('hidden');
    if (doSpeak && STATE.settings.englishGuide) {
      // 把"原始带占位符的台词"传给音频层，用于 MP3 查表
      speakAsCoach(line.en, { coachLineRaw: line._raw });
    }
    if (duration > 0) {
      clearTimeout(bubble._hideTimer);
      bubble._hideTimer = setTimeout(() => hideCoach(), duration);
    }
    return line;
  }
  function hideCoach() {
    const bubble = $('#coach-bubble');
    if (bubble) bubble.classList.add('hidden');
  }
  function setCoachMode(mode) {
    // mode: 'greeting' 居中大气泡 / '' 默认右上
    const bubble = $('#coach-bubble');
    if (bubble) bubble.classList.toggle('greeting', mode === 'greeting');
  }

  // ==================== 4. 工具 ====================
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const $  = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // DOM 构建器
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'style') el.style.cssText = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function')
        el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (attrs[k] === true) el.setAttribute(k, '');
      else if (attrs[k] != null && attrs[k] !== false) el.setAttribute(k, attrs[k]);
    }
    for (const c of kids.flat()) {
      if (c == null || c === false) continue;
      el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  function findVocabByEn(en) {
    const all = [...VOCAB.core, ...VOCAB.alphabet, ...VOCAB.rhyme];
    const lw = String(en).toLowerCase().replace(/[.!?,]/g, '').trim();
    return all.find(w => w.en.toLowerCase().replace(/[.!?,]/g, '').trim() === lw);
  }

  // ==================== 5. 屏幕路由 ====================
  const SCREENS = ['menu','lesson','result','dictation','quiz','flashcards','vocab','sentences','dashboard','print','settings','review','vocabsrs','tasks'];
  let currentScreen = 'menu';

  function switchScreen(name) {
    if (!SCREENS.includes(name)) return console.warn('unknown screen:', name);
    // 🔇 切屏 = 新上下文,停一切上一屏的音频 / TTS / 异步循环
    if (currentScreen && currentScreen !== name) stopAllAudio();
    $$('.screen').forEach(s => s.classList.remove('active'));
    const t = document.getElementById('screen-' + name);
    if (t) t.classList.add('active');
    currentScreen = name;
    const hb = $('#btn-home');
    if (name === 'menu') hb.classList.add('hidden');
    else                 hb.classList.remove('hidden');
    $('#app-main').scrollTop = 0;
  }

  function goHome() {
    stopAllAudio();      // 停 MP3 + TTS + 打断异步播放循环
    hideCoach();         // 让 Cory 气泡也关了，下面 greeting 会重开
    switchScreen('menu');
    renderMenu();
    setCoachMode('greeting');
    showCoach('greeting', { day: STATE.currentDay }, { duration: 6000 });
  }

  // ==================== 6. UI 辅助 ====================
  function toast(msg, ms = 2000) {
    const t = h('div', { class: 'toast' }, msg);
    $('#toast-root').appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, ms);
  }

  function modal(bodyNode, { onClose } = {}) {
    const bd = h('div', { class: 'modal-backdrop' });
    const panel = h('div', { class: 'modal' });
    if (bodyNode instanceof Node) panel.appendChild(bodyNode);
    else panel.innerHTML = bodyNode || '';
    bd.appendChild(panel);
    bd.addEventListener('click', e => { if (e.target === bd) close(); });
    $('#modal-root').appendChild(bd);
    function close() { bd.remove(); onClose && onClose(); }
    return { close, panel };
  }

  function spawnConfetti(n = CONFIG.CONFETTI_N, colors = ['pink','blue','yellow','mint','coral','lavender','star']) {
    const root = $('#confetti-root');
    for (let i = 0; i < n; i++) {
      const c = h('div', { class: `confetti confetti--${pick(colors)}` });
      const ang = Math.random() * Math.PI * 2;
      const dist = 150 + Math.random() * 350;
      c.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
      c.style.setProperty('--dy', `${Math.sin(ang) * dist - 100}px`);
      c.style.setProperty('--dr', `${(Math.random() - 0.5) * 1440}deg`);
      root.appendChild(c);
      setTimeout(() => c.remove(), 1500);
    }
  }

  function shakeEl(el) {
    el.classList.remove('shake');
    void el.offsetWidth; // 强制回流
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 500);
  }

  // 家长评星组件 - onPick(1|2|3)
  function makeStarRating(onPick) {
    const box = h('div', { class: 'star-rating', style: 'margin: 12px 0;' });
    for (let i = 1; i <= 3; i++) {
      const s = h('div', { class: 'star' }, '⭐');
      s.addEventListener('click', () => {
        box.querySelectorAll('.star').forEach((el, j) => el.classList.toggle('active', j < i));
        setTimeout(() => onPick(i), 400);
      });
      box.appendChild(s);
    }
    return box;
  }

  /* ============================================================
   * 7. 主菜单
   * ============================================================ */
  const MENU_TILES = [
    { id: 'today',      title: '今日任务',   sub: '3 张卡',        icon: '🎯', cls: 'pink',     action: renderTaskBoard },
    { id: 'vocabSrs',   title: '单词闯关',   sub: 'SRS 记忆',      icon: '🧠', cls: 'mint',     action: renderVocabSrs },
    { id: 'popquiz',    title: '突袭挑战',   sub: '5 词速测',      icon: '⚡', cls: 'yellow',   action: renderDailyPopQuiz },
    { id: 'flashcards', title: '闪卡',       sub: '认单词',        icon: '🃏', cls: 'mint',     action: renderFlashcards },
    { id: 'vocab',      title: '词库',       sub: '',              icon: '📚', cls: 'coral',    action: renderVocab },
    { id: 'sentences',  title: '句库',       sub: '',              icon: '💬', cls: 'lavender', action: renderSentences },
    { id: 'quiz',       title: '单元测验',   sub: 'U1 – U8',       icon: '📝', cls: 'yellow',   action: renderQuizPicker },
    { id: 'review',     title: '错题回顾',   sub: '',              icon: '🔁', cls: 'coral',    action: renderErrorReview },
    { id: 'dictation',  title: '默写本',     sub: '听音默写',      icon: '✏️', cls: 'blue',     action: renderDictationPicker },
    { id: 'dashboard',  title: '进度看板',   sub: '',              icon: '📊', cls: 'peach',    action: renderDashboard },
    { id: 'print',      title: '打印中心',   sub: '词卡 · 默写 · 试卷', icon: '🖨️', cls: 'sky', action: renderPrintCenter },
    { id: 'settings',   title: '设置',       sub: '语速 · 名字',   icon: '⚙️', cls: 'blue',     action: renderSettings },
  ];

  function renderMenu() {
    const totalWords = VOCAB.core.length + VOCAB.alphabet.length + VOCAB.rhyme.length;
    MENU_TILES[2].sub = `${totalWords} 词`;
    MENU_TILES[3].sub = `${SENTENCES.length} 句`;
    // 错题回顾徽章显示当前错题数
    const reviewCount = Object.keys(STATE.mistakeBank || {}).length;
    const reviewTile = MENU_TILES.find(t => t.id === 'review');
    if (reviewTile) reviewTile.sub = reviewCount > 0 ? `${reviewCount} 道错题` : '暂无错题';

    const unit = unitForDay(STATE.currentDay);
    const unitLabel = unit ? `${unit.emoji} Unit ${unit.id} · ${unit.titleZh}` : '';

    const screen = $('#screen-menu');
    screen.innerHTML = '';
    screen.appendChild(h('div', { class: 'screen-menu' },
      h('div', { style: 'text-align: center; margin: 16px 0 32px;' },
        h('h2', {}, `👋 今天 Day ${STATE.currentDay}`),
        h('p', { style: 'color: var(--ink-light); font-size: 1.2rem; margin: 0;' }, unitLabel)
      ),
      h('div', { class: 'menu-grid' },
        ...MENU_TILES.map(t =>
          h('div', { class: `menu-tile menu-tile--${t.cls}`, onclick: t.action },
            h('div', { class: 'icon' }, t.icon),
            h('div', { class: 'title' }, t.title),
            h('div', { class: 'sub' }, t.sub)
          )
        )
      )
    ));
  }

  /* ============================================================
   * 8. 闯关课程 · 5 关状态机（Phase 1.5 重构）
   * ============================================================
   * 改动：
   *   - 支持 'unit-full' 模式（一次学完整个 Unit）
   *   - 每关内有 ‹ 上一句 / 下一句 › 导航
   *   - 填空做错进 retryQueue，全对才能通关
   *   - 关卡切换自动播放（3 秒倒计时，可跳过）
   *   - Cory 英文引导穿插
   * ============================================================ */
  const STAGES = ['listen', 'follow', 'fill', 'memorize', 'swap'];
  const STAGE_INFO = {
    listen:   { title: '听一听', sub: '整组听一遍',    icon: '👂', coachScene: 'beforeListen' },
    follow:   { title: '跟一跟', sub: '跟读每一句',    icon: '🗣️', coachScene: 'beforeFollow' },
    fill:     { title: '填一填', sub: '全对才能通关',   icon: '✏️', coachScene: 'beforeFill' },
    memorize: { title: '背一背', sub: '看 emoji 背句', icon: '🧠', coachScene: 'beforeMemorize' },
    swap:     { title: '换一换', sub: '造 3 句新的',   icon: '🔄', coachScene: 'beforeSwap' },
  };
  const LESSON = {
    day: 1, unit: null,
    sentences: [],
    sentenceIdx: 0,
    stage: 'listen',
    stageStars: { follow: 0, memorize: 0, swap: 0 },
    swapMade: 0, swapFilled: [],
    // 填空关：全对才能过
    fillQueue: [],       // [{sentence, slotIdx}]
    fillDone:  0,
    fillTotal: 0,
    correctStreak: 0,    // 连对计数
  };

  function startLesson() {
    const day = STATE.currentDay;
    const mode = STATE.settings.lessonMode || 'unit-full';
    const ids = (typeof getLessonSentenceIds === 'function')
      ? getLessonSentenceIds(day, mode)
      : (DAILY_SENTENCES[day] || []);
    if (ids.length === 0) {
      toast(`Day ${day} 暂无课程句子`);
      return;
    }
    LESSON.day = day;
    LESSON.unit = (typeof DAY_TO_UNIT !== 'undefined') ? DAY_TO_UNIT[day] : null;
    LESSON.sentences = ids.map(id => SENTENCES_BY_ID[id]).filter(Boolean);
    LESSON.sentenceIdx = 0;
    LESSON.stage = 'listen';
    LESSON.stageStars = { follow: 0, memorize: 0, swap: 0 };
    LESSON.swapMade = 0;
    LESSON.swapFilled = [];
    LESSON.correctStreak = 0;
    switchScreen('lesson');
    setCoachMode('');
    showCoach('lessonStart', { day });
    renderLesson();
  }

  /* ---------- 句子导航组件（所有关卡共用） ---------- */
  function buildSentenceNav() {
    const nav = h('div', { class: 'sentence-nav' });
    const prevBtn = h('button', { class: 'nav-btn', 'aria-label': '上一句' }, '‹');
    prevBtn.disabled = LESSON.sentenceIdx <= 0;
    prevBtn.addEventListener('click', () => {
      if (LESSON.sentenceIdx > 0) {
        stopAllAudio();
        LESSON.sentenceIdx--;
        renderCurrentStage();
      }
    });
    const cur = LESSON.sentences[LESSON.sentenceIdx];
    const masteryStatus = cur ? getMastery(cur.id) : 'new';
    const dot = masteryStatus === 'mastered' ? h('span', { class: 'dot-mastered', title: '已掌握' }) : null;
    const indicator = h('span', { class: 'nav-indicator' },
      `${LESSON.sentenceIdx + 1} / ${LESSON.sentences.length}`,
      dot
    );
    const nextBtn = h('button', { class: 'nav-btn', 'aria-label': '下一句' }, '›');
    nextBtn.disabled = LESSON.sentenceIdx >= LESSON.sentences.length - 1;
    nextBtn.addEventListener('click', () => {
      if (LESSON.sentenceIdx < LESSON.sentences.length - 1) {
        stopAllAudio();
        LESSON.sentenceIdx++;
        renderCurrentStage();
      }
    });
    nav.append(prevBtn, indicator, nextBtn);
    return nav;
  }
  // 当前关卡内重渲（导航点击时调）
  function renderCurrentStage() {
    ({ listen: stageListen, follow: stageFollow, fill: stageFill, memorize: stageMemorize, swap: stageSwap }[LESSON.stage])();
  }

  function renderLesson() {
    const screen = $('#screen-lesson');
    const idx = STAGES.indexOf(LESSON.stage);
    const info = STAGE_INFO[LESSON.stage];
    const unitLabel = LESSON.unit ? `Unit ${LESSON.unit}` : `Day ${LESSON.day}`;
    screen.innerHTML = '';
    screen.appendChild(h('div', { class: 'lesson-stage' },
      h('div', { class: 'lesson-header' },
        h('div', { class: 'lesson-title' },
          h('span', { style: 'font-size: 1.5rem;' }, info.icon),
          ` ${unitLabel} · 关卡 ${idx + 1}/5 · ${info.title}`
        ),
        h('div', { class: 'lesson-progress' },
          ...STAGES.map((stageKey, i) => {
            const stageInfo = STAGE_INFO[stageKey];
            const dot = h('div', {
              class: `dot ${i < idx ? 'done' : (i === idx ? 'active' : '')}`,
              title: `${stageInfo.icon} ${stageInfo.title}`,
              'aria-label': `切换到第 ${i + 1} 关：${stageInfo.title}`,
              role: 'button',
            }, h('span', { class: 'dot-label' }, stageInfo.icon));
            dot.addEventListener('click', () => jumpToStage(stageKey));
            return dot;
          })
        )
      ),
      h('div', { class: 'lesson-main', id: 'lesson-main' }),
      h('div', { class: 'lesson-footer' },
        h('button', { class: 'btn btn--sm', onclick: confirmExit }, '⏸ 暂停'),
        h('div', { style: 'font-family: var(--font-zh-body); color: var(--ink-light);' }, info.sub),
        h('button', { class: 'btn btn--sm btn--mint', onclick: nextStage }, '⏭ 跳过')
      )
    ));

    // 关卡引导语（Cory）
    if (info.coachScene) {
      showCoach(info.coachScene, {}, { duration: 4500 });
    }
    renderCurrentStage();
  }

  function confirmExit() {
    const m = modal(h('div', {},
      h('h3', {}, '离开课程？'),
      h('p', {}, '当前进度不会保存。'),
      h('div', { class: 'modal-footer' },
        h('button', { class: 'btn', onclick: () => m.close() }, '继续学习'),
        h('button', { class: 'btn btn--coral', onclick: () => { m.close(); goHome(); } }, '退出')
      )
    ));
  }

  // 直接跳到某一关（点顶部 5 个点触发）
  function jumpToStage(stageKey) {
    if (!STAGES.includes(stageKey)) return;
    if (stageKey === LESSON.stage) return;
    stopAllAudio();
    LESSON.stage = stageKey;
    LESSON.sentenceIdx = 0;
    // 填空关的进度重算
    LESSON.fillQueue = [];
    LESSON.fillInit = null;
    LESSON.correctStreak = 0;
    renderLesson();
  }

  function nextStage() {
    const idx = STAGES.indexOf(LESSON.stage);
    if (idx < STAGES.length - 1) {
      showCoach('stageDone', {}, { duration: 2500 });
      playInterstitial(STAGES[idx + 1]).then(() => {
        // 30% 概率触发突袭拼写(从课程句子挑词)
        maybeTriggerPopQuizOnStageBreak(() => {
          LESSON.stage = STAGES[idx + 1];
          LESSON.sentenceIdx = 0;
          renderLesson();
        }, idx);
      });
    } else {
      completeLesson();
    }
  }

  // 关卡之间的过场（自动续、可跳过）
  function playInterstitial(nextStageKey) {
    return new Promise(resolve => {
      const info = STAGE_INFO[nextStageKey];
      const main = $('#lesson-main');
      if (!main) { resolve(); return; }
      // 先藏起 coach 气泡,避免 fixed 定位盖住"立即开始"按钮
      hideCoach();
      main.innerHTML = '';
      let count = 3;
      const bigIcon = h('div', { style: 'font-size: 6rem; text-align: center; margin: 20px 0;' }, info.icon);
      const title = h('h2', { style: 'text-align: center; font-family: var(--font-zh-title);' },
        `下一关：${info.title}`
      );
      const counter = h('div', {
        style: 'text-align: center; font-family: var(--font-en); font-size: 4rem; color: var(--pink-dark); margin: 16px 0;'
      }, String(count));
      const skip = h('button', { class: 'btn btn--lg btn--mint' }, '⏭ 立即开始');
      main.append(
        h('div', { style: 'max-width: 500px; margin: 40px auto; text-align: center;' },
          bigIcon, title, counter, skip
        )
      );
      let done = false;
      const tick = setInterval(() => {
        count--;
        counter.textContent = String(count);
        if (count <= 0) finish();
      }, 1000);
      skip.addEventListener('click', finish);
      function finish() {
        if (done) return;
        done = true;
        clearInterval(tick);
        resolve();
      }
    });
  }

  /* -------- 关 1: 听一听（支持句子导航 + 连播 + 可打断） -------- */
  function stageListen() {
    const main = $('#lesson-main');
    main.innerHTML = '';

    main.appendChild(buildSentenceNav());
    // 小一点的耳朵图标，给句子和按钮留空间
    main.appendChild(h('div', { style: 'font-size: 2.2rem; margin-top: -4px;' }, '👂'));

    const s = LESSON.sentences[LESSON.sentenceIdx];
    const container = h('div', { id: 'listen-body', style: 'text-align: center;' });
    renderListenSentence(container, s);
    main.appendChild(container);

    const actions = h('div', { class: 'flex gap-md justify-center flex-wrap', style: 'margin-top: 18px;' });
    main.appendChild(actions);
    rebuildActions('idle');

    function rebuildActions(mode) {
      actions.innerHTML = '';
      if (mode === 'idle') {
        actions.append(
          h('button', { class: 'btn btn--xl btn--pink hint-pulse', onclick: playOne }, '🔊 播放这句'),
          h('button', { class: 'btn btn--lg btn--mint',             onclick: playAll }, '▶️ 连播全部'),
          h('button', { class: 'btn btn--lg btn--yellow',           onclick: playSlow }, '🐢 慢速')
        );
      } else if (mode === 'playing') {
        actions.append(
          h('button', { class: 'btn btn--xl btn--coral', onclick: stopAllAudio }, '⏹ 停止')
        );
      } else if (mode === 'done') {
        actions.append(
          h('button', { class: 'btn btn--lg btn--mint', onclick: nextStage }, '👉 下一关'),
          h('button', { class: 'btn btn--lg',           onclick: playAll   }, '🔁 再听一遍')
        );
      }
    }

    async function playOne() {
      const my = audioEpoch();
      rebuildActions('playing');
      await highlightAndSpeak(s.en, container.querySelector('.sentence-display'));
      if (my !== audioEpoch()) return; // 被打断了
      rebuildActions('idle');
    }

    async function playSlow() {
      const my = audioEpoch();
      rebuildActions('playing');
      // 慢速：MP3 用 playbackRate；TTS 用 rate 参数
      await speak(s.en, { rate: 0.6 });
      if (my !== audioEpoch()) return;
      rebuildActions('idle');
    }

    async function playAll() {
      rebuildActions('playing');
      const my = audioEpoch();
      for (let i = LESSON.sentenceIdx; i < LESSON.sentences.length; i++) {
        if (my !== audioEpoch()) return;    // 用户点了别的,退出
        LESSON.sentenceIdx = i;
        // 重渲导航指示 + 句子
        main.replaceChild(buildSentenceNav(), main.firstChild);
        renderListenSentence(container, LESSON.sentences[i]);
        await highlightAndSpeak(LESSON.sentences[i].en, container.querySelector('.sentence-display'));
        if (my !== audioEpoch()) return;
        await sleep(600);
      }
      if (my !== audioEpoch()) return;
      rebuildActions('done');
    }

    // 进入关卡 1 自动 连播（从当前句开始到末尾）
    const entryEpoch = audioEpoch();
    setTimeout(() => {
      if (entryEpoch === audioEpoch()) playAll();
    }, 350);
  }

  // 渲染一句听力内容（逐词 span + 中文）
  function renderListenSentence(container, s) {
    container.innerHTML = '';
    const words = s.en.split(/(\s+)/).filter(x => x.trim());
    const sentEl = h('div', { class: 'sentence-display' });
    words.forEach((w, wi) => {
      sentEl.appendChild(h('span', { class: 'word', 'data-idx': wi }, w));
      if (wi < words.length - 1) sentEl.appendChild(document.createTextNode(' '));
    });
    container.appendChild(sentEl);
    container.appendChild(h('div', { class: 'sentence-zh' }, s.zh));
  }

  // 逐词高亮 + 整句 TTS（基于字符长度估算时长 · 可被 stopAllAudio 打断）
  async function highlightAndSpeak(text, containerEl) {
    if (!containerEl) return;
    const spans = containerEl.querySelectorAll('.word');
    const words = text.split(/\s+/).filter(Boolean);
    const my = audioEpoch();
    const spokenPromise = speak(text);
    const MS_PER_CHAR = 80;
    for (let i = 0; i < spans.length; i++) {
      if (my !== audioEpoch()) {
        spans.forEach(s => s.classList.remove('highlight'));
        return;
      }
      spans.forEach(s => s.classList.remove('highlight'));
      spans[i].classList.add('highlight');
      const ms = (words[i]?.length || 3) * MS_PER_CHAR + 50;
      await sleep(ms);
    }
    spans.forEach(s => s.classList.remove('highlight'));
    await spokenPromise;
  }

  /* -------- 关 2: 跟一跟 -------- */
  function stageFollow() {
    const main = $('#lesson-main');
    main.innerHTML = '';
    const s = LESSON.sentences[LESSON.sentenceIdx];

    // 跟一跟专属录音状态(每次重置)
    let followMediaRecorder = null;
    let followBlob = null;
    let followUrl = null;
    let followStream = null;
    let followChunks = [];
    let followStartMs = 0;

    main.appendChild(buildSentenceNav());
    main.appendChild(h('div', { class: 'mascot' }, '🗣️'));

    const sentEl = h('div', { class: 'sentence-display' }, s.en);
    main.appendChild(sentEl);
    main.appendChild(h('div', { class: 'sentence-zh' }, s.zh));

    // 状态行 + 按钮(简化版 3 大按钮 + 2 辅助)
    const statusEl = h('div', { class: 'follow-status' }, '👆 先听老师读,再按麦克风跟读');
    main.appendChild(statusEl);

    const primaryRow = h('div', { class: 'flex gap-md justify-center', style: 'margin-top: 14px; flex-wrap: wrap;' });
    const teacherBtn = h('button', { class: 'btn btn--lg btn--mint' }, '🔊 听老师');
    const recBtn = h('button', { class: 'btn btn--xl btn--pink voice-rec-btn' }, '🎤 录我的');
    const myBtn = h('button', { class: 'btn btn--lg btn--yellow' }, '🔊 听我的');
    myBtn.disabled = true;
    primaryRow.append(teacherBtn, recBtn, myBtn);
    main.appendChild(primaryRow);

    const secondaryRow = h('div', { class: 'flex gap-sm justify-center', style: 'margin-top: 10px; flex-wrap: wrap;' });
    const slowBtn = h('button', { class: 'btn btn--sm' }, '🐢 老师慢读');
    const compareBtn = h('button', { class: 'btn btn--sm btn--yellow' }, '👂 对比听');
    compareBtn.disabled = true;
    secondaryRow.append(slowBtn, compareBtn);
    main.appendChild(secondaryRow);

    teacherBtn.addEventListener('click', () => {
      statusEl.textContent = '🔊 老师读中...';
      speak(s.en);
    });
    slowBtn.addEventListener('click', () => {
      statusEl.textContent = '🐢 老师慢读...';
      speak(s.en, { rate: 0.55 });
    });

    async function startRec() {
      try {
        followStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        followChunks = [];
        let mt = '';
        for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']) {
          if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) { mt = t; break; }
        }
        followMediaRecorder = mt ? new MediaRecorder(followStream, { mimeType: mt }) : new MediaRecorder(followStream);
        followMediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) followChunks.push(e.data); };
        followMediaRecorder.onstop = () => {
          const durMs = Date.now() - followStartMs;
          followBlob = new Blob(followChunks, { type: followMediaRecorder.mimeType || mt || 'audio/webm' });
          if (followUrl) URL.revokeObjectURL(followUrl);
          followUrl = URL.createObjectURL(followBlob);
          if (followStream) { followStream.getTracks().forEach(t => t.stop()); followStream = null; }
          recBtn.textContent = '🎤 重录';
          recBtn.classList.remove('recording');
          if (followBlob.size >= 200) {
            myBtn.disabled = false;
            compareBtn.disabled = false;
            statusEl.textContent = '🎉 录了 ' + (durMs / 1000).toFixed(1) + '秒 · 自动回放中...';
            statusEl.style.color = '#090';
            setTimeout(() => playMyVoice(() => {
              statusEl.textContent = '✅ 听到自己的了吗?按 👂 跟老师比,或重录一次';
            }), 200);
          } else {
            statusEl.textContent = '⚠️ 没录到声音(' + followBlob.size + 'B) · 检查麦克风权限';
            statusEl.style.color = '#c40';
          }
        };
        followMediaRecorder.start(200);
        followStartMs = Date.now();
        recBtn.textContent = '⏹ 停止';
        recBtn.classList.add('recording');
        statusEl.textContent = '🔴 录音中... 读 "' + s.en + '" 完按停止';
        statusEl.style.color = '#c03';
      } catch (e) {
        alert('无法访问麦克风 · 请授权\n\n' + (e.message || e.name || ''));
      }
    }

    function playMyVoice(onEnd) {
      if (!followUrl) return;
      const a = new Audio(followUrl);
      a.onended = () => onEnd && onEnd();
      a.onerror = () => {
        statusEl.textContent = '⚠️ 播放失败';
        statusEl.style.color = '#c40';
        onEnd && onEnd();
      };
      a.play().catch(err => {
        statusEl.textContent = '⚠️ 播放被拦截 · 再点 "🔊 听我的"';
        statusEl.style.color = '#c80';
        onEnd && onEnd();
      });
    }

    recBtn.addEventListener('click', () => {
      if (followMediaRecorder && followMediaRecorder.state === 'recording') followMediaRecorder.stop();
      else startRec();
    });

    myBtn.addEventListener('click', () => {
      statusEl.textContent = '🔊 回放中...';
      statusEl.style.color = '#06a';
      playMyVoice(() => { statusEl.textContent = '✅ 听完了'; statusEl.style.color = '#090'; });
    });

    compareBtn.addEventListener('click', async () => {
      if (!followUrl) return;
      statusEl.textContent = '🔊 老师先读...';
      statusEl.style.color = '#06a';
      await speak(s.en);
      await sleep(400);
      statusEl.textContent = '🎤 轮到你的录音...';
      playMyVoice(() => { statusEl.textContent = '✅ 对比完了 · 像不像?'; statusEl.style.color = '#090'; });
    });

    // 家长评星(保留,不是每次都打)
    main.appendChild(h('div', { style: 'color: var(--ink-light); margin-top: 24px; text-align: center;' }, '家长评分 → 进下一句:'));
    main.appendChild(makeStarRating(n => {
      LESSON.stageStars.follow = Math.max(LESSON.stageStars.follow, n);
      // 清理当前句的录音资源
      if (followMediaRecorder && followMediaRecorder.state === 'recording') { try { followMediaRecorder.stop(); } catch(e){} }
      if (followStream) followStream.getTracks().forEach(t => t.stop());
      if (followUrl) URL.revokeObjectURL(followUrl);
      if (LESSON.sentenceIdx < LESSON.sentences.length - 1) {
        LESSON.sentenceIdx++;
        stageFollow();
      } else {
        nextStage();
      }
    }));

    // 首次进页面自动让老师示范一次
    const my = audioEpoch();
    setTimeout(() => { if (my === audioEpoch()) speak(s.en); }, 400);
  }

  // —— 语音识别(Web Speech API) —— 跟读评分
  // 兼容性: Chrome / Edge / Android Chrome 都支持,需要联网
  function startFollowRecognition(sentence, sentEl, resultBox, micBtn) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      toast('浏览器不支持语音识别,请用 Chrome/Edge');
      return;
    }
    stopCurrent();
    micBtn.classList.add('recording');
    micBtn.innerHTML = '🎙️ 说吧!';
    resultBox.innerHTML = '';
    resultBox.appendChild(h('div', { class: 'follow-listening' }, '🎧 听你读...'));

    const rec = new SpeechRec();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    const finalize = () => {
      micBtn.classList.remove('recording');
      micBtn.innerHTML = '🎤 再读一次';
    };

    rec.onresult = (event) => {
      // 取所有备选里得分最高的匹配
      const alts = Array.from(event.results[0]).map(r => r.transcript);
      let best = { score: 0, results: [], heard: '' };
      alts.forEach(alt => {
        const r = scoreTranscript(alt, sentence.en);
        if (r.score > best.score) best = r;
      });
      showFollowResult(best, sentence, sentEl, resultBox);
      finalize();
    };
    rec.onerror = (e) => {
      console.warn('[Speech] error:', e.error);
      resultBox.innerHTML = '';
      resultBox.appendChild(h('div', { class: 'follow-error' },
        e.error === 'not-allowed' ? '🎤 请给麦克风权限' :
        e.error === 'no-speech' ? '🤔 没听到声音,再按按钮试试' :
        '识别出错: ' + e.error
      ));
      finalize();
    };
    rec.onend = () => finalize();

    try { rec.start(); }
    catch (e) { toast('启动麦克风失败: ' + e.message); finalize(); }
  }

  // 比较识别文本与目标句子，返回词级对错 + 总分
  function scoreTranscript(transcript, target) {
    const tokenize = s => String(s || '').toLowerCase()
      .replace(/[.!?,;:'"`()[\]{}\-]/g, '')
      .split(/\s+/).filter(Boolean);
    const heard = tokenize(transcript);
    const want  = tokenize(target);
    // 简单词级匹配 + 近似(前 3 字母相同)
    const results = want.map(w => {
      const ok = heard.includes(w);
      const close = !ok && heard.some(h => w.length >= 3 && h.startsWith(w.slice(0, 3)));
      return { word: w, status: ok ? 'ok' : (close ? 'close' : 'miss') };
    });
    const hits = results.filter(r => r.status === 'ok').length;
    const closes = results.filter(r => r.status === 'close').length;
    const score = Math.round((hits + closes * 0.5) / want.length * 100);
    return { score, results, heard: transcript };
  }

  function showFollowResult(r, sentence, sentEl, resultBox) {
    // 高亮句子每个词
    const spans = sentEl.querySelectorAll('.follow-word');
    spans.forEach(sp => sp.classList.remove('ok', 'close', 'miss'));
    r.results.forEach((res, i) => {
      if (spans[i]) spans[i].classList.add(res.status);
    });
    // 结果区
    resultBox.innerHTML = '';
    const emoji = r.score >= 85 ? '🏆' : r.score >= 60 ? '✨' : '💪';
    const msg   = r.score >= 85 ? '太棒了!'      : r.score >= 60 ? '不错,可以更响' : '再试一次!';
    resultBox.appendChild(h('div', { class: 'follow-score' },
      h('span', { class: 'fs-emoji' }, emoji),
      h('span', { class: 'fs-num' }, r.score + ' 分'),
      h('span', { class: 'fs-msg' }, msg)
    ));
    resultBox.appendChild(h('div', { class: 'follow-heard' }, '👂 我听到: "' + r.heard + '"'));
    // 满 85 自动给自己加一星
    if (r.score >= 85 && (LESSON.stageStars.follow || 0) < 3) {
      LESSON.stageStars.follow = Math.max(LESSON.stageStars.follow, r.score >= 95 ? 3 : 2);
    }
    if (r.score >= 85) spawnConfetti(Math.min(30, r.score / 3));
  }

  /* -------- 关 3: 填一填（全对才能通关 · retry 队列） -------- */
  function stageFill() {
    // 进关卡的头一次才初始化，做完的空队列不再重建
    if (LESSON.fillInit !== LESSON.stage) {
      LESSON.fillQueue = [];
      LESSON.sentences.forEach(s => {
        if (!s.slots || s.slots.length === 0) return;
        const targetIdx = Math.floor(Math.random() * s.slots.length);
        LESSON.fillQueue.push({ sentenceId: s.id, targetIdx });
      });
      LESSON.fillTotal = LESSON.fillQueue.length;
      LESSON.fillDone  = 0;
      LESSON.fillInit  = LESSON.stage;
      LESSON.correctStreak = 0;
    }

    const main = $('#lesson-main');
    main.innerHTML = '';

    if (LESSON.fillQueue.length === 0) {
      // 全对完 → 下一关
      showCoach('stageDone', {}, { duration: 2000 });
      setTimeout(nextStage, 800);
      return;
    }

    const task = LESSON.fillQueue[0];
    const s = SENTENCES_BY_ID[task.sentenceId];
    const target = s.slots[task.targetIdx];

    // 进度条（已完成 / 总数 + 错题回流提示）
    const progress = h('div', { class: 'chip chip--blue' },
      `✏️ ${LESSON.fillDone} / ${LESSON.fillTotal} · 全对才能过关`);
    main.appendChild(progress);

    // 如果是回流的错题，给个提示
    if (task._retry) {
      main.appendChild(h('div', { class: 'retry-banner' }, '🔁 刚刚错过，再来一次～'));
    }

    main.appendChild(h('div', { class: 'mascot think' }, '🤔'));

    // 构建 frame：目标空位高亮 ?，其它空位填答案
    const frameEl = buildFrameEl(s, {
      slotRenderer: (slotIdx, slot) => {
        if (slotIdx === task.targetIdx) return h('span', { class: 'blank-slot active', id: 'target-blank' }, '?');
        return h('span', { class: 'blank-slot filled' }, slot.answer);
      }
    });
    main.appendChild(frameEl);
    main.appendChild(h('div', { class: 'sentence-zh' }, s.zh));

    // 选项：1 正 + 2 干扰
    const wrongs = shuffle(target.pool.filter(w => w !== target.answer)).slice(0, 2);
    const choices = shuffle([target.answer, ...wrongs]);
    const choiceGrid = h('div', { class: 'choice-grid', style: 'margin-top: 24px;' });
    choices.forEach(word => {
      const btn = h('button', { class: 'choice-bubble' }, word);
      btn.addEventListener('click', () => onPick(btn, word));
      choiceGrid.appendChild(btn);
    });
    main.appendChild(choiceGrid);

    // 再听一遍按钮
    main.appendChild(h('div', { class: 'flex gap-sm justify-center', style: 'margin-top: 12px;' },
      h('button', { class: 'btn btn--sm btn--yellow', onclick: () => speak(s.en) }, '🔊 再听一遍')
    ));

    async function onPick(btn, word) {
      if (btn.disabled) return;
      if (word === target.answer) {
        // 答对
        btn.classList.add('correct');
        const blank = $('#target-blank');
        blank.textContent = word;
        blank.classList.remove('active');
        blank.classList.add('correct');
        spawnConfetti(task._retry ? 15 : 25);
        speak(s.en);
        markCorrect(s.id);
        LESSON.fillQueue.shift();
        LESSON.fillDone++;
        LESSON.correctStreak++;
        if (LESSON.correctStreak === 2)      showCoach('streak', {}, { duration: 1800 });
        else if (LESSON.correctStreak === 3) showCoach('streak', {}, { duration: 1800 });
        else                                 showCoach('correct', {}, { duration: 1500 });
        await sleep(1400);
        stageFill();
      } else {
        // 答错：当前题推回队尾，必须做对才能过
        btn.classList.add('wrong');
        shakeEl(frameEl);
        LESSON.correctStreak = 0;
        markWrong(s.id);
        showCoach('wrong', {}, { duration: 2000 });
        speak(s.en, { rate: 0.6 }); // 错了放慢再听一遍
        // 推回队尾（标记 retry）
        const failed = LESSON.fillQueue.shift();
        failed._retry = true;
        LESSON.fillQueue.push(failed);
        LESSON.fillTotal++;  // 总数 +1 表示又加了一题
        setTimeout(() => {
          btn.classList.remove('wrong');
          btn.disabled = true;
        }, 500);
        // 2 秒后触发"突袭拼写"小卡(做错即补,然后继续下一题)
        await sleep(1600);
        triggerPopQuizAfterFillWrong(target.answer, () => {
          stageFill();
        });
      }
    }
  }

  // 通用 frame 构建器：parts + 每个空位由 slotRenderer 决定如何渲染
  function buildFrameEl(sent, { slotRenderer } = {}) {
    const wrapper = h('div', { class: 'sentence-frame' });
    const parts = sent.frame.split('___');
    let slotIdx = 0;
    parts.forEach((text, i) => {
      if (text) {
        // 按空白切词，保留标点
        text.split(/\s+/).filter(Boolean).forEach(tok => {
          wrapper.appendChild(h('span', {}, tok));
        });
      }
      if (i < parts.length - 1) {
        const slotEl = slotRenderer
          ? slotRenderer(slotIdx, sent.slots[slotIdx])
          : h('span', { class: 'blank-slot empty' }, '?');
        wrapper.appendChild(slotEl);
        slotIdx++;
      }
    });
    return wrapper;
  }

  /* -------- 关 4: 背一背（有图就显示大图，没图退回 emoji 提示） -------- */
  function stageMemorize() {
    const main = $('#lesson-main');
    main.innerHTML = '';
    const s = LESSON.sentences[LESSON.sentenceIdx];
    if (!s) { nextStage(); return; }

    const imgUrl = getSentenceImageUrl(s.id);

    main.appendChild(buildSentenceNav());

    // 用横向布局容器装 [图 | 答题区]，在窄横屏下 CSS 改成 flex-row，宽屏保持默认垂直
    const layout = h('div', { class: 'memorize-layout' });
    main.appendChild(layout);

    // —— 左：hero 图 或 emoji 提示 ——
    if (imgUrl) {
      layout.appendChild(h('div', { class: 'memorize-hero' },
        h('img', { src: imgUrl, alt: s.zh, loading: 'lazy' })
      ));
    } else {
      const hints = (s.slots || []).map(slot => {
        const v = findVocabByEn(slot.answer);
        return v?.emoji || '💭';
      });
      const hintBox = h('div', { class: 'memorize-hero', style: 'padding: 16px; display: flex; gap: 16px; justify-content: center; align-items: center; font-size: 3rem;' },
        ...hints.map(e => h('span', {}, e))
      );
      layout.appendChild(hintBox);
    }

    // —— 右：答题区 ——
    const answerBox = h('div', { class: 'memorize-answer' });
    layout.appendChild(answerBox);

    const frameEl = buildFrameEl(s); // 全空位
    frameEl.style.opacity = '0.5';
    answerBox.appendChild(frameEl);
    answerBox.appendChild(h('div', { class: 'sentence-zh' }, s.zh));

    let revealed = false;
    const revealBtn = h('button', { class: 'btn btn--lg btn--yellow', onclick: () => {
      if (revealed) return;
      revealed = true;
      frameEl.style.opacity = '1';
      const blanks = frameEl.querySelectorAll('.blank-slot');
      blanks.forEach((el, i) => {
        el.classList.remove('empty');
        el.classList.add('filled');
        el.textContent = s.slots[i].answer;
      });
      revealBtn.textContent = '🔊 朗读';
      revealBtn.classList.remove('btn--yellow');
      revealBtn.classList.add('btn--pink');
      revealBtn.onclick = () => speak(s.en);
      speak(s.en);
    }}, '💡 看答案');
    answerBox.appendChild(revealBtn);

    answerBox.appendChild(h('div', { style: 'font-family: var(--font-zh-body); color: var(--ink-light); font-size: 0.9rem;' }, '👪 家长评星：'));
    answerBox.appendChild(makeStarRating(n => {
      LESSON.stageStars.memorize = Math.max(LESSON.stageStars.memorize, n);
      if (LESSON.sentenceIdx < LESSON.sentences.length - 1) {
        LESSON.sentenceIdx++;
        stageMemorize();
      } else {
        nextStage();
      }
    }));
  }

  /* -------- 关 5: 换一换 -------- */
  function stageSwap() {
    const main = $('#lesson-main');
    const tmpl = LESSON.sentences[0];
    if (!tmpl || !tmpl.slots || tmpl.slots.length === 0) {
      nextStage(); return;
    }
    main.innerHTML = '';

    main.appendChild(h('div', { class: 'mascot happy' }, '🔄'));
    main.appendChild(h('h3', { style: 'font-size: 1.3rem;' },
      `用模板造 3 句新的（${LESSON.swapMade} / 3）`
    ));

    // 全空位 frame
    LESSON.swapFilled = new Array(tmpl.slots.length).fill(null);
    const frameEl = buildFrameEl(tmpl);
    main.appendChild(frameEl);

    // 词汇池：按 slot 分组展示（名词/形容词/动词等的视觉区分）
    const poolEl = h('div', { class: 'word-pool' });
    const chipCache = {}; // { slotIdx: [chipEl...] }
    tmpl.slots.forEach((slot, si) => {
      chipCache[si] = [];
      const clsVariant = tmpl.slots.length > 1
        ? (si === 0 ? 'word-chip--noun' : si === 1 ? 'word-chip--adj' : 'word-chip--verb')
        : '';
      slot.pool.forEach(word => {
        const chip = h('button', { class: `word-chip ${clsVariant}`, 'data-word': word, 'data-slot': si });
        chip.textContent = word;
        chip.addEventListener('click', () => onChipPick(chip, si, word));
        chipCache[si].push(chip);
        poolEl.appendChild(chip);
      });
    });
    main.appendChild(poolEl);

    main.appendChild(h('div', { style: 'font-family: var(--font-zh-body); color: var(--ink-light); margin-top: 12px; text-align: center;' },
      '👆 把词填进空位，造一个新的句子'));

    function onChipPick(chip, slotIdx, word) {
      if (chip.classList.contains('used')) return;
      if (LESSON.swapFilled[slotIdx]) return; // 该空位已填
      const slots = frameEl.querySelectorAll('.blank-slot');
      slots[slotIdx].textContent = word;
      slots[slotIdx].classList.remove('empty');
      slots[slotIdx].classList.add('filled');
      LESSON.swapFilled[slotIdx] = { word, chip };
      chip.classList.add('used');

      // 全部填满 → 验证并进下一轮
      if (LESSON.swapFilled.every(x => x)) {
        setTimeout(onAllFilled, 300);
      }
    }

    async function onAllFilled() {
      // 组装新句子
      const parts = tmpl.frame.split('___');
      let newSent = parts[0];
      for (let i = 0; i < LESSON.swapFilled.length; i++) {
        newSent += LESSON.swapFilled[i].word + (parts[i + 1] || '');
      }
      await speak(newSent);
      spawnConfetti(20);
      LESSON.swapMade++;
      if (LESSON.swapMade >= 3) {
        toast('✨ 造了 3 句！');
        setTimeout(askSwapRating, 1000);
      } else {
        toast(`🎉 新句 +1（${LESSON.swapMade}/3）`);
        // 重置空位和被使用的 chip（保留 swapMade 计数）
        setTimeout(() => stageSwap(), 1200);
      }
    }
  }

  function askSwapRating() {
    const main = $('#lesson-main');
    main.innerHTML = '';
    main.appendChild(h('div', { class: 'mascot happy' }, '🎉'));
    main.appendChild(h('h3', {}, '换一换完成！'));
    main.appendChild(h('div', { style: 'font-family: var(--font-zh-body); color: var(--ink-light); margin: 16px 0;' },
      '👪 家长评估孩子造的 3 句话：'));
    main.appendChild(makeStarRating(n => {
      LESSON.stageStars.swap = n;
      nextStage();
    }));
  }

  /* ============================================================
   * 9. 课程结算
   * ============================================================ */
  function completeLesson() {
    // 清理 fill state
    LESSON.fillQueue = [];
    LESSON.fillInit = null;
    // 综合星数（取 3 个家长评分关卡的平均值，向下 rounded half-up）
    const s1 = LESSON.stageStars.follow   || 2;
    const s2 = LESSON.stageStars.memorize || 2;
    const s3 = LESSON.stageStars.swap     || 2;
    const totalStars = Math.round((s1 + s2 + s3) / 3);

    // 积分计算
    let earned = 3; // 每日基础
    if (s1 === 3 && s2 === 3 && s3 === 3) earned += 1; // 满星
    // 连续打卡
    const today = new Date().toISOString().slice(0, 10);
    if (STATE.lastActiveDate !== today) {
      const prev = STATE.lastActiveDate ? new Date(STATE.lastActiveDate) : null;
      const diff = prev ? Math.round((new Date(today) - prev) / 86400000) : 999;
      if (diff === 1) STATE.streak = (STATE.streak || 0) + 1;
      else if (diff > 1) STATE.streak = 1;
      else STATE.streak = STATE.streak || 1;
      STATE.lastActiveDate = today;
      if (STATE.streak > 0 && STATE.streak % 7 === 0) earned += 5;
    }

    STATE.score += earned;
    STATE.daily[LESSON.day] = {
      completed: true,
      stars: totalStars,
      starBreakdown: Object.assign({}, LESSON.stageStars),
      score: earned,
      date: today,
    };
    // 任务板打卡
    STATE.tasksDone[today] = STATE.tasksDone[today] || {};
    STATE.tasksDone[today].lesson = true;
    saveState();

    renderResult({ stars: totalStars, score: earned, day: LESSON.day });
  }

  function renderResult({ stars, score, day }) {
    switchScreen('result');
    const screen = $('#screen-result');
    screen.innerHTML = '';
    const title = stars === 3 ? '太棒啦！' : stars === 2 ? '不错哦！' : '加油加油！';
    const trophy = stars === 3 ? '🏆' : stars === 2 ? '⭐' : '👍';
    showCoach('lessonComplete', { day, stars }, { duration: 6000 });

    const nextLabel = (STATE.settings.lessonMode === 'unit-full') ? '➡️ 下一 Unit' : '➡️ 下一天';
    screen.appendChild(h('div', { class: 'screen-result' },
      h('div', { class: 'result-trophy' }, trophy),
      h('div', { class: 'result-title' }, title),
      h('div', { class: 'result-stars' },
        ...Array.from({ length: 3 }, (_, i) => h('span', { class: 'star' }, i < stars ? '⭐' : '☆'))
      ),
      h('div', { class: 'voucher' },
        h('div', { class: 'points' }, score),
        h('div', { class: 'label' }, '金币奖励')
      ),
      h('div', { class: 'result-actions' },
        h('button', { class: 'btn btn--lg btn--pink', onclick: goHome }, '🏠 回主页'),
        h('button', { class: 'btn btn--lg btn--mint', onclick: () => toast('华为 Pad：三指下滑截屏') }, '📸 截图给妈妈'),
        h('button', { class: 'btn btn--lg btn--blue', onclick: goToNextDay }, nextLabel)
      )
    ));
    setTimeout(() => spawnConfetti(60), 400);
    renderTopbar();
  }

  function goToNextDay() {
    const mode = STATE.settings.lessonMode || 'unit-full';
    if (mode === 'unit-full') {
      // 跳到下一 Unit 的第一天
      const currentUnit = DAY_TO_UNIT[STATE.currentDay];
      if (currentUnit && currentUnit < 8) {
        // 找下一 Unit 的最小天数
        const nextUnit = currentUnit + 1;
        const nextDays = Object.entries(DAY_TO_UNIT).filter(([d, u]) => u === nextUnit).map(([d]) => +d);
        if (nextDays.length) {
          STATE.currentDay = Math.min(...nextDays);
          saveState();
        }
      } else if (STATE.currentDay < CONFIG.MAX_DAY) {
        STATE.currentDay++;
        saveState();
      }
    } else {
      if (STATE.currentDay < CONFIG.MAX_DAY) {
        STATE.currentDay++;
        saveState();
      }
    }
    goHome();
  }

  /* ============================================================
   * 9.5 设置页（Phase 1.5 新增）
   * ============================================================ */
  function renderSettings() {
    switchScreen('settings');
    hideCoach();
    const screen = $('#screen-settings');
    screen.innerHTML = '';
    const s = STATE.settings;

    const page = h('div', { class: 'settings-page' });

    // —— 语速卡 ——
    const rateCard = h('div', { class: 'settings-card' },
      h('h3', {}, '🔊 朗读语速'),
      h('div', { class: 'hint' }, '三档切换，学新内容用慢，熟了用快。'),
      h('div', { class: 'settings-row' },
        h('div', { class: 'label' }, '当前速度'),
        h('div', { class: 'control', id: 'rate-picker-holder' })
      ),
      h('div', { class: 'settings-row' },
        h('div', { class: 'label' }, '测试朗读'),
        h('div', { class: 'control flex gap-sm' },
          h('button', { class: 'btn btn--sm btn--pink',   onclick: () => speak("Look at the flowers. They're beautiful.") }, '🔊 句子示例'),
          h('button', { class: 'btn btn--sm btn--yellow', onclick: () => speak("flower") },                                       '🔊 单词示例')
        )
      )
    );
    rateCard.querySelector('#rate-picker-holder').appendChild(buildRatePicker());
    page.appendChild(rateCard);

    // —— 声音偏好卡 ——
    const mp3Ready = !!AUDIO_MANIFEST;
    const providerLabel = mp3Ready
      ? (AUDIO_MANIFEST.provider === 'minimax' ? 'MiniMax' : 'Edge-TTS')
      : '';
    const voiceLabel = mp3Ready ? AUDIO_MANIFEST.voice : '';
    const voiceCard = h('div', { class: 'settings-card' },
      h('h3', {}, '🎤 声音'),
      h('div', { class: 'hint' }, mp3Ready
        ? `🎉 真人声已就位 · ${providerLabel} · ${voiceLabel}（${AUDIO_MANIFEST.sentences.length} 句 + ${AUDIO_MANIFEST.vocab.length} 词 + ${Object.keys(AUDIO_MANIFEST.coach).length} 条教练台词）。下面只影响兜底的系统 TTS。`
        : '⚠️ MP3 清单加载失败，全部走系统 TTS（可能机械）。'
      ),
    );
    voiceCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '🎵 用真人声'),
      h('div', { class: 'control' }, buildToggle(s.useMp3 !== false, v => { STATE.settings.useMp3 = v; saveState(); toast(v ? '已切换到真人声' : '切换到系统 TTS'); }))
    ));
    voiceCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '系统 TTS 兜底声音'),
      h('div', { class: 'control' },
        h('span', { class: 'chip chip--yellow', id: 'cur-voice-chip' }, ttsVoice?.name || '（无）')
      )
    ));
    voiceCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '🎚️ 音调 Pitch'),
      h('div', { class: 'control' },
        buildPitchPicker()
      )
    ));

    // 每个 voice 一行：试听按钮 + 选中按钮
    const allVoices = listEnVoices();
    if (allVoices.length === 0) {
      const msg = ttsVoicesReady
        ? '系统没装英文 TTS 引擎。华为应用市场装一个"Google 文字转语音"或"讯飞 TTS"再回来。'
        : '正在加载系统声音...';
      const loadingRow = h('div', { class: 'settings-row' },
        h('div', { class: 'label' }, '可用声音'),
        h('div', { class: 'control', style: 'max-width: 60%; text-align: right;' },
          h('em', { style: 'color: var(--muted);' }, msg),
          h('button', { class: 'btn btn--sm', style: 'margin-left: 8px;', onclick: () => { initTTS(); setTimeout(() => { if (currentScreen === 'settings') renderSettings(); }, 500); } }, '🔄 刷新')
        )
      );
      voiceCard.appendChild(loadingRow);
      // 仅在尚未加载时挂监听（避免递归：加载完但没英文声音时直接显示提示）
      if (!ttsVoicesReady) {
        onTTSReady(() => {
          if (currentScreen === 'settings') renderSettings();
        });
      }
    } else {
      voiceCard.appendChild(h('div', { class: 'settings-row', style: 'flex-direction: column; align-items: stretch;' },
        h('div', { class: 'label' }, `可用声音（共 ${allVoices.length} 个 · 点 🔊 试听）`),
        buildVoiceList(allVoices)
      ));
    }

    voiceCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '开声音'),
      h('div', { class: 'control' }, buildToggle(s.soundOn, v => { STATE.settings.soundOn = v; saveState(); }))
    ));

    voiceCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '💡 想要真·儿童声？'),
      h('div', { class: 'control', style: 'font-size: 0.85rem; color: var(--ink-light); max-width: 60%; text-align: right;' },
        '浏览器 TTS 无论怎么调都是合成声。若要真人/儿童配音，需要预录 MP3（下个阶段）。')
    ));

    // —— Phonics 模式(背诵时字母怎么念) ——
    const phonicsRow = h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '📖 拼读字母念法')
    );
    const phonicsCtrl = h('div', { class: 'rate-picker' });
    const phonicsModes = [
      { key: 'names',   label: '字母名 (A B C)' },
      { key: 'phonics', label: '字母音 (ah buh)' },
      { key: 'both',    label: '都念' },
    ];
    phonicsModes.forEach(m => {
      const b = h('button', {}, m.label);
      if ((s.phonicsMode || 'both') === m.key) b.classList.add('active');
      b.addEventListener('click', () => {
        STATE.settings.phonicsMode = m.key;
        saveState();
        phonicsCtrl.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
      phonicsCtrl.appendChild(b);
    });
    phonicsRow.appendChild(h('div', { class: 'control' }, phonicsCtrl));
    voiceCard.appendChild(phonicsRow);
    page.appendChild(voiceCard);

    // —— 教练卡 ——
    const coachCard = h('div', { class: 'settings-card' },
      h('h3', {}, '🦊 Cory 教练'),
      h('div', { class: 'hint' }, '全程英文陪伴。关掉就安静学。')
    );
    // 孩子名字 · 快速切换(可乐 Cory / 牛牛 Ethan)+ 其他自定义
    const KID_PRESETS = [
      { en: 'Cory',  zh: '可乐' },
      { en: 'Ethan', zh: '牛牛' },
    ];
    const childNameInput = h('input', { class: 'settings-input', type: 'text', value: s.childName, maxlength: 20 });
    function applyName(en) {
      STATE.settings.childName = en;
      childNameInput.value = en;
      saveState();
      presetRow.querySelectorAll('button').forEach((b, i) => {
        b.classList.toggle('btn--pink', KID_PRESETS[i].en === en);
      });
      toast(`Hello, ${en}!`);
    }
    const presetRow = h('div', { class: 'flex gap-sm flex-wrap', style: 'margin-bottom:8px;' });
    KID_PRESETS.forEach(p => {
      const b = h('button', { class: 'btn btn--sm' + (s.childName === p.en ? ' btn--pink' : '') }, `${p.zh} · ${p.en}`);
      b.addEventListener('click', () => applyName(p.en));
      presetRow.appendChild(b);
    });
    childNameInput.addEventListener('change', () => {
      const v = childNameInput.value.trim() || 'Cory';
      applyName(v);
    });
    coachCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '谁在玩?'),
      h('div', { class: 'control', style: 'display:flex; flex-direction:column; gap:6px;' },
        presetRow,
        childNameInput
      )
    ));
    // 教练名字
    const coachNameInput = h('input', { class: 'settings-input', type: 'text', value: s.coachName, maxlength: 20 });
    coachNameInput.addEventListener('change', () => {
      STATE.settings.coachName = coachNameInput.value.trim() || 'Cory';
      saveState();
      toast(`教练叫 ${STATE.settings.coachName} 啦`);
    });
    coachCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '教练昵称'),
      h('div', { class: 'control' }, coachNameInput)
    ));
    coachCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '开启英文引导'),
      h('div', { class: 'control' }, buildToggle(s.englishGuide, v => { STATE.settings.englishGuide = v; saveState(); if (!v) hideCoach(); }))
    ));
    coachCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '气泡显示中文'),
      h('div', { class: 'control' }, buildToggle(s.showCoachZh, v => { STATE.settings.showCoachZh = v; saveState(); }))
    ));
    page.appendChild(coachCard);

    // —— 课程模式 ——
    const modeCard = h('div', { class: 'settings-card' },
      h('h3', {}, '📅 课程模式'),
      h('div', { class: 'hint' }, '推荐「整单元」：一次学完一个 Unit 的所有句子（15 分钟）。')
    );
    const modeToggle = h('div', { class: 'rate-picker' });
    const modes = [
      { key: 'unit-full', label: '🎯 整单元（推荐）' },
      { key: 'daily',     label: '📆 每日小分（3 句）' },
    ];
    modes.forEach(m => {
      const b = h('button', {}, m.label);
      if (s.lessonMode === m.key) b.classList.add('active');
      b.addEventListener('click', () => {
        STATE.settings.lessonMode = m.key;
        saveState();
        modeToggle.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        toast('课程模式已切换');
      });
      modeToggle.appendChild(b);
    });
    modeCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '每次学多少'),
      h('div', { class: 'control' }, modeToggle)
    ));
    page.appendChild(modeCard);

    // —— 数据卡 ——
    const dataCard = h('div', { class: 'settings-card' },
      h('h3', {}, '💾 数据'),
      h('div', { class: 'hint' }, '清零所有进度（金币、星星、错题库）。')
    );
    dataCard.appendChild(h('div', { class: 'settings-row' },
      h('div', { class: 'label' }, '重置进度'),
      h('div', { class: 'control' },
        h('button', { class: 'btn btn--sm btn--coral', onclick: confirmReset }, '🗑 清空')
      )
    ));
    page.appendChild(dataCard);

    page.appendChild(h('div', { style: 'text-align: center; margin-top: 20px;' },
      h('button', { class: 'btn btn--lg btn--pink', onclick: goHome }, '🏠 回主页')
    ));

    screen.appendChild(page);
  }

  function buildRatePicker() {
    const picker = h('div', { class: 'rate-picker' });
    RATE_PRESETS.forEach(p => {
      const b = h('button', {}, p.label);
      if (Math.abs(STATE.settings.ttsRate - p.rate) < 0.01) b.classList.add('active');
      b.addEventListener('click', () => {
        STATE.settings.ttsRate = p.rate;
        saveState();
        picker.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        // 同步顶栏的选择器（如果存在）
        $$('.rate-picker').forEach(other => {
          if (other === picker) return;
          other.querySelectorAll('button').forEach((btn, i) => {
            btn.classList.toggle('active', RATE_PRESETS[i] && Math.abs(RATE_PRESETS[i].rate - p.rate) < 0.01);
          });
        });
      });
      picker.appendChild(b);
    });
    return picker;
  }

  function buildToggle(initial, onChange) {
    const t = h('div', { class: 'toggle' + (initial ? ' on' : '') });
    t.addEventListener('click', () => {
      t.classList.toggle('on');
      onChange(t.classList.contains('on'));
    });
    return t;
  }

  // 每个 voice 一行：名字 + 🔊 试听 + ✓ 选中
  function buildVoiceList(voices) {
    const wrap = h('div', { class: 'voice-list' });
    // 样例句：经典 Unit 4 第一句，孩子应该听得出差异
    const SAMPLE = "Look at the flowers. They're beautiful.";
    // 按"神经声优先"排序
    const scored = voices.map(v => {
      let score = 0;
      const n = v.name;
      if (/Neural|Wavenet|Natural|Online|Studio/i.test(n)) score += 10;
      if (/en-us-x-/i.test(n))           score += 8;
      if (/Samsung.*Female/i.test(n))    score += 7;
      if (/Google US English/i.test(n))  score += 6;
      if (/Samantha|Karen/i.test(n))     score += 5;
      if (/Aria|Jenny|Ana/i.test(n))     score += 5;
      if (/female/i.test(n))             score += 2;
      if (/en-US/i.test(v.lang))         score += 1;
      return { v, score };
    }).sort((a, b) => b.score - a.score);

    scored.forEach(({ v, score }) => {
      const isCur = (STATE.settings.voicePref === v.name) ||
                    (!STATE.settings.voicePref && ttsVoice?.name === v.name);
      const row = h('div', { class: 'voice-row' + (isCur ? ' selected' : '') });
      const info = h('div', { class: 'voice-info' },
        h('div', { class: 'voice-name' }, v.name, score >= 10 ? h('span', { class: 'chip chip--mint voice-badge' }, '✨ 推荐') : null),
        h('div', { class: 'voice-lang' }, v.lang)
      );
      const playBtn = h('button', { class: 'btn btn--sm btn--yellow' }, '🔊 试听');
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // 临时用这个声音播放，不改 STATE
        if (!('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(SAMPLE);
        u.voice = v;
        u.lang = v.lang;
        u.rate = STATE.settings.ttsRate;
        u.pitch = STATE.settings.ttsPitch ?? 1.0;
        speechSynthesis.speak(u);
      });
      const pickBtn = h('button', { class: 'btn btn--sm ' + (isCur ? 'btn--pink' : '') }, isCur ? '✓ 使用中' : '选这个');
      pickBtn.addEventListener('click', () => {
        STATE.settings.voicePref = v.name;
        saveState();
        initTTS();
        toast(`已切换到 ${v.name.slice(0, 24)}`);
        // 刷新设置页显示
        renderSettings();
      });
      row.append(info, playBtn, pickBtn);
      wrap.appendChild(row);
    });

    // "自动"选项
    const autoRow = h('div', { class: 'voice-row' + (!STATE.settings.voicePref ? ' selected' : '') });
    const autoInfo = h('div', { class: 'voice-info' },
      h('div', { class: 'voice-name' }, '🤖 自动（按白名单）'),
      h('div', { class: 'voice-lang' }, '让 App 自己挑最好的')
    );
    const autoBtn = h('button', { class: 'btn btn--sm ' + (!STATE.settings.voicePref ? 'btn--pink' : '') },
      !STATE.settings.voicePref ? '✓ 使用中' : '恢复自动');
    autoBtn.addEventListener('click', () => {
      STATE.settings.voicePref = null;
      saveState();
      initTTS();
      toast('已恢复自动');
      renderSettings();
    });
    autoRow.append(autoInfo, autoBtn);
    wrap.insertBefore(autoRow, wrap.firstChild);

    return wrap;
  }

  // 音调选择器（pitch 0.8 / 1.0 / 1.2）
  function buildPitchPicker() {
    const picker = h('div', { class: 'rate-picker' });
    const PRESETS = [
      { label: '低', pitch: 0.85 },
      { label: '中', pitch: 1.00 },
      { label: '高', pitch: 1.15 },
    ];
    const cur = STATE.settings.ttsPitch ?? 1.0;
    PRESETS.forEach(p => {
      const b = h('button', {}, p.label);
      if (Math.abs(cur - p.pitch) < 0.01) b.classList.add('active');
      b.addEventListener('click', () => {
        STATE.settings.ttsPitch = p.pitch;
        saveState();
        picker.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        // 试听当前声音
        speak("Hello, I am your English buddy.");
      });
      picker.appendChild(b);
    });
    return picker;
  }

  function confirmReset() {
    const m = modal(h('div', {},
      h('h3', {}, '真的要清零所有进度吗？'),
      h('p', {}, '金币、星星、错题库、掌握度都会清空。设置保留。'),
      h('div', { class: 'modal-footer' },
        h('button', { class: 'btn', onclick: () => m.close() }, '取消'),
        h('button', { class: 'btn btn--coral', onclick: () => {
          const keepSettings = STATE.settings;
          resetState();
          STATE.settings = keepSettings;
          saveState();
          m.close();
          renderTopbar();
          renderSettings();
          toast('已重置');
        }}, '清零')
      )
    ));
  }

  /* ============================================================
   * 10. 闪卡
   * ============================================================ */
  function renderFlashcards() {
    switchScreen('flashcards');
    const screen = $('#screen-flashcards');
    screen.innerHTML = '';

    // 默认展示今日词，无则展示当前 Unit
    let words = (typeof getVocabForDay === 'function') ? getVocabForDay(STATE.currentDay) : [];
    if (!words || words.length === 0) {
      const u = unitForDay(STATE.currentDay);
      words = u ? VOCAB.core.filter(w => w.unit === u.id) : VOCAB.core.slice(0, 10);
    }
    let idx = 0;

    const body = h('div', { class: 'flashcards-body' });
    const status = h('div', { class: 'badge' });
    const holder = h('div');
    const controls = h('div', { class: 'flex gap-md' });
    body.appendChild(h('h2', {}, '🃏 闪卡'));
    body.appendChild(status);
    body.appendChild(holder);
    body.appendChild(controls);
    screen.appendChild(body);

    controls.append(
      h('button', { class: 'btn btn--icon btn--lg', onclick: () => { idx = (idx - 1 + words.length) % words.length; render(); } }, '‹'),
      h('button', { class: 'btn btn--lg btn--pink', onclick: flip }, '🔄 翻面'),
      h('button', { class: 'btn btn--lg btn--yellow', onclick: () => speak(words[idx].en) }, '🔊 发音'),
      h('button', { class: 'btn btn--lg btn--mint', onclick: () => showVoicePractice(words[idx]) }, '🎤 练说'),
      h('button', { class: 'btn btn--icon btn--lg', onclick: () => { idx = (idx + 1) % words.length; render(); } }, '›')
    );

    function render() {
      const w = words[idx];
      holder.innerHTML = '';
      const img = getVocabImageUrl(w.id);
      const frontVisual = img
        ? h('div', { class: 'flashcard-img' }, h('img', { src: img, alt: w.en, loading: 'lazy' }))
        : h('div', { class: 'emoji' }, w.emoji || '📘');
      const backVisual = img
        ? h('div', { class: 'flashcard-img flashcard-img--back' }, h('img', { src: img, alt: w.en, loading: 'lazy' }))
        : h('div', { class: 'emoji' }, w.emoji || '📘');
      holder.appendChild(h('div', { class: 'flashcard', onclick: flip },
        h('div', { class: 'flashcard-inner' },
          h('div', { class: 'flashcard-face' },
            frontVisual,
            h('div', { class: 'en' }, w.en),
            h('div', { class: 'ipa' }, w.ipa || '')
          ),
          h('div', { class: 'flashcard-face flashcard-face--back' },
            backVisual,
            h('div', { class: 'zh' }, w.zh),
            h('div', { style: 'font-family: var(--font-en); color: var(--ink); opacity: 0.85; margin-top: 8px;' }, w.exEn || '')
          )
        )
      ));
      status.textContent = `${idx + 1} / ${words.length} · ${w.en}`;
      speak(w.en);
    }
    function flip() {
      const c = holder.querySelector('.flashcard');
      if (c) c.classList.toggle('flipped');
    }
    render();
  }

  /* ============================================================
   * 11. 词库
   * ============================================================ */
  function renderVocab() {
    switchScreen('vocab');
    const screen = $('#screen-vocab');
    screen.innerHTML = '';

    const filters = [
      { key: 'all',      label: '全部' },
      { key: 'core',     label: '核心' },
      { key: 'alphabet', label: '字母' },
      { key: 'rhyme',    label: '歌谣' },
    ];
    for (let u = 1; u <= 8; u++) filters.push({ key: 'u' + u, label: 'U' + u });

    let current = 'all';
    const total = VOCAB.core.length + VOCAB.alphabet.length + VOCAB.rhyme.length;

    const filterBar = h('div', { class: 'flex gap-sm flex-wrap', style: 'padding: 12px 24px;' });
    const grid = h('div', { class: 'glossary-grid' });

    filters.forEach(f => {
      const b = h('button', { class: 'btn btn--sm' }, f.label);
      b.addEventListener('click', () => {
        current = f.key;
        filterBar.querySelectorAll('.btn').forEach(x => x.classList.remove('btn--pink'));
        b.classList.add('btn--pink');
        apply();
      });
      filterBar.appendChild(b);
    });
    filterBar.firstChild.classList.add('btn--pink');

    function apply() {
      let list;
      if      (current === 'all')      list = [...VOCAB.core, ...VOCAB.alphabet, ...VOCAB.rhyme];
      else if (current === 'core')     list = VOCAB.core;
      else if (current === 'alphabet') list = VOCAB.alphabet;
      else if (current === 'rhyme')    list = VOCAB.rhyme;
      else if (/^u\d+$/.test(current)) {
        const u = parseInt(current.slice(1));
        list = [...VOCAB.core, ...VOCAB.rhyme].filter(w => w.unit === u);
      } else list = [];

      grid.innerHTML = '';
      list.forEach(w => {
        const img = getVocabImageUrl(w.id);
        const kids = [];
        if (img) {
          kids.push(h('div', { class: 'glossary-thumb' }, h('img', { src: img, alt: w.en, loading: 'lazy' })));
        }
        kids.push(
          h('div', { class: 'row1' },
            h('span', { class: 'g-emoji' }, w.emoji || '📘'),
            h('span', { class: 'g-en' }, w.en)
          ),
          h('div', { class: 'g-zh' }, w.zh),
          h('div', { class: 'g-ipa' }, w.ipa || ''),
          h('div', { style: 'margin-top: 4px;' },
            h('span', { class: 'chip chip--pink' }, w.unit ? 'U' + w.unit : '字母')
          )
        );
        const card = h('div', { class: 'glossary-item' + (img ? ' has-img' : '') }, ...kids);
        card.addEventListener('click', () => speak(w.en));
        grid.appendChild(card);
      });
    }

    screen.appendChild(h('h2', { style: 'padding: 20px 24px 0;' }, `📚 词库 · ${total} 词`));
    screen.appendChild(filterBar);
    screen.appendChild(grid);
    apply();
  }

  /* ============================================================
   * 12. 句库
   * ============================================================ */
  function renderSentences() {
    switchScreen('sentences');
    const screen = $('#screen-sentences');
    screen.innerHTML = '';

    const filters = [{ key: 'all', label: '全部' }];
    for (let u = 1; u <= 8; u++) filters.push({ key: u, label: 'U' + u });
    filters.push({ key: 'MIX', label: '综合' });

    let current = 'all';
    const filterBar = h('div', { class: 'flex gap-sm flex-wrap', style: 'padding: 12px 24px;' });
    const grid = h('div', { class: 'glossary-grid' });

    filters.forEach(f => {
      const b = h('button', { class: 'btn btn--sm' }, f.label);
      b.addEventListener('click', () => {
        current = f.key;
        filterBar.querySelectorAll('.btn').forEach(x => x.classList.remove('btn--pink'));
        b.classList.add('btn--pink');
        apply();
      });
      filterBar.appendChild(b);
    });
    filterBar.firstChild.classList.add('btn--pink');

    function apply() {
      const list = current === 'all' ? SENTENCES : SENTENCES.filter(s => s.unit === current);
      grid.innerHTML = '';
      list.forEach(s => {
        const img = getSentenceImageUrl(s.id);
        const kids = [];
        if (img) {
          kids.push(h('div', { class: 'glossary-thumb' }, h('img', { src: img, alt: s.zh, loading: 'lazy' })));
        }
        kids.push(
          h('div', { class: 'g-en', style: 'font-size: 1.05rem;' }, s.en),
          h('div', { class: 'g-zh' }, s.zh),
          h('div', { class: 'flex gap-sm', style: 'margin-top: 6px;' },
            h('span', { class: 'chip' }, s.unit === 'MIX' ? '综合' : 'U' + s.unit),
            h('span', { class: 'chip chip--yellow' }, s.type)
          )
        );
        const card = h('div', { class: 'glossary-item glossary-item--sentence' + (img ? ' has-img' : '') }, ...kids);
        card.addEventListener('click', () => speak(s.en));
        grid.appendChild(card);
      });
    }

    screen.appendChild(h('h2', { style: 'padding: 20px 24px 0;' }, `💬 句库 · ${SENTENCES.length} 句`));
    screen.appendChild(filterBar);
    screen.appendChild(grid);
    apply();
  }

  /* ============================================================
   * 13. 单元测验
   * ============================================================ */
  /* ============================================================
   * 13. 单元测验（真考卷 12 大题，统一外壳 + 插件式题型渲染器）
   * ============================================================ */

  // —— 单元选择页 ——
  function renderQuizPicker() {
    switchScreen('quiz');
    const screen = $('#screen-quiz');
    screen.innerHTML = '';
    const colors = ['pink','blue','yellow','mint','coral','lavender','peach','sky'];

    const grid = h('div', { class: 'menu-grid', style: 'max-width: 900px; margin: 0 auto;' });
    UNITS.forEach(u => {
      const hasBank = !!(typeof QUIZ_BANKS !== 'undefined' && QUIZ_BANKS[u.id]);
      const rec = STATE.unitTests?.[u.id];
      const score = rec ? `最高 ${rec.bestScore} 分` : (hasBank ? '可考' : '题库准备中');
      const tile = h('div', {
        class: `menu-tile menu-tile--${colors[u.id - 1]}`,
        style: hasBank ? '' : 'opacity: 0.5; cursor: not-allowed;',
      },
        h('div', { class: 'icon' }, u.emoji),
        h('div', { class: 'title' }, `Unit ${u.id}`),
        h('div', { class: 'sub' }, `${u.titleZh} · ${score}`)
      );
      if (hasBank) tile.addEventListener('click', () => renderQuizModePicker(u.id));
      grid.appendChild(tile);
    });
    screen.appendChild(h('div', { style: 'padding: 24px;' },
      h('h2', { style: 'text-align: center; margin-bottom: 16px;' }, '📝 单元测验'),
      h('p', { style: 'text-align: center; color: var(--ink-light); margin-bottom: 24px;' },
        '对齐校内真考卷 · 12 大题 · 听力 + 笔试'),
      grid
    ));
  }

  // —— 模式选择（模拟考 / 练习）——
  function renderQuizModePicker(unit) {
    switchScreen('quiz');
    const screen = $('#screen-quiz');
    screen.innerHTML = '';
    const bank = QUIZ_BANKS[unit];
    const page = h('div', { class: 'quiz-mode-picker' },
      h('h2', {}, `📝 ${bank.title}`),
      h('p', { style: 'color: var(--ink-light);' }, '选个做题模式：'),
      h('div', { class: 'quiz-mode-grid' },
        (() => {
          const c = h('div', { class: 'quiz-mode-card' },
            h('div', { class: 'icon' }, '🎯'),
            h('div', { class: 'name' }, '模拟考试'),
            h('div', { class: 'desc' }, '提交前不能看答案，考完才批卷。接近真考场氛围。')
          );
          c.addEventListener('click', () => startQuizSession(unit, 'exam'));
          return c;
        })(),
        (() => {
          const c = h('div', { class: 'quiz-mode-card' },
            h('div', { class: 'icon' }, '📚'),
            h('div', { class: 'name' }, '练习模式'),
            h('div', { class: 'desc' }, '做完每大题立刻看对错，可以重试，降低焦虑。')
          );
          c.addEventListener('click', () => startQuizSession(unit, 'practice'));
          return c;
        })()
      ),
      h('div', { style: 'margin-top: 24px;' },
        h('button', { class: 'btn btn--sm', onclick: renderQuizPicker }, '‹ 换单元')
      )
    );
    screen.appendChild(page);
  }

  // —— Quiz 会话状态 ——
  const QUIZ = {
    paper: null,        // { unit, title, totalPoints, sections: [...] }
    sectionIdx: 0,
    mode: 'practice',   // 'exam' | 'practice'
  };

  function startQuizSession(unit, mode) {
    const paper = generateQuizPaper(unit);
    if (!paper || !paper.sections.length) {
      toast('题库准备中'); return;
    }
    QUIZ.paper = paper;
    QUIZ.sectionIdx = 0;
    QUIZ.mode = mode;
    renderQuizSection();
  }

  function renderQuizSection() {
    switchScreen('quiz');
    hideCoach();
    const screen = $('#screen-quiz');
    screen.innerHTML = '';
    const paper = QUIZ.paper;
    const section = paper.sections[QUIZ.sectionIdx];
    if (!section) return finishQuizSession();

    // —— 外壳 ——
    const shell = h('div', { class: 'quiz-shell' });
    shell.appendChild(buildQuizHeader(section));
    const body = h('div', { class: 'quiz-body' });
    shell.appendChild(body);
    shell.appendChild(buildQuizFooter(section));
    screen.appendChild(shell);

    // —— 按类型调对应渲染器 ——
    const renderer = QUIZ_RENDERERS[section.type];
    if (!renderer) {
      body.appendChild(h('div', { style: 'padding: 40px; text-align: center;' },
        h('div', { style: 'font-size: 4rem;' }, '🚧'),
        h('h3', {}, '题型开发中'),
        h('p', {}, `type = ${section.type}`)
      ));
      return;
    }
    renderer(section, body);
  }

  function buildQuizHeader(section) {
    const paper = QUIZ.paper;
    const answered = Object.keys(section.userAnswers).length;
    const total = section.items.length;
    return h('div', { class: 'quiz-header' },
      h('div', { class: 'q-badge' }, String(section.id)),
      h('div', { class: 'q-title' },
        section.title,
        h('span', { class: 'hint' }, section.hint || '')
      ),
      h('div', { class: 'q-progress' },
        `大题 ${QUIZ.sectionIdx + 1}/${paper.sections.length} · ${answered}/${total}`
      )
    );
  }

  function buildQuizFooter(section) {
    const footer = h('div', { class: 'quiz-footer' });
    footer.appendChild(
      h('button', { class: 'btn btn--sm', onclick: confirmQuizExit }, '⏸ 退出')
    );
    footer.appendChild(
      h('div', { class: 'q-hint' },
        `${section.items.length} 题 · 每题 ${section.pointsPerItem} 分 · 共 ${section.items.length * section.pointsPerItem} 分`
      )
    );
    const last = QUIZ.sectionIdx >= QUIZ.paper.sections.length - 1;
    footer.appendChild(
      h('button', {
        class: 'btn btn--lg btn--mint',
        onclick: () => submitCurrentSection(),
      }, last ? '📤 交卷' : '✓ 完成本大题 →')
    );
    return footer;
  }

  function confirmQuizExit() {
    const m = modal(h('div', {},
      h('h3', {}, '退出本次测验？'),
      h('p', {}, '没交卷的答题不会保存。'),
      h('div', { class: 'modal-footer' },
        h('button', { class: 'btn', onclick: () => m.close() }, '继续考试'),
        h('button', { class: 'btn btn--coral', onclick: () => { m.close(); stopAllAudio(); goHome(); } }, '退出')
      )
    ));
  }

  // —— 提交当前大题 → 判分 → 下一题或结算 ——
  function submitCurrentSection() {
    const section = QUIZ.paper.sections[QUIZ.sectionIdx];
    // 判分（支持部分得分的题型走 partialScore）
    let totalScored = 0;
    let correctCount = 0;
    section.items.forEach(item => {
      const user = section.userAnswers[item.id];
      const full = isItemCorrect(section.type, item, user);
      if (full) correctCount++;
      const itemScored = partialScore(section.type, item, user, section.pointsPerItem);
      totalScored += itemScored;
      // 错题入库（记录 audio ref id 级别的参考）
      if (!full && user !== undefined && user !== null) {
        if (item.audio && /^(sent|vocab):/.test(item.audio)) {
          const refId = item.audio.split(':')[1];
          markWrong(refId);
        }
      }
    });
    section.graded = true;
    section.correctCount = correctCount;
    section.scored = totalScored;

    // 练习模式：即刻显示错对,提示继续
    if (QUIZ.mode === 'practice') {
      showCoach('stageDone', {}, { duration: 1800 });
      spawnConfetti(Math.min(40, correctCount * 5));
      renderQuizSectionFeedback(section);
    } else {
      // 模拟考试：静默进下一题
      QUIZ.sectionIdx++;
      renderQuizSection();
    }
  }

  // 判断某道题是否答对（根据 type 不同）
  function isItemCorrect(type, item, user) {
    if (user === undefined || user === null) return false;
    if (type === 'listen-choose') return user === item.correct;
    if (type === 'listen-judge')  return user === item.correct;
    if (type === 'listen-pic')    return user === item.correct;
    if (type === 'pic-judge')     return user === item.correct;
    if (type === 'odd-one-out')   return user === item.correct;
    if (type === 'scenario')      return user === item.correct;
    if (type === 'letter-neighbor') {
      return user?.before === item.before && user?.after === item.after;
    }
    if (type === 'match-columns') {
      // user 是 { qIdx: aIdx } 映射。对所有对都对才给分
      if (!user || typeof user !== 'object') return false;
      return item.pairs.every((_, i) => user[i] === i);
    }
    if (type === 'dialog-fill' || type === 'listen-fill') {
      if (!user || typeof user !== 'object') return false;
      const blanks = [];
      item.dialog.forEach(line => line.parts.forEach(p => { if (p.blank) blanks.push(p.blank); }));
      return blanks.every((ans, i) => user[i] === ans);
    }
    if (type === 'listen-response') return user === item.correct;
    if (type === 'listen-order') {
      // user = { imgIdx: orderNumber(1-6) }
      if (!user || typeof user !== 'object') return false;
      return item.images.every((imgRef, imgIdx) => {
        const expectedPos = item.sequence.indexOf(imgRef) + 1;  // 1-based
        return user[imgIdx] === expectedPos;
      });
    }
    // 其他暂未实现
    return user === item.correct;
  }

  // 辅助：统计部分得分（match-columns 和 dialog-fill 按连对/填对比例给分）
  function partialScore(type, item, user, pointsPerItem) {
    if (type === 'match-columns') {
      if (!user) return 0;
      const correctCount = item.pairs.reduce((n, _, i) => n + (user[i] === i ? 1 : 0), 0);
      // 每对 2 分（pointsPerItem 是整组总分 12，对应 6 对 × 2）
      return correctCount * 2;
    }
    if (type === 'dialog-fill' || type === 'listen-fill') {
      if (!user) return 0;
      const blanks = [];
      item.dialog.forEach(line => line.parts.forEach(p => { if (p.blank) blanks.push(p.blank); }));
      const correctCount = blanks.reduce((n, ans, i) => n + (user[i] === ans ? 1 : 0), 0);
      return correctCount * 2;  // 每空 2 分
    }
    if (type === 'listen-order') {
      if (!user) return 0;
      const correctCount = item.images.reduce((n, imgRef, imgIdx) => {
        const expected = item.sequence.indexOf(imgRef) + 1;
        return n + (user[imgIdx] === expected ? 1 : 0);
      }, 0);
      return correctCount * 2;  // 每对 2 分
    }
    return isItemCorrect(type, item, user) ? pointsPerItem : 0;
  }

  // 练习模式 - 本大题批卷反馈
  function renderQuizSectionFeedback(section) {
    switchScreen('quiz');
    const screen = $('#screen-quiz');
    screen.innerHTML = '';
    const total = section.items.length * section.pointsPerItem;
    const shell = h('div', { class: 'quiz-shell' },
      h('div', { class: 'quiz-header' },
        h('div', { class: 'q-badge' }, String(section.id)),
        h('div', { class: 'q-title' }, `${section.title} · 批卷`),
        h('div', { class: 'q-progress' }, `${section.scored} / ${total} 分`)
      ),
      (() => {
        const body = h('div', { class: 'quiz-body' });
        // 同样渲染题目，但用 review 模式（展示对错）
        const renderer = QUIZ_RENDERERS[section.type];
        if (renderer) renderer(section, body, { review: true });
        return body;
      })(),
      h('div', { class: 'quiz-footer' },
        h('button', { class: 'btn btn--sm', onclick: confirmQuizExit }, '⏸ 退出'),
        h('div', { class: 'q-hint' }, section.scored === total ? '✨ 全对！' : '红色是错题，听一下原音再继续'),
        (() => {
          const last = QUIZ.sectionIdx >= QUIZ.paper.sections.length - 1;
          return h('button', {
            class: 'btn btn--lg btn--blue',
            onclick: () => {
              QUIZ.sectionIdx++;
              if (QUIZ.sectionIdx >= QUIZ.paper.sections.length) finishQuizSession();
              else renderQuizSection();
            },
          }, last ? '📤 看总分' : '下一大题 →');
        })()
      )
    );
    screen.appendChild(shell);
  }

  // —— 整卷结算页 ——
  function finishQuizSession() {
    const paper = QUIZ.paper;
    const totalScored = paper.sections.reduce((s, sec) => s + (sec.scored || 0), 0);
    const totalPossible = paper.sections.reduce((s, sec) => s + sec.items.length * sec.pointsPerItem, 0);
    const finalPct = totalPossible > 0 ? Math.round(totalScored / totalPossible * 100) : 0;

    // 存进度
    STATE.unitTests = STATE.unitTests || {};
    const prev = STATE.unitTests[paper.unit];
    STATE.unitTests[paper.unit] = {
      bestScore: Math.max(prev?.bestScore || 0, finalPct),
      lastScore: finalPct,
      lastDate: new Date().toISOString().slice(0, 10),
      lastTotal: totalScored,
      lastPossible: totalPossible,
    };
    // 积分
    let earned = finalPct >= 60 ? 5 : 2;
    if (finalPct >= 90) earned += 3;
    STATE.score += earned;
    saveState();
    renderTopbar();

    switchScreen('quiz');
    const screen = $('#screen-quiz');
    screen.innerHTML = '';
    const title = finalPct === 100 ? '💯 满分！' : finalPct >= 90 ? '🏆 优秀！' : finalPct >= 60 ? '✨ 通过' : '💪 继续加油';
    const page = h('div', { class: 'quiz-result' },
      h('h2', {}, title),
      h('div', { class: 'big-score' }, `${finalPct}`),
      h('div', {}, `${totalScored} / ${totalPossible} 分`),
      h('div', {}, `+${earned} 金币`),
      h('h3', { style: 'margin-top: 20px;' }, '📋 分大题成绩'),
      h('div', { class: 'section-breakdown' },
        ...paper.sections.map(sec => {
          const total = sec.items.length * sec.pointsPerItem;
          const scored = sec.scored || 0;
          const cls = scored === total ? 'full' : (scored < total * 0.6 ? 'low' : '');
          return h('div', { class: `sb-row ${cls}` },
            h('span', {}, `${sec.id}. ${(sec.title || '').slice(3, 15)}`),
            h('span', {}, `${scored}/${total}`)
          );
        })
      ),
      h('div', { class: 'result-actions', style: 'margin-top: 20px;' },
        h('button', { class: 'btn btn--lg btn--pink', onclick: goHome }, '🏠 回主页'),
        h('button', { class: 'btn btn--lg btn--blue', onclick: renderQuizPicker }, '🔁 再测')
      )
    );
    screen.appendChild(page);
    spawnConfetti(finalPct >= 90 ? 80 : 30);
  }

  /* ============================================================
   * 13.X 题型渲染器（一种 type 一个函数）
   * 签名: renderer(section, bodyEl, { review })
   * 约定: 写入 section.userAnswers[item.id] = 用户答案
   * review=true 时显示对错高亮，不响应输入
   * ============================================================ */
  const QUIZ_RENDERERS = {};

  // —— 共用：播放引用音频（resolveQuizAsset 解析 vocab: / sent: / quiz:）——
  //   没 MP3 或加载失败 → 退回 TTS 念 fallbackText
  //   fallbackText 不传就从 ref 提字（vocab:u4_tree → "tree"）
  //   关键：已经进入 MP3 播放通道后 error 不再 fallback，避免 MP3 + TTS 同时叠声
  function playQuizAudio(ref, btn, fallbackText) {
    const url = resolveQuizAsset(ref, 'audio');
    if (btn) btn.classList.add('playing');
    const doneBtn = () => { if (btn) btn.classList.remove('playing'); };

    const ttsText = (() => {
      if (fallbackText) return fallbackText;
      const [, id] = String(ref || '').split(':');
      return id ? id.split('_').slice(1).join(' ') : '';
    })();

    const ttsFallback = () => {
      if (!ttsText) { doneBtn(); return; }
      speakTTS(ttsText).then(doneBtn);
    };

    if (!url) { ttsFallback(); return; }

    stopCurrent();

    // 先用 fetch 预检 URL；失败才 TTS，成功才播放 Audio
    //（比 <audio>.onerror 更可控，不会 MP3 开始播了又叠一层 TTS）
    fetch(url, { method: 'HEAD' }).then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const a = new Audio(url);
      currentAudio = a;
      let playing = false;
      a.onended = () => { doneBtn(); if (currentAudio === a) currentAudio = null; };
      a.onerror = () => {
        if (currentAudio === a) currentAudio = null;
        // 只在还没播就失败时才 TTS；已播过片段就直接结束
        if (!playing) ttsFallback();
        else doneBtn();
      };
      a.onplaying = () => { playing = true; };
      a.play().catch(() => {
        if (currentAudio === a) currentAudio = null;
        if (!playing) ttsFallback();
        else doneBtn();
      });
    }).catch(() => {
      console.warn('[Quiz] MP3 不存在 or 网络失败，退回 TTS:', url);
      ttsFallback();
    });
  }

  // —— 共用：用字母 A/B/C 构建单选项 ——
  function buildChoiceButtons(item, optionsLabels, onPick, { review } = {}) {
    const wrap = h('div', { class: 'q-choice-group quiz-item__choices' });
    const section = QUIZ.paper.sections[QUIZ.sectionIdx];
    const userAns = section.userAnswers[item.id];
    const LETTERS = ['A', 'B', 'C', 'D'];
    optionsLabels.forEach((label, i) => {
      const btn = h('button', { class: 'q-choice' },
        h('span', { class: 'letter' }, LETTERS[i] + '.'),
        String(label)
      );
      if (userAns === i) btn.classList.add('selected');
      if (review) {
        btn.disabled = true;
        if (i === item.correct) btn.classList.add('correct');
        else if (userAns === i && userAns !== item.correct) btn.classList.add('wrong');
      } else {
        btn.addEventListener('click', () => {
          section.userAnswers[item.id] = i;
          onPick && onPick(i, btn);
          renderQuizSection();  // 重渲保持 selected 状态
        });
      }
      wrap.appendChild(btn);
    });
    return wrap;
  }

  /* -------- 一、听录音选词 -------- */
  QUIZ_RENDERERS['listen-choose'] = function(section, body, opts = {}) {
    section.items.forEach((item, idx) => {
      const row = h('div', { class: 'quiz-item' });
      row.appendChild(h('div', { class: 'quiz-item__num' }, String(idx + 1)));
      const prompt = h('div', { class: 'quiz-item__prompt' });
      const audioBtn = h('button', { class: 'q-audio-btn' }, '🔊');
      audioBtn.addEventListener('click', (e) => { e.stopPropagation(); playQuizAudio(item.audio, audioBtn); });
      prompt.appendChild(audioBtn);
      row.appendChild(prompt);
      row.appendChild(buildChoiceButtons(item, item.options, null, opts));
      body.appendChild(row);
    });
  };

  /* -------- 二、听句子 + 看图 → 判断 ✓/✗ -------- */
  QUIZ_RENDERERS['listen-judge'] = function(section, body, opts = {}) {
    section.items.forEach((item, idx) => {
      const row = h('div', { class: 'quiz-item' });
      row.appendChild(h('div', { class: 'quiz-item__num' }, String(idx + 1)));

      const prompt = h('div', { class: 'quiz-item__prompt' });
      const audioBtn = h('button', { class: 'q-audio-btn' }, '🔊');
      audioBtn.addEventListener('click', (e) => { e.stopPropagation(); playQuizAudio(item.audio, audioBtn); });
      prompt.appendChild(audioBtn);

      const imgUrl = resolveQuizAsset(item.image, 'image');
      if (imgUrl) {
        prompt.appendChild(h('div', { class: 'q-thumb' }, h('img', { src: imgUrl, loading: 'lazy', alt: '' })));
      }
      row.appendChild(prompt);

      const userAns = section.userAnswers[item.id];
      const judge = h('div', { class: 'q-judge' });
      const okBtn = h('button', {}, '✓');
      const noBtn = h('button', {}, '✗');
      okBtn.classList.add('ok');
      noBtn.classList.add('no');
      if (userAns === true)  okBtn.classList.add('selected');
      if (userAns === false) noBtn.classList.add('selected');
      if (opts.review) {
        okBtn.disabled = true; noBtn.disabled = true;
        if (item.correct === true)  okBtn.classList.add('correct-answer');
        if (item.correct === false) noBtn.classList.add('correct-answer');
        if (userAns !== undefined && userAns !== item.correct) {
          (userAns ? okBtn : noBtn).classList.add('wrong');
        }
      } else {
        okBtn.addEventListener('click', () => { section.userAnswers[item.id] = true;  renderQuizSection(); });
        noBtn.addEventListener('click', () => { section.userAnswers[item.id] = false; renderQuizSection(); });
      }
      judge.append(okBtn, noBtn);
      row.appendChild(judge);
      body.appendChild(row);
    });
  };

  /* -------- 七、字母左邻右舍 -------- */
  QUIZ_RENDERERS['letter-neighbor'] = function(section, body, opts = {}) {
    section.items.forEach((item, idx) => {
      const row = h('div', { class: 'quiz-item' });
      row.appendChild(h('div', { class: 'quiz-item__num' }, String(idx + 1)));
      const user = section.userAnswers[item.id] || {};

      const lineBox = h('div', { class: 'q-letter-row quiz-item__prompt' });

      const beforeBlank = h('span', { class: 'blank' }, user.before || '?');
      if (user.before) beforeBlank.classList.add('filled');
      lineBox.appendChild(beforeBlank);

      lineBox.appendChild(h('span', { class: 'known' }, item.letter));

      const afterBlank = h('span', { class: 'blank' }, user.after || '?');
      if (user.after) afterBlank.classList.add('filled');
      lineBox.appendChild(afterBlank);

      if (opts.review) {
        [[beforeBlank, item.before, user.before], [afterBlank, item.after, user.after]].forEach(([el, corr, u]) => {
          el.textContent = u || '—';
          el.classList.remove('filled');
          if (u === corr) el.classList.add('correct');
          else el.classList.add('wrong');
        });
      } else {
        beforeBlank.addEventListener('click', () => {
          showLetterPicker('左邻字母是？', user.before, (v) => {
            user.before = v;
            section.userAnswers[item.id] = user;
            renderQuizSection();
          });
        });
        afterBlank.addEventListener('click', () => {
          showLetterPicker('右舍字母是？', user.after, (v) => {
            user.after = v;
            section.userAnswers[item.id] = user;
            renderQuizSection();
          });
        });
      }
      row.appendChild(lineBox);
      body.appendChild(row);
    });
  };

  // —— 26 字母虚拟选择器（字母邻居用）——
  function showLetterPicker(title, preset, onPick) {
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const grid = h('div', { class: 'letter-picker-grid' });
    LETTERS.forEach(L => {
      const both = L + L.toLowerCase();
      const btn = h('button', { class: 'letter-picker-btn' }, both);
      if (preset === both) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        m.close();
        onPick(both);
      });
      grid.appendChild(btn);
    });
    const m = modal(h('div', {},
      h('h3', {}, title),
      h('p', { style: 'font-size: 0.9rem; color: var(--ink-light);' }, '点一个字母填进空位:'),
      grid,
      h('div', { class: 'modal-footer' },
        h('button', { class: 'btn', onclick: () => m.close() }, '取消')
      )
    ));
  }

  /* -------- 八、不同类 -------- */
  QUIZ_RENDERERS['odd-one-out'] = function(section, body, opts = {}) {
    section.items.forEach((item, idx) => {
      const row = h('div', { class: 'quiz-item' });
      row.appendChild(h('div', { class: 'quiz-item__num' }, String(idx + 1)));
      const prompt = h('div', { class: 'quiz-item__prompt' });
      prompt.appendChild(h('span', { style: 'font-family: var(--font-zh-body); color: var(--ink-light); font-size: 0.9rem;' }, '选不同类：'));
      row.appendChild(prompt);
      row.appendChild(buildChoiceButtons(item, item.items, null, opts));
      body.appendChild(row);
    });
  };

  /* -------- 十、情景选择 -------- */
  QUIZ_RENDERERS['scenario'] = function(section, body, opts = {}) {
    section.items.forEach((item, idx) => {
      const row = h('div', { class: 'quiz-item' });
      row.appendChild(h('div', { class: 'quiz-item__num' }, String(idx + 1)));
      row.appendChild(h('div', { class: 'q-scene' }, item.scene));
      row.appendChild(buildChoiceButtons(item, item.options, null, opts));
      body.appendChild(row);
    });
  };

  /* -------- 九、图片 + 句子判断（无音频）-------- */
  QUIZ_RENDERERS['pic-judge'] = function(section, body, opts = {}) {
    section.items.forEach((item, idx) => {
      const row = h('div', { class: 'quiz-item' });
      row.appendChild(h('div', { class: 'quiz-item__num' }, String(idx + 1)));

      const prompt = h('div', { class: 'quiz-item__prompt' });
      const imgUrl = resolveQuizAsset(item.image, 'image');
      if (imgUrl) {
        prompt.appendChild(h('div', { class: 'q-thumb' }, h('img', { src: imgUrl, loading: 'lazy', alt: '' })));
      }
      prompt.appendChild(h('div', { class: 'q-sent-text' }, item.text));
      row.appendChild(prompt);

      const userAns = section.userAnswers[item.id];
      const judge = h('div', { class: 'q-judge' });
      const okBtn = h('button', { class: 'ok' }, '✓');
      const noBtn = h('button', { class: 'no' }, '✗');
      if (userAns === true)  okBtn.classList.add('selected');
      if (userAns === false) noBtn.classList.add('selected');
      if (opts.review) {
        okBtn.disabled = noBtn.disabled = true;
        if (item.correct === true)  okBtn.classList.add('correct-answer');
        if (item.correct === false) noBtn.classList.add('correct-answer');
        if (userAns !== undefined && userAns !== item.correct) {
          (userAns ? okBtn : noBtn).classList.add('wrong');
        }
      } else {
        okBtn.addEventListener('click', () => { section.userAnswers[item.id] = true;  renderQuizSection(); });
        noBtn.addEventListener('click', () => { section.userAnswers[item.id] = false; renderQuizSection(); });
      }
      judge.append(okBtn, noBtn);
      row.appendChild(judge);
      body.appendChild(row);
    });
  };

  /* -------- 十一、连线（点 I 栏 → 点 II 栏）--------
   * 一个 section.items[0].pairs = [{q,a}, ...] 共 6 对
   * userAnswers[itemId] = { 0: aIdx, 1: aIdx, ... }  Q 下标 → A 下标
   * ------------------------------------------------ */
  QUIZ_RENDERERS['match-columns'] = function(section, body, opts = {}) {
    const item = section.items[0];  // 只抽一组
    if (!item) return;
    const userAns = section.userAnswers[item.id] = section.userAnswers[item.id] || {};

    // 打乱 II 栏显示顺序（但原数据保持 qIdx === aIdx 为正确）
    if (!section._scrambled) {
      const order = item.pairs.map((_, i) => i).sort(() => Math.random() - 0.5);
      section._scrambled = order;  // displayIdx → actualAIdx
    }
    const shuffle = section._scrambled;

    const outer = h('div', { class: 'quiz-item match-box' });
    outer.appendChild(h('div', { style: 'flex-basis: 100%; color: var(--ink-light); font-size: 0.9rem;' },
      '左右配对：点 I 栏的一句 → 再点 II 栏对应答句'));
    const cols = h('div', { class: 'q-match-cols' });
    const left  = h('div', { class: 'q-match-col q-match-col--q' });
    const right = h('div', { class: 'q-match-col q-match-col--a' });
    // SVG 画线（绝对定位覆盖在两列之间）
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'q-match-lines');
    svg.setAttribute('xmlns', svgNS);

    let pickedQ = section._pickedQ;  // 当前选中的 Q 下标
    const render = () => {
      left.innerHTML = '';
      right.innerHTML = '';

      item.pairs.forEach((pair, qIdx) => {
        const aDisplayIdx = shuffle.indexOf(userAns[qIdx] != null ? userAns[qIdx] : -1);
        const qCell = h('button', { class: 'q-match-cell' },
          h('span', { class: 'q-match-cell__label' }, String.fromCharCode(65 + qIdx)),
          pair.q
        );
        if (pickedQ === qIdx) qCell.classList.add('picked');
        if (userAns[qIdx] != null) qCell.classList.add('matched');
        if (opts.review) {
          qCell.disabled = true;
          if (userAns[qIdx] === qIdx) qCell.classList.add('correct');
          else if (userAns[qIdx] != null) qCell.classList.add('wrong');
        } else {
          qCell.addEventListener('click', () => {
            section._pickedQ = pickedQ = qIdx;
            render();
          });
        }
        left.appendChild(qCell);
      });

      shuffle.forEach((actualIdx, displayIdx) => {
        const pair = item.pairs[actualIdx];
        const aCell = h('button', { class: 'q-match-cell' },
          h('span', { class: 'q-match-cell__label' }, String.fromCharCode(97 + displayIdx)),
          pair.a
        );
        // 哪个 Q 连到这个 A?
        const linkedQ = Object.entries(userAns).find(([, aIdx]) => aIdx === actualIdx)?.[0];
        if (linkedQ != null) {
          aCell.classList.add('matched');
          aCell.appendChild(h('span', { class: 'q-match-cell__link' }, `→ ${String.fromCharCode(65 + (+linkedQ))}`));
        }
        if (opts.review) {
          aCell.disabled = true;
        } else {
          aCell.addEventListener('click', () => {
            if (pickedQ == null) {
              toast('先点左边的问题');
              return;
            }
            // 如果此 A 已连到其他 Q,先解除
            const prevLink = Object.entries(userAns).find(([, aIdx]) => aIdx === actualIdx)?.[0];
            if (prevLink != null) delete userAns[prevLink];
            userAns[pickedQ] = actualIdx;
            section._pickedQ = pickedQ = null;
            render();
            renderQuizSection();  // 刷新 header 进度
          });
        }
        right.appendChild(aCell);
      });
    };
    cols.append(left, right, svg);
    outer.appendChild(cols);
    body.appendChild(outer);
    render();

    // 在 DOM 渲染后画线（需要真实 rect）
    requestAnimationFrame(() => drawMatchLines(cols, svg, item, userAns, shuffle, opts));
  };

  function drawMatchLines(cols, svg, item, userAns, scrambled, opts) {
    svg.innerHTML = '';
    const cRect = cols.getBoundingClientRect();
    const w = cols.clientWidth, hEl = cols.clientHeight;
    svg.setAttribute('width',  w);
    svg.setAttribute('height', hEl);
    svg.setAttribute('viewBox', `0 0 ${w} ${hEl}`);

    const leftCells  = cols.querySelectorAll('.q-match-col--q .q-match-cell');
    const rightCells = cols.querySelectorAll('.q-match-col--a .q-match-cell');
    Object.entries(userAns).forEach(([qIdxStr, actualAIdx]) => {
      const qIdx = +qIdxStr;
      const displayIdx = scrambled.indexOf(actualAIdx);
      const qC = leftCells[qIdx];
      const aC = rightCells[displayIdx];
      if (!qC || !aC) return;
      const qR = qC.getBoundingClientRect();
      const aR = aC.getBoundingClientRect();
      const x1 = qR.right - cRect.left;
      const y1 = qR.top + qR.height / 2 - cRect.top;
      const x2 = aR.left - cRect.left;
      const y2 = aR.top + aR.height / 2 - cRect.top;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      // 曲线 C
      const midX = (x1 + x2) / 2;
      line.setAttribute('d', `M ${x1},${y1} C ${midX},${y1} ${midX},${y2} ${x2},${y2}`);
      line.setAttribute('stroke', opts?.review
        ? (qIdx === actualAIdx ? '#7DCE82' : '#FF6B6B')
        : '#FF9FB5');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
    });
  }

  /* -------- 十二、对话填空（词库 + 点空位选词）--------
   * item = { pool: [...], dialog: [{speaker, parts: [{t}|{blank:'answer'}]}] }
   * userAnswers[itemId] = { blankIdx: userChosenWord }
   * ------------------------------------------------ */
  QUIZ_RENDERERS['dialog-fill'] = function(section, body, opts = {}) {
    const item = section.items[0];
    if (!item) return;
    const userAns = section.userAnswers[item.id] = section.userAnswers[item.id] || {};

    const outer = h('div', { class: 'quiz-item dialog-box', style: 'flex-direction: column; align-items: stretch;' });

    // 词库
    const blanks = [];
    item.dialog.forEach(line => line.parts.forEach(p => { if (p.blank) blanks.push(p.blank); }));

    const poolBox = h('div', { class: 'q-dialog-pool' });
    const usedWords = new Set(Object.values(userAns));
    item.pool.forEach(word => {
      const chip = h('button', { class: 'q-pool-chip' }, word);
      if (usedWords.has(word)) chip.classList.add('used');
      if (!opts.review) {
        chip.addEventListener('click', () => {
          // 找第一个未填的空位,把词填进去
          const firstEmpty = blanks.findIndex((_, i) => userAns[i] == null);
          if (firstEmpty >= 0) {
            userAns[firstEmpty] = word;
            renderQuizSection();
          } else {
            toast('所有空都填了,点空位可以改');
          }
        });
      }
      poolBox.appendChild(chip);
    });
    outer.appendChild(h('div', { style: 'color: var(--ink-light); font-size: 0.9rem; margin-bottom: 4px;' }, '📦 词库：'));
    outer.appendChild(poolBox);

    // 对话
    const dialogBox = h('div', { class: 'q-dialog-lines' });
    let blankIdx = 0;
    item.dialog.forEach(line => {
      const lineEl = h('div', { class: 'q-dialog-line' });
      lineEl.appendChild(h('span', { class: 'q-speaker' }, line.speaker + ':'));
      const contentEl = h('span', { class: 'q-dialog-content' });
      line.parts.forEach(p => {
        if (p.blank) {
          const b = blankIdx++;
          const span = h('span', { class: 'q-dialog-blank' }, userAns[b] || '___');
          if (userAns[b]) span.classList.add('filled');
          if (opts.review) {
            if (userAns[b] === p.blank) span.classList.add('correct');
            else span.classList.add('wrong');
            // review 模式附加正确答案
            if (userAns[b] !== p.blank) {
              contentEl.appendChild(span);
              contentEl.appendChild(h('span', { class: 'q-dialog-correct' }, `(正确: ${p.blank})`));
              return;
            }
          } else {
            span.addEventListener('click', () => {
              delete userAns[b];
              renderQuizSection();
            });
          }
          contentEl.appendChild(span);
        } else {
          contentEl.appendChild(document.createTextNode(p.t));
        }
      });
      lineEl.appendChild(contentEl);
      dialogBox.appendChild(lineEl);
    });
    outer.appendChild(dialogBox);
    body.appendChild(outer);
  };

  /* -------- 五、听录音选出相应的答句（和 listen-choose 几乎一样）-------- */
  //   统一走 playQuizAudio，它内部会优先 MP3 → 加载失败或 404 才退回 TTS。
  //   别在外层再叠一层 TTS，否则会和 MP3 同时出声。
  QUIZ_RENDERERS['listen-response'] = function(section, body, opts = {}) {
    section.items.forEach((item, idx) => {
      const row = h('div', { class: 'quiz-item' });
      row.appendChild(h('div', { class: 'quiz-item__num' }, String(idx + 1)));
      const prompt = h('div', { class: 'quiz-item__prompt' });
      const audioBtn = h('button', { class: 'q-audio-btn' }, '🔊');
      audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playQuizAudio(item.audio, audioBtn, item.audioText);
      });
      prompt.appendChild(audioBtn);
      row.appendChild(prompt);
      row.appendChild(buildChoiceButtons(item, item.options, null, opts));
      body.appendChild(row);
    });
  };

  /* -------- 六、听对话填空（顶部听音按钮 + dialog-fill 复用） -------- */
  QUIZ_RENDERERS['listen-fill'] = function(section, body, opts = {}) {
    const item = section.items[0];
    if (!item) return;

    const audioRow = h('div', { class: 'quiz-item', style: 'justify-content: center;' });
    const bigBtn = h('button', { class: 'btn btn--lg btn--pink' }, '🔊 播放整段对话');
    bigBtn.addEventListener('click', () => {
      playQuizAudio(item.audio, bigBtn, item.audioText);
    });
    audioRow.appendChild(bigBtn);
    body.appendChild(audioRow);

    // 重用 dialog-fill 的填空 UI
    QUIZ_RENDERERS['dialog-fill'](section, body, opts);
  };

  /* -------- 四、听录音给图片排序 --------
   * sequence = 音频播放顺序；images = 打乱的 6 张图
   * user = { imgIdx: orderNum(1-6) }
   * ---------------------------------- */
  QUIZ_RENDERERS['listen-order'] = function(section, body, opts = {}) {
    const item = section.items[0];
    if (!item) return;
    const userAns = section.userAnswers[item.id] = section.userAnswers[item.id] || {};

    if (!opts.review) {
      const topRow = h('div', { class: 'quiz-item', style: 'justify-content: center;' });
      const playAllBtn = h('button', { class: 'btn btn--lg btn--pink' }, '▶️ 顺序播 6 句');
      playAllBtn.addEventListener('click', async () => {
        playAllBtn.disabled = true;
        for (const ref of item.sequence) {
          await new Promise(res => {
            const url = resolveQuizAsset(ref, 'audio');
            if (!url) { res(); return; }
            stopCurrent();
            const a = new Audio(url);
            currentAudio = a;
            a.onended = a.onerror = () => { if (currentAudio === a) currentAudio = null; res(); };
            a.play().catch(res);
          });
          await new Promise(r => setTimeout(r, 500));
        }
        playAllBtn.disabled = false;
      });
      topRow.appendChild(playAllBtn);
      body.appendChild(topRow);
    }

    const grid = h('div', { class: 'q-order-grid' });
    item.images.forEach((imgRef, imgIdx) => {
      const cell = h('div', { class: 'q-order-cell' });
      const imgUrl = resolveQuizAsset(imgRef, 'image');
      if (imgUrl) cell.appendChild(h('img', { src: imgUrl, loading: 'lazy' }));
      const nums = h('div', { class: 'q-order-nums' });
      for (let n = 1; n <= 6; n++) {
        const nb = h('button', { class: 'q-order-num' }, String(n));
        if (userAns[imgIdx] === n) nb.classList.add('selected');
        if (opts.review) {
          nb.disabled = true;
          const expected = item.sequence.indexOf(imgRef) + 1;
          if (userAns[imgIdx] === n) {
            if (n === expected) nb.classList.add('correct');
            else nb.classList.add('wrong');
          }
          if (n === expected && userAns[imgIdx] !== n) nb.classList.add('correct-answer');
        } else {
          nb.addEventListener('click', () => {
            Object.keys(userAns).forEach(k => { if (userAns[k] === n) delete userAns[k]; });
            userAns[imgIdx] = n;
            renderQuizSection();
          });
        }
        nums.appendChild(nb);
      }
      cell.appendChild(nums);
      grid.appendChild(cell);
    });
    body.appendChild(grid);
  };

  /* ============================================================
   * 13.V 今日任务板 · 替代"直奔课程"的开场,给孩子选择感
   * ============================================================ */
  function renderTaskBoard() {
    switchScreen('tasks');
    const screen = $('#screen-tasks');
    screen.innerHTML = '';

    const today = new Date().toISOString().slice(0, 10);
    const done = STATE.tasksDone[today] || {};
    const doneCount = Object.values(done).filter(x => x).length;
    const unit = unitForDay(STATE.currentDay);
    const dueWords = srsGetDueWords(50).length;

    const page = h('div', { style: 'max-width: 980px; margin: 0 auto; padding: 16px 24px;' });
    page.appendChild(h('h2', { style: 'text-align: center;' }, '🎯 今日任务'));
    page.appendChild(h('p', { style: 'text-align: center; color: var(--ink-light); margin-bottom: 8px;' },
      unit ? `${unit.emoji} Unit ${unit.id} · ${unit.titleZh}` : ''));

    // ——— 流程引导条 ———
    // 3 步流程:主课 → 闯关 → 默写,当前步骤加 pulse 高亮,已完成打钩
    const FLOW_STEPS = [
      { id: 'lesson',   emoji: '🎧', label: '1. 主课' },
      { id: 'vocabSrs', emoji: '🧠', label: '2. 闯关' },
      { id: 'dictation',emoji: '✏️', label: '3. 默写' },
    ];
    const firstUndone = FLOW_STEPS.find(s => !done[s.id]);
    const guidance = !firstUndone
      ? '🎉 今日全部完成 · 你真棒!'
      : (doneCount === 0
          ? `👇 先点 "${firstUndone.label}" 开始`
          : `👇 还差 ${3 - doneCount} 步,接着做 "${firstUndone.label}"`);
    const flowBar = h('div', { class: 'flow-bar', style: 'display:flex; justify-content:center; gap:8px; margin:10px 0 6px;' });
    FLOW_STEPS.forEach(s => {
      const isDone = !!done[s.id];
      const isCurrent = firstUndone && firstUndone.id === s.id;
      const cls = 'flow-step' + (isDone ? ' flow-done' : '') + (isCurrent ? ' flow-current' : '');
      flowBar.appendChild(h('div', { class: cls, style: [
        'padding:6px 12px', 'border-radius:20px',
        'font-size:0.85rem', 'font-weight:600',
        'background:' + (isDone ? '#c8f0c8' : (isCurrent ? '#fff4a0' : '#f0f0f0')),
        'color:' + (isDone ? '#2a7a2a' : (isCurrent ? '#8a5a00' : '#999')),
        'border:' + (isCurrent ? '2px solid #f0b000' : '2px solid transparent'),
      ].join(';') }, (isDone ? '✅ ' : s.emoji + ' ') + s.label));
    });
    page.appendChild(flowBar);
    page.appendChild(h('p', { style: 'text-align:center; color:var(--ink-light); font-size:0.9rem; margin:4px 0 20px;' }, guidance));

    const tasks = [
      {
        id: 'lesson',
        title: '🎧 听力吸收',
        desc: `整单元 ${unit ? unit.titleZh : ''}闯关 · 听/跟/填/背/换 5 关`,
        time: '10-15 分钟',
        reward: '+3 金币',
        action: startLesson,
      },
      {
        id: 'vocabSrs',
        title: '🧠 单词闯关',
        desc: dueWords > 0 ? `今日 ${dueWords} 个词需复习` : '今日全部掌握,来复习熟词',
        time: '5-8 分钟',
        reward: '每对 +2',
        action: renderVocabSrs,
      },
      {
        id: 'dictation',
        title: '✏️ 默写本',
        desc: '家长辅助 · 听音落纸 · 单词或句子',
        time: '5-10 分钟',
        reward: '每对 +2',
        action: renderDictationPicker,
      },
    ];

    const grid = h('div', { class: 'task-grid' });
    tasks.forEach(t => {
      const card = h('div', { class: 'task-card ' + (done[t.id] ? 'task-done' : '') });
      card.appendChild(h('div', { class: 'task-title' }, t.title));
      card.appendChild(h('div', { class: 'task-desc' }, t.desc));
      card.appendChild(h('div', { class: 'task-meta' },
        h('span', {}, '⏱ ' + t.time),
        h('span', {}, t.reward)
      ));
      if (done[t.id]) {
        card.appendChild(h('div', { class: 'task-status' }, '✅ 已完成'));
      }
      const btn = h('button', { class: 'btn btn--lg btn--' + (done[t.id] ? 'mint' : 'pink') },
        done[t.id] ? '🔁 再来一次' : '▶️ 开始');
      btn.addEventListener('click', t.action);
      card.appendChild(btn);
      grid.appendChild(card);
    });
    page.appendChild(grid);

    // 额外入口
    page.appendChild(h('div', { style: 'text-align: center; margin-top: 24px;' },
      h('p', { style: 'color: var(--ink-light); font-size: 0.85rem;' },
        '想做其他的?→ '),
      h('div', { class: 'flex gap-sm justify-center flex-wrap', style: 'margin-top: 8px;' },
        h('button', { class: 'btn btn--sm btn--yellow', onclick: renderDailyPopQuiz }, '🎲 今日突袭 5 词'),
        h('button', { class: 'btn btn--sm', onclick: renderUnitMap }, '🗺 单元地图'),
        h('button', { class: 'btn btn--sm', onclick: renderQuizPicker }, '📝 模拟测验'),
        h('button', { class: 'btn btn--sm', onclick: renderErrorReview }, '🔁 错题回顾'),
        h('button', { class: 'btn btn--sm', onclick: goHome }, '🏠 主页')
      )
    ));

    screen.appendChild(page);

    // —— 全部完成?弹结业章(每天只弹 1 次) ——
    const allDone = FLOW_STEPS.every(s => done[s.id]);
    if (allDone && !done._celebrated) {
      STATE.tasksDone[today]._celebrated = true;
      saveState();
      setTimeout(() => showDailyCertificate(today), 900);
    }
  }

  // 每日结业章 · 3 件都完成时弹一次
  function showDailyCertificate(today) {
    const childName = STATE.settings.childName || 'Cory';
    const wordsMastered = (STATE.popWordsKnown || []).length;
    const starsToday = STATE.score || 0;
    const streak = STATE.popStreak || 0;

    const bd = h('div', { class: 'modal-backdrop cert-backdrop' });
    const panel = h('div', { class: 'modal cert-panel' });
    bd.appendChild(panel);
    $('#modal-root').appendChild(bd);

    panel.appendChild(h('div', { class: 'cert-stars' }, '⭐ ⭐ ⭐'));
    panel.appendChild(h('div', { class: 'cert-trophy' }, '🏆'));
    panel.appendChild(h('h2', { class: 'cert-title' }, `${childName}, 今日完结!`));
    panel.appendChild(h('p', { class: 'cert-sub' }, '3 件任务全部完成 · 今天超棒!'));

    panel.appendChild(h('div', { class: 'cert-stats' },
      h('div', { class: 'cert-stat' },
        h('div', { class: 'cert-stat-num' }, '⭐ ' + starsToday),
        h('div', { class: 'cert-stat-lbl' }, '总星星')),
      h('div', { class: 'cert-stat' },
        h('div', { class: 'cert-stat-num' }, '📚 ' + wordsMastered),
        h('div', { class: 'cert-stat-lbl' }, '已掌握')),
      h('div', { class: 'cert-stat' },
        h('div', { class: 'cert-stat-num' }, '🔥 ' + streak),
        h('div', { class: 'cert-stat-lbl' }, '连对')),
    ));

    panel.appendChild(h('div', { class: 'cert-msg' }, '🌟 明天继续加油!'));

    const btn = h('button', { class: 'btn btn--xl btn--pink' }, '好的,休息吧!');
    btn.addEventListener('click', () => {
      stopAllAudio();
      bd.remove();
    });
    panel.appendChild(h('div', { style: 'text-align:center; margin-top:18px;' }, btn));

    spawnConfetti(60);
    showCoach('streak', {}, { duration: 3500 });
  }

  // —— 单元地图(孩子当前单元的 7 句 = 7 个关卡) ——
  function renderUnitMap() {
    switchScreen('tasks');
    const screen = $('#screen-tasks');
    screen.innerHTML = '';

    const unit = unitForDay(STATE.currentDay);
    if (!unit) { toast('无当前单元'); return; }

    const ids = typeof UNIT_FULL_LESSONS !== 'undefined' ? (UNIT_FULL_LESSONS[unit.id] || []) : [];
    const sentences = ids.map(id => SENTENCES_BY_ID[id]).filter(Boolean);

    const page = h('div', { style: 'max-width: 980px; margin: 0 auto; padding: 16px 24px;' });
    page.appendChild(h('h2', { style: 'text-align: center;' }, `🗺 ${unit.emoji} ${unit.titleZh} 地图`));
    page.appendChild(h('p', { style: 'text-align: center; color: var(--ink-light);' },
      `7 个关卡 · 每个关卡一个句子 · 点击回到那一句重学`));

    const mapBox = h('div', { class: 'unit-map' });
    sentences.forEach((s, i) => {
      const m = STATE.mastery[s.id];
      const status = m?.status === 'mastered' ? 'done' : (m ? 'progress' : 'new');
      const stop = h('div', { class: 'map-stop map-stop--' + status });
      const imgUrl = getSentenceImageUrl(s.id);
      if (imgUrl) stop.appendChild(h('img', { src: imgUrl, class: 'map-stop-img' }));
      stop.appendChild(h('div', { class: 'map-stop-num' }, String(i + 1)));
      stop.appendChild(h('div', { class: 'map-stop-en' }, s.en));
      stop.appendChild(h('div', { class: 'map-stop-zh' }, s.zh));
      stop.addEventListener('click', () => {
        stopAllAudio();
        playQuizAudio('sent:' + s.id);
      });
      mapBox.appendChild(stop);
    });
    page.appendChild(mapBox);

    page.appendChild(h('div', { style: 'text-align: center; margin-top: 20px;' },
      h('button', { class: 'btn btn--lg btn--pink', onclick: startLesson }, '🎯 开始整单元闯关'),
      h('button', { class: 'btn btn--sm', style: 'margin-left: 12px;', onclick: renderTaskBoard }, '‹ 回任务板')
    ));

    screen.appendChild(page);
  }

  // 完成一节课时,标记任务完成
  function markTaskDone(taskId) {
    const today = new Date().toISOString().slice(0, 10);
    STATE.tasksDone[today] = STATE.tasksDone[today] || {};
    STATE.tasksDone[today][taskId] = true;
    saveState();
  }

  /* ============================================================
   * 13.W 单词闯关 · SRS (Spaced Repetition)
   * ============================================================
   * 每个词存 { interval, ease, due, lastSeen }
   * 对 → interval *= ease; due = now + interval
   * 错 → interval = 1; ease -= 0.2 (最低 1.3)
   * 今天要复习的词 = 所有 due <= today 的词
   * 新词(vocabSRS 没记录的)视为 due today
   * ============================================================ */
  function srsGetDueWords(maxCount = 15) {
    const today = new Date().toISOString().slice(0, 10);
    // 所有可能的词(仅 core,字母和歌谣词不做 SRS)
    const allWords = (VOCAB.core || []).filter(w => w.en && w.zh);
    const dueList = [];
    allWords.forEach(w => {
      const rec = STATE.vocabSRS[w.id];
      if (!rec) {
        dueList.push({ word: w, priority: 0, isNew: true });
        return;
      }
      if (rec.due && rec.due <= today) {
        // 越久没复习的优先
        const overdue = Math.max(0, (new Date(today) - new Date(rec.due)) / 86400000);
        dueList.push({ word: w, priority: overdue + 10, isNew: false });
      }
    });
    dueList.sort((a, b) => b.priority - a.priority);
    return dueList.slice(0, maxCount);
  }

  function srsUpdate(wordId, correct) {
    const today = new Date().toISOString().slice(0, 10);
    const rec = STATE.vocabSRS[wordId] || { interval: 1, ease: 2.5, due: today, lastSeen: null };
    rec.lastSeen = today;
    if (correct) {
      rec.interval = Math.max(1, Math.round(rec.interval * rec.ease));
      rec.ease = Math.min(3.5, rec.ease + 0.05);
    } else {
      rec.interval = 1;
      rec.ease = Math.max(1.3, rec.ease - 0.2);
    }
    const next = new Date();
    next.setDate(next.getDate() + rec.interval);
    rec.due = next.toISOString().slice(0, 10);
    STATE.vocabSRS[wordId] = rec;
    saveState();
  }

  function renderVocabSrs() {
    switchScreen('vocabsrs');
    const screen = $('#screen-vocabsrs');
    screen.innerHTML = '';

    const due = srsGetDueWords(20);
    const allWords = (VOCAB.core || []).filter(w => w.en && w.zh);
    const learned = Object.keys(STATE.vocabSRS).length;
    const mastered = Object.values(STATE.vocabSRS).filter(r => r.interval >= 14).length;

    const page = h('div', { class: 'vocab-srs-page' });
    page.appendChild(h('h2', { style: 'text-align: center;' }, '🧠 单词闯关'));
    page.appendChild(h('p', { style: 'text-align: center; color: var(--ink-light);' },
      '科学间隔重复 · 每天只练需要复习的词 · 3 种游戏交替'));

    const summary = h('div', { class: 'vocab-srs-summary' });
    summary.appendChild(h('div', { class: 'vocab-srs-stat' }, h('div', { class: 'num' }, String(due.length)), h('div', { class: 'label' }, '今日待过')));
    summary.appendChild(h('div', { class: 'vocab-srs-stat' }, h('div', { class: 'num' }, String(learned)),   h('div', { class: 'label' }, '已学')));
    summary.appendChild(h('div', { class: 'vocab-srs-stat' }, h('div', { class: 'num' }, String(mastered)),  h('div', { class: 'label' }, '已掌握')));
    summary.appendChild(h('div', { class: 'vocab-srs-stat' }, h('div', { class: 'num' }, String(allWords.length)), h('div', { class: 'label' }, '总词汇')));
    page.appendChild(summary);

    if (due.length === 0) {
      page.appendChild(h('div', { class: 'vocab-game-card' },
        h('div', { style: 'font-size: 5rem;' }, '🏆'),
        h('h3', {}, '今日全部过完!'),
        h('p', {}, '所有单词的间隔都还没到 → 明天再来。继续保持!')
      ));
      page.appendChild(h('div', { style: 'text-align: center;' },
        h('button', { class: 'btn btn--lg btn--pink', onclick: goHome }, '🏠 回主页')
      ));
    } else {
      page.appendChild(h('div', { style: 'text-align: center; margin: 20px 0;' },
        h('button', { class: 'btn btn--xl btn--pink', onclick: () => startVocabRound(due) }, `🎯 开始复习 ${due.length} 个词`)
      ));
      page.appendChild(h('div', { style: 'text-align: center;' },
        h('button', { class: 'btn btn--sm', onclick: goHome }, '🏠 回主页')
      ));
    }

    screen.appendChild(page);
  }

  function startVocabRound(due) {
    // 5 种游戏，拼写型占多数（强制孩子能写出每个字母）：
    //   tiles  · 拼字母(中级,有干扰字母)   ← 拼写
    //   typing · 虚拟键盘打字(最难,从空白写) ← 拼写 ⭐
    //   zh2en  · 看中选英(认词)
    //   imgpick· 看图选词(认词)
    //   audioSpell · 听音打字(最难,无提示)  ← 拼写 ⭐
    // 分配规则:拼写类权重 60% → 每 5 个词至少 3 个拼写题
    const WEIGHTED = ['tiles', 'typing', 'audioSpell', 'zh2en', 'imgpick'];  // 前 3 个是拼写
    const deck = due.map((it, i) => ({
      word: it.word,
      game: WEIGHTED[i % WEIGHTED.length],
    })).sort(() => Math.random() - 0.5);

    let idx = 0, correct = 0;

    function renderCard() {
      if (idx >= deck.length) return finish();
      const { word, game } = deck[idx];
      const screen = $('#screen-vocabsrs');
      screen.innerHTML = '';

      const page = h('div', { class: 'vocab-srs-page' });
      const GAME_NAMES = {
        tiles:      '🔤 拼字母',
        typing:     '⌨️ 键盘拼写',
        audioSpell: '🎧 听音拼写',
        zh2en:      '📖 看中选英',
        imgpick:    '🖼 看图选词',
      };
      page.appendChild(h('div', { class: 'chip chip--blue', style: 'text-align: center; display: block; margin: 0 auto 12px; width: fit-content;' },
        `第 ${idx + 1} / ${deck.length} · ${GAME_NAMES[game] || game}`
      ));

      const card = h('div', { class: 'vocab-game-card' });
      const imgUrl = getVocabImageUrl(word.id);
      if (imgUrl) {
        card.appendChild(h('div', { class: 'img-holder' }, h('img', { src: imgUrl, alt: word.en })));
      } else {
        card.appendChild(h('div', { class: 'emoji-big' }, word.emoji || '📘'));
      }

      if (game === 'tiles') {
        card.appendChild(h('div', { class: 'zh-prompt' }, word.zh));
        renderLetterTileGame(word, card, (ok) => onAnswer(word, ok));
      } else if (game === 'typing') {
        card.appendChild(h('div', { class: 'zh-prompt' }, word.zh));
        card.appendChild(h('div', { style: 'font-size: 0.85rem; color: var(--ink-light);' }, '用下面字母盘从零开始拼'));
        renderTypingGame(word, card, (ok) => onAnswer(word, ok), { hint: false });
      } else if (game === 'audioSpell') {
        // 最难:只有音,没中文没图,纯听写
        card.appendChild(h('div', { class: 'zh-prompt' }, '🎧 听音 → 拼写'));
        card.appendChild(h('div', { style: 'font-size: 0.85rem; color: var(--ink-light);' }, '点 🔊 反复听,拼出英文'));
        renderTypingGame(word, card, (ok) => onAnswer(word, ok), { hint: false });
      } else if (game === 'zh2en') {
        card.appendChild(h('div', { class: 'zh-prompt' }, word.zh));
        render4Choice(word, card, 'en', (ok) => onAnswer(word, ok));
      } else {
        card.appendChild(h('div', { style: 'font-family: var(--font-zh-body); color: var(--ink-light);' }, '选对应的英文词'));
        render4Choice(word, card, 'pic', (ok) => onAnswer(word, ok));
      }
      page.appendChild(card);

      // 发音按钮
      page.appendChild(h('div', { style: 'text-align: center;' },
        h('button', { class: 'btn btn--sm btn--yellow', onclick: () => playQuizAudio('vocab:' + word.id) }, '🔊 听一遍')
      ));
      page.appendChild(h('div', { style: 'text-align: center; margin-top: 12px;' },
        h('button', { class: 'btn btn--sm', onclick: renderVocabSrs }, '⏸ 退出')
      ));

      screen.appendChild(page);
      // 自动播一次
      setTimeout(() => playQuizAudio('vocab:' + word.id), 300);
    }

    function onAnswer(word, ok) {
      srsUpdate(word.id, ok);
      if (ok) correct++;
      idx++;
      setTimeout(renderCard, 800);
    }

    function finish() {
      const screen = $('#screen-vocabsrs');
      screen.innerHTML = '';
      const page = h('div', { class: 'vocab-srs-page', style: 'text-align: center;' });
      page.appendChild(h('h2', {}, correct === deck.length ? '💯 全对!' : correct >= deck.length * 0.7 ? '🏆 很好' : '💪 继续'));
      page.appendChild(h('div', { style: 'font-size: 3rem; font-family: var(--font-en);' }, `${correct} / ${deck.length}`));
      // 标记今日任务完成
      const today = new Date().toISOString().slice(0, 10);
      STATE.tasksDone[today] = STATE.tasksDone[today] || {};
      STATE.tasksDone[today].vocabSrs = true;
      STATE.score += correct * 2;
      saveState();
      renderTopbar();
      page.appendChild(h('div', { style: 'margin-top: 20px;' }, `+${correct * 2} 金币`));
      page.appendChild(h('div', { class: 'flex gap-md justify-center', style: 'margin-top: 24px;' },
        h('button', { class: 'btn btn--lg btn--pink', onclick: goHome }, '🏠 主页'),
        h('button', { class: 'btn btn--lg btn--blue', onclick: renderVocabSrs }, '🔁 再来')
      ));
      screen.appendChild(page);
      if (correct >= deck.length * 0.8) spawnConfetti(40);
    }

    renderCard();
  }

  // —— 游戏 1: 拼字母 ——
  function renderLetterTileGame(word, container, onDone) {
    const target = word.en.replace(/[^a-zA-Z'-]/g, '');  // 去掉标点空格
    const letters = target.split('');
    // 打乱字母 + 加 2 个干扰
    const distractors = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !target.toLowerCase().includes(c));
    const pool = shuffle([...letters, ...shuffle(distractors).slice(0, Math.min(2, distractors.length))]);

    const slotsEl  = h('div', { class: 'letter-slots' });
    const tilesEl  = h('div', { class: 'letter-tiles' });
    const fillings = new Array(letters.length).fill(null);

    letters.forEach((_, i) => {
      const slot = h('div', { class: 'letter-slot', 'data-i': i }, '_');
      slot.addEventListener('click', () => {
        // 点空位 → 撤回
        if (fillings[i] != null) {
          const tileIdx = fillings[i];
          fillings[i] = null;
          slot.textContent = '_';
          slot.classList.remove('filled');
          tilesEl.children[tileIdx].classList.remove('used');
        }
      });
      slotsEl.appendChild(slot);
    });

    pool.forEach((ch, i) => {
      const tile = h('button', { class: 'letter-tile' }, ch);
      tile.addEventListener('click', () => {
        if (tile.classList.contains('used')) return;
        const firstEmpty = fillings.findIndex(f => f == null);
        if (firstEmpty < 0) return;
        fillings[firstEmpty] = i;
        slotsEl.children[firstEmpty].textContent = ch;
        slotsEl.children[firstEmpty].classList.add('filled');
        tile.classList.add('used');
        checkIfDone();
      });
      tilesEl.appendChild(tile);
    });

    function checkIfDone() {
      if (fillings.every(f => f != null)) {
        const answer = fillings.map((tileIdx, slotIdx) => pool[tileIdx]).join('');
        const ok = answer.toLowerCase() === target.toLowerCase();
        const slots = slotsEl.querySelectorAll('.letter-slot');
        slots.forEach((s, i) => s.classList.add(
          letters[i].toLowerCase() === answer[i].toLowerCase() ? 'correct' : 'wrong'
        ));
        if (!ok) {
          const reveal = h('div', { class: 'spell-reveal' },
            h('span', { style: 'color: var(--ink-light);' }, '正确写法: '),
            h('span', { class: 'spell-reveal-ans' }, word.en)
          );
          container.appendChild(reveal);
        } else {
          spawnConfetti(15);
          container.appendChild(h('div', { class: 'en-answer' }, word.en));
        }
        setTimeout(() => onDone(ok), 1400);
      }
    }

    container.appendChild(slotsEl);
    container.appendChild(tilesEl);
  }

  // —— 游戏: 虚拟 A-Z 键盘打字(最难拼写) ——
  //   word.en 里的空格、标点、撇号等自动预填,孩子只打字母
  function renderTypingGame(word, container, onDone, opts = {}) {
    const target = word.en;
    const chars = target.split('');
    const needType = chars.map(ch => /[a-zA-Z]/.test(ch));  // true=需要打,false=自动填

    const slotsEl = h('div', { class: 'spell-slots' });
    const typed   = new Array(chars.length).fill(null);
    chars.forEach((ch, i) => {
      if (!needType[i]) {
        slotsEl.appendChild(h('div', { class: 'spell-slot spell-auto' }, ch === ' ' ? '·' : ch));
        typed[i] = ch;
      } else {
        const s = h('div', { class: 'spell-slot' }, '_');
        slotsEl.appendChild(s);
      }
    });
    container.appendChild(slotsEl);

    // A-Z 键盘 · 3 排
    const keyboard = h('div', { class: 'spell-keyboard' });
    const rows = ['abcdefghi', 'jklmnopqr', 'stuvwxyz'];
    rows.forEach(row => {
      const rowEl = h('div', { class: 'spell-row' });
      row.split('').forEach(ch => {
        const k = h('button', { class: 'spell-key' }, ch);
        k.addEventListener('click', () => typeChar(ch));
        rowEl.appendChild(k);
      });
      if (row === rows[2]) {
        const bs = h('button', { class: 'spell-key spell-key--bs' }, '⌫');
        bs.addEventListener('click', backspace);
        rowEl.appendChild(bs);
      }
      keyboard.appendChild(rowEl);
    });
    container.appendChild(keyboard);

    // 底部 · 听音按钮 + 提交(自动判)
    let finished = false;
    function typeChar(ch) {
      if (finished) return;
      const i = typed.findIndex((t, idx) => t === null && needType[idx]);
      if (i < 0) return;
      typed[i] = ch;
      const slot = slotsEl.children[i];
      slot.textContent = ch;
      slot.classList.add('filled');
      // 所有需打的都填了就判
      const allFilled = typed.every((t, idx) => !needType[idx] || t !== null);
      if (allFilled) check();
    }
    function backspace() {
      if (finished) return;
      for (let i = typed.length - 1; i >= 0; i--) {
        if (needType[i] && typed[i] !== null) {
          typed[i] = null;
          slotsEl.children[i].textContent = '_';
          slotsEl.children[i].classList.remove('filled');
          break;
        }
      }
    }
    function check() {
      finished = true;
      const answer = typed.join('');
      const ok = answer.toLowerCase() === target.toLowerCase();
      // 每个槽按对错着色
      typed.forEach((t, i) => {
        if (!needType[i]) return;
        const correct = t.toLowerCase() === target[i].toLowerCase();
        slotsEl.children[i].classList.add(correct ? 'correct' : 'wrong');
      });
      // 如果错了,在下方显示正确答案
      if (!ok) {
        const reveal = h('div', { class: 'spell-reveal' },
          h('span', { style: 'color: var(--ink-light);' }, '正确答案: '),
          h('span', { class: 'spell-reveal-ans' }, target)
        );
        container.appendChild(reveal);
      } else {
        spawnConfetti(20);
      }
      setTimeout(() => onDone(ok), 1400);
    }
  }

  // —— 游戏 2/3: 4 选 1(中选英 / 图选英) ——
  function render4Choice(word, container, mode, onDone) {
    const allCore = (VOCAB.core || []).filter(w => w.id !== word.id && w.en && w.zh);
    const distractors = shuffle(allCore).slice(0, 3);
    const options = shuffle([word, ...distractors]);

    const grid = h('div', { class: 'vocab-4-choice' });
    options.forEach(opt => {
      const btn = h('button', { class: 'vocab-choice-btn' }, opt.en);
      btn.addEventListener('click', () => {
        if (btn.classList.contains('correct') || btn.classList.contains('wrong')) return;
        const ok = opt.id === word.id;
        btn.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) {
          // 也高亮正确的
          grid.querySelectorAll('.vocab-choice-btn').forEach(b => {
            if (b.textContent === word.en) b.classList.add('correct');
          });
        } else {
          spawnConfetti(15);
        }
        setTimeout(() => onDone(ok), 900);
      });
      grid.appendChild(btn);
    });
    container.appendChild(grid);
  }

  /* ============================================================
   * 13.X 突袭拼写卡 PopQuiz + 糖糖姐奖励
   * ============================================================
   * 3 个触发点:
   *   - 关卡切换时 30% 概率
   *   - 填空答错时 100%
   *   - 主菜单"🎲 今日突袭"
   * ============================================================ */

  function showPopQuiz(word, onDone, opts = {}) {
    if (!word || !word.en) { onDone && onDone(null); return; }

    const bd = h('div', { class: 'modal-backdrop popquiz-backdrop' });
    const panel = h('div', { class: 'modal popquiz-panel' });
    bd.appendChild(panel);
    $('#modal-root').appendChild(bd);

    // 糖糖姐开场
    playTangtangRandom('popquiz_');

    let wrongAttempts = 0;
    let stageCancel = false;
    let testNum = 1;   // 1st 还是 2nd 次测验(扩展间隔:过第 1 测后稍作间隔再测第 2 次)

    // PopQuiz 专用字母播放:绕过 phonicsMode 设置,一定播字母名
    // (phonicsMode='off' 时 playLetterAudio 返回空队列,PopQuiz 必须独立逻辑)
    function pqPlayLetter(L, onEnd) {
      stopCurrent();
      const url = `./audio/letters/${L}.mp3?v=${window.__APP_VERSION__ || '1'}`;
      const a = new Audio(url);
      currentAudio = a;
      a.onended = a.onerror = () => {
        if (currentAudio === a) currentAudio = null;
        if (onEnd) onEnd();
      };
      a.play().catch(() => onEnd && onEnd());
    }

    // ─── 阶段 A · HYPE 开场(2s) ───────────────────────────
    hypeIntro();

    function hypeIntro() {
      panel.innerHTML = '';
      panel.appendChild(h('div', { class: 'pq-hype-banner' },
        h('span', { class: 'pq-zap' }, '⚡'),
        h('span', { class: 'pq-hype-text' }, 'POP QUIZ!'),
        h('span', { class: 'pq-zap' }, '⚡')
      ));
      panel.appendChild(h('div', { class: 'pq-hype-sub' }, 'Let\'s spell it!'));
      showCoach('popIntro', {}, { duration: 3000 });
      // 等 coach 说完再进下一阶段(intro 台词 ~2.5-3s)
      setTimeout(() => { if (!stageCancel) demo(); }, 3000);
    }

    // ─── 阶段 B · 示范拼读(~6s) ───────────────────────────
    function demo() {
      if (stageCancel) return;
      panel.innerHTML = '';

      const imgUrl = getVocabImageUrl(word.id);
      if (imgUrl) panel.appendChild(h('div', { class: 'popquiz-img' }, h('img', { src: imgUrl, alt: word.en })));
      else if (word.emoji) panel.appendChild(h('div', { class: 'popquiz-emoji' }, word.emoji));
      panel.appendChild(h('div', { class: 'popquiz-zh' }, word.zh));

      const letters = h('div', { class: 'pq-letter-show' });
      const spans = word.en.split('').map((ch, i) => {
        const s = h('span', { class: 'pq-big-letter' + (/[a-zA-Z]/.test(ch) ? '' : ' pq-punct') }, ch);
        letters.appendChild(s);
        return s;
      });
      panel.appendChild(letters);

      const status = h('div', { class: 'pq-status' }, '🎧 Watch & listen...');
      panel.appendChild(status);

      const skipBtn = h('button', { class: 'btn btn--lg btn--mint' }, '✏️ I got it! My turn →');
      skipBtn.addEventListener('click', () => { stopCurrent(); yourTurn(); });
      panel.appendChild(h('div', { class: 'pq-actions' }, skipBtn));

      showCoach('popDemo', {}, { duration: 1800 });

      // 等 coach 说完 "Watch me!" 再开始播单词,避免被打断
      setTimeout(() => runDemoSequence(spans, status, () => { if (!stageCancel) yourTurn(); }), 1600);
    }

    function runDemoSequence(spans, status, onDone) {
      const wordUrl = resolveQuizAsset('vocab:' + word.id, 'audio') || `./audio/vocab/${word.id}.mp3`;
      const chars = word.en.split('');
      status.textContent = '🔊 ' + word.en + ' (慢)';
      // 第一遍:更慢 0.8x,让孩子先听清(对 beautiful/colourful 这类多音节词特别有用)
      playMp3(wordUrl, { rate: 0.8 }).then(() => {
        if (stageCancel) return;
        let i = 0;
        function nextLetter() {
          if (stageCancel) return;
          // Skip non-letter chars
          while (i < chars.length && !/[a-zA-Z]/.test(chars[i])) i++;
          if (i >= chars.length) {
            status.textContent = '✨ ' + word.en.toUpperCase() + '!';
            spans.forEach(s => s.classList.add('pq-final'));
            // 收尾前停 500ms(让孩子感受"全拼完了!")
            setTimeout(() => { if (!stageCancel) playMp3(wordUrl).then(() => setTimeout(() => onDone && onDone(), 500)); }, 500);
            return;
          }
          const ch = chars[i].toUpperCase();
          spans[i].classList.add('pq-pop');
          status.textContent = ch + '!';
          pqPlayLetter(ch, () => {
            if (stageCancel) return;
            // 字母读完后,让 bounce 再多停 450ms 让孩子看清楚 + 间隔气口
            setTimeout(() => { spans[i].classList.remove('pq-pop'); spans[i].classList.add('pq-said'); i++; nextLetter(); }, 450);
          });
        }
        setTimeout(nextLetter, 250);
      });
    }

    // ─── 阶段 C · YOUR TURN! 字母按钮互动 ─────────────────
    function yourTurn() {
      if (stageCancel) return;
      panel.innerHTML = '';
      // 第二次测验换个提示,感觉不同
      showCoach(testNum === 2 ? 'popStreak' : 'popYourTurn', {}, { duration: 2000 });
      if (testNum === 2) {
        panel.appendChild(h('div', { class: 'pq-test2-banner' }, '💪 One more time!'));
      }

      const imgUrl = getVocabImageUrl(word.id);
      if (imgUrl) panel.appendChild(h('div', { class: 'popquiz-img' }, h('img', { src: imgUrl, alt: word.en })));
      panel.appendChild(h('div', { class: 'popquiz-zh' }, word.zh));

      const hintRow = h('div', { class: 'pq-hint-row' });
      const hearBtn = h('button', { class: 'btn btn--sm btn--pink' }, '🔊 Hear again');
      hearBtn.addEventListener('click', () => {
        const u = resolveQuizAsset('vocab:' + word.id, 'audio') || `./audio/vocab/${word.id}.mp3`;
        playMp3(u);
      });
      const slowerBtn = h('button', { class: 'btn btn--sm btn--yellow', style: 'margin-left:8px;' }, '🐌 更慢');
      slowerBtn.addEventListener('click', () => {
        const u = resolveQuizAsset('vocab:' + word.id, 'audio') || `./audio/vocab/${word.id}.mp3`;
        playMp3(u, { rate: 0.6 });
      });
      hintRow.appendChild(hearBtn);
      hintRow.appendChild(slowerBtn);
      panel.appendChild(hintRow);

      // 空格槽 + 字母池
      const chars = word.en.split('');
      const slotsEl = h('div', { class: 'pq-slots' });
      const slotInfo = chars.map((ch) => {
        const isLetter = /[a-zA-Z]/.test(ch);
        const s = h('span', { class: 'pq-slot' + (isLetter ? '' : ' pq-slot-fixed') }, isLetter ? '_' : ch);
        slotsEl.appendChild(s);
        return { span: s, letter: isLetter ? ch.toUpperCase() : ch, fixed: !isLetter, filled: !isLetter };
      });
      panel.appendChild(slotsEl);

      // 字母池(打乱,重复字母全保留)
      const letterQueue = chars.filter(c => /[a-zA-Z]/.test(c)).map(c => c.toUpperCase());
      const shuffled = letterQueue.slice().sort(() => Math.random() - 0.5);
      const pool = h('div', { class: 'pq-letter-pool' });
      shuffled.forEach((L, i) => {
        const btn = h('button', { class: 'btn pq-letter-btn' }, L);
        btn.addEventListener('click', () => onLetterTap(btn, L));
        pool.appendChild(btn);
      });
      panel.appendChild(pool);

      const status = h('div', { class: 'pq-status' }, '👆 Tap letters in order!');
      panel.appendChild(status);

      // 找到当前光标(第一个未填空槽)
      let cursor = slotInfo.findIndex(s => !s.filled);

      function onLetterTap(btn, letter) {
        if (btn.classList.contains('pq-used')) return;
        if (cursor < 0 || cursor >= slotInfo.length) return;
        const expected = slotInfo[cursor].letter;
        if (letter === expected) {
          slotInfo[cursor].span.textContent = letter;
          slotInfo[cursor].span.classList.add('pq-filled');
          slotInfo[cursor].filled = true;
          btn.classList.add('pq-used');
          // 字母音效(直接播,绕过 phonicsMode)
          pqPlayLetter(letter);
          // 前进光标
          cursor++;
          while (cursor < slotInfo.length && slotInfo[cursor].filled) cursor++;
          if (cursor >= slotInfo.length) {
            status.textContent = '✨ ' + word.en.toUpperCase();
            setTimeout(() => celebrate(true), 500);
          } else {
            status.textContent = 'Next: tap any letter';
          }
        } else {
          btn.classList.add('pq-shake');
          status.textContent = '🤔 Try another...';
          setTimeout(() => btn.classList.remove('pq-shake'), 500);
        }
      }

      const giveup = h('button', { class: 'btn btn--sm' }, '⏭ Skip');
      giveup.addEventListener('click', () => close(null));
      panel.appendChild(h('div', { class: 'pq-actions' }, giveup));
    }

    // ─── 阶段 D · 庆祝 / 重试 ─────────────────────────────
    // 扩展间隔:第 1 测过 → mini exposure → 第 2 测 → 真正结束
    //            第 2 测错了也不重试,给 test 1 通过的孩子 credit
    function celebrate(success) {
      if (stageCancel) return;
      if (success) {
        spawnConfetti(testNum === 2 ? 50 : 22);
        if (testNum === 1) {
          // 第 1 测通过 → 小间隔暴露 → 第 2 测
          showCoach('popPraise', {}, { duration: 1800 });
          setTimeout(() => { if (!stageCancel) miniExposure(); }, 1600);
        } else {
          // 第 2 测也通过 → 🎯 MASTERED! 额外奖励
          STATE.score += 2;  // 2 次全对奖 +2
          showCoach('popStreak', {}, { duration: 2800 });
          setTimeout(() => processResult(true), 2200);
        }
      } else {
        wrongAttempts++;
        showCoach('popAlmost', {}, { duration: 2500 });
        if (testNum === 2) {
          // 第 2 测错了 → 不重试,但算作 passed(第 1 测已对)
          setTimeout(() => processResult(true), 1800);
        } else if (wrongAttempts >= 2) {
          setTimeout(() => showAnswer(), 1800);
        } else {
          setTimeout(() => demo(), 1600);
        }
      }
    }

    // 扩展间隔 · 小暴露(不做完整 demo,只快速回看字母 + 播一遍词)
    function miniExposure() {
      if (stageCancel) return;
      panel.innerHTML = '';
      panel.appendChild(h('div', { class: 'popquiz-title' },
        h('span', { class: 'pq-emoji' }, '✨'),
        h('span', {}, 'Nice! Look once more...')
      ));
      const imgUrl = getVocabImageUrl(word.id);
      if (imgUrl) panel.appendChild(h('div', { class: 'popquiz-img' }, h('img', { src: imgUrl, alt: word.en })));
      panel.appendChild(h('div', { class: 'popquiz-zh' }, word.zh));
      // 应用 phonic 视觉提示(如果有)
      const { letters, hint } = buildPhonicLettersDisplay(word);
      panel.appendChild(letters);
      if (hint) panel.appendChild(hint);
      const wordUrl = resolveQuizAsset('vocab:' + word.id, 'audio') || `./audio/vocab/${word.id}.mp3`;
      playMp3(wordUrl);
      setTimeout(() => {
        if (stageCancel) return;
        testNum = 2;
        wrongAttempts = 0;  // 第 2 测重新计数,给一次机会
        yourTurn();
      }, 3000);
    }

    // 按 PHONIC_RULES 给字母 show 应用视觉提示(silent 字母 dim + 双字母 glow + 文字 hint)
    function buildPhonicLettersDisplay(word) {
      const tag = (window.PHONIC_RULES || {})[word.en.toLowerCase()];
      const letters = h('div', { class: 'pq-letter-show' });
      const en = word.en;
      const spans = [];
      for (let i = 0; i < en.length; i++) {
        const ch = en[i];
        const isLetter = /[a-zA-Z]/.test(ch);
        const s = h('span', { class: 'pq-big-letter pq-said' + (isLetter ? '' : ' pq-punct') }, ch);
        spans.push(s);
        letters.appendChild(s);
      }

      let hintText = '';
      let hintEmoji = '';

      if (tag === 'silentE') {
        // 最后的 e 不发音 · 前面的元音(a/i/o/u)被"解放"变长音
        const lastE = en.toLowerCase().lastIndexOf('e');
        if (lastE >= 0) spans[lastE].classList.add('pq-silent');
        // 前面的 vowel 加 glow
        for (let j = lastE - 1; j >= 0; j--) {
          if (/[aiouAIOU]/.test(en[j])) { spans[j].classList.add('pq-longvowel'); break; }
        }
        hintEmoji = '🤫';
        hintText = '末尾 e 不发音,前面的字母说自己的名字!';
      } else if (tag === 'silentB') {
        const lastB = en.toLowerCase().lastIndexOf('b');
        if (lastB >= 0) spans[lastB].classList.add('pq-silent');
        hintEmoji = '🤫';
        hintText = 'b 不发音!';
      } else if (tag === 'silentW') {
        const w = en.toLowerCase().indexOf('w');
        if (w >= 0) spans[w].classList.add('pq-silent');
        hintEmoji = '🤫';
        hintText = 'w 不发音!';
      } else if (tag === 'doubleLetter') {
        // 找第一对连续同字母
        for (let k = 0; k < en.length - 1; k++) {
          const a = en[k], b = en[k + 1];
          if (a && b && a.toLowerCase() === b.toLowerCase() && /[a-z]/i.test(a)) {
            spans[k].classList.add('pq-double');
            spans[k + 1].classList.add('pq-double');
            break;
          }
        }
        hintEmoji = '🔗';
        hintText = '双字母连起来!';
      }

      let hint = null;
      if (hintText) {
        hint = h('div', { class: 'pq-hint-bubble' },
          h('span', { class: 'pq-hint-emoji' }, hintEmoji),
          h('span', {}, hintText)
        );
      }
      return { letters, hint };
    }

    function showAnswer() {
      panel.innerHTML = '';
      panel.appendChild(h('div', { class: 'popquiz-title' },
        h('span', { class: 'pq-emoji' }, '📖'),
        h('span', {}, 'Remember: ' + word.en)
      ));
      panel.appendChild(h('div', { class: 'popquiz-zh' }, word.zh));
      // 应用 phonic 视觉提示(若有规则)
      const { letters, hint } = buildPhonicLettersDisplay(word);
      panel.appendChild(letters);
      if (hint) panel.appendChild(hint);
      const wordUrl = resolveQuizAsset('vocab:' + word.id, 'audio') || `./audio/vocab/${word.id}.mp3`;
      playMp3(wordUrl);
      const btn = h('button', { class: 'btn btn--lg btn--pink' }, '下次再战!');
      btn.addEventListener('click', () => processResult(false));
      panel.appendChild(h('div', { class: 'pq-actions' }, btn));
    }

    function processResult(ok) {
      // 更新记忆 + 统计
      srsUpdate(word.id, ok);
      if (ok) {
        // 连对计数
        STATE.popStreak = (STATE.popStreak || 0) + 1;
        // 记入已掌握词
        STATE.popWordsKnown = STATE.popWordsKnown || [];
        if (!STATE.popWordsKnown.includes(word.id)) STATE.popWordsKnown.push(word.id);
        // 积分 · 基础 +3
        STATE.score += 3;

        // 连对奖励
        if (STATE.popStreak === 2) {
          STATE.score += 2;
          playTangtang('streak_2');
        } else if (STATE.popStreak === 3) {
          STATE.score += 3;
          playTangtang('streak_3');
        } else if (STATE.popStreak === 5 || (STATE.popStreak > 5 && STATE.popStreak % 5 === 0)) {
          STATE.score += 5;
          playTangtang('streak_5');
        } else {
          playTangtangRandom('correct_');
        }

        // 里程碑
        const n = STATE.popWordsKnown.length;
        STATE.popMilestones = STATE.popMilestones || [];
        const MILES = [10, 30, 50, 100];
        MILES.forEach(m => {
          if (n >= m && !STATE.popMilestones.includes(m)) {
            STATE.popMilestones.push(m);
            STATE.score += m / 2; // 里程碑奖励
            setTimeout(() => playTangtang('mile_' + m), 2500);
          }
        });

        spawnConfetti(Math.min(40, 15 + STATE.popStreak * 3));
      } else {
        STATE.popStreak = 0;
        playTangtangRandom('wrong_');
      }
      saveState();
      renderTopbar();
      // 2 秒后关闭卡片
      setTimeout(() => close(ok), 2000);
    }

    function close(result) {
      stageCancel = true;
      stopAllAudio();
      bd.remove();
      onDone && onDone(result);
    }
  }

  /* ============================================================
   * 🎤 口语练习组件(MediaRecorder + 回放 + 对比)
   * ============================================================
   * 流程:老师读 → 按下录我的 → 听我的 → 对比听 → ✓ 我说对了
   * 完全纯浏览器 API,无需付费评测 key
   * ============================================================ */
  function showVoicePractice(word) {
    if (!word || !word.en) return;
    const bd = h('div', { class: 'modal-backdrop voice-backdrop' });
    const panel = h('div', { class: 'modal voice-panel' });
    bd.appendChild(panel);
    $('#modal-root').appendChild(bd);

    let mediaRecorder = null;
    let recordedBlob = null;
    let recStream = null;
    let chunks = [];
    let recordedUrl = null;
    let recStartMs = 0;
    let playbackAudio = null;  // 独立于 currentAudio,避免被 stopCurrent 误杀

    panel.appendChild(h('div', { class: 'voice-title' }, '🎯 跟我说!'));
    const imgUrl = getVocabImageUrl(word.id);
    if (imgUrl) panel.appendChild(h('div', { class: 'popquiz-img' }, h('img', { src: imgUrl, alt: word.en })));
    panel.appendChild(h('div', { class: 'voice-word' }, word.en));
    panel.appendChild(h('div', { class: 'voice-zh' }, word.zh));
    if (word.ipa) panel.appendChild(h('div', { class: 'voice-ipa' }, word.ipa));

    const actions = h('div', { class: 'voice-actions' });
    const refBtn = h('button', { class: 'btn btn--lg btn--mint' }, '🔊 老师');
    const recBtn = h('button', { class: 'btn btn--xl btn--pink voice-rec-btn' }, '🎤 按住说');
    const playBtn = h('button', { class: 'btn btn--lg' }, '🔊 听我的');
    const compareBtn = h('button', { class: 'btn btn--lg btn--yellow' }, '👂 对比听');
    playBtn.disabled = true;
    compareBtn.disabled = true;

    refBtn.addEventListener('click', () => {
      const url = resolveQuizAsset('vocab:' + word.id, 'audio') || `./audio/vocab/${word.id}.mp3`;
      playMp3(url);
    });

    async function startRecording() {
      try {
        recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        let mt = '';
        for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']) {
          if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) { mt = t; break; }
        }
        mediaRecorder = mt ? new MediaRecorder(recStream, { mimeType: mt }) : new MediaRecorder(recStream);
        mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.onstop = () => {
          const durMs = Date.now() - recStartMs;
          recordedBlob = new Blob(chunks, { type: mediaRecorder.mimeType || mt || 'audio/webm' });
          if (recordedUrl) URL.revokeObjectURL(recordedUrl);
          recordedUrl = URL.createObjectURL(recordedBlob);
          if (recStream) { recStream.getTracks().forEach(t => t.stop()); recStream = null; }
          recBtn.textContent = '🎤 重录';
          recBtn.classList.remove('recording');
          if (recordedBlob.size >= 200) {
            playBtn.disabled = false;
            compareBtn.disabled = false;
            statusEl.textContent = '🎉 录了 ' + (durMs / 1000).toFixed(1) + '秒 · 自动回放中...';
            statusEl.style.color = '#090';
            // 立即自动回放一次 · 孩子一定能听到自己声音
            setTimeout(() => {
              if (playbackAudio) { try { playbackAudio.pause(); } catch(e){} }
              playbackAudio = new Audio(recordedUrl);
              playbackAudio.onended = () => {
                statusEl.textContent = '✅ 听到自己的了吗?再点 "🔊 听我的" 可重播 / "👂 对比听" 跟老师比';
              };
              playbackAudio.onerror = () => {
                statusEl.textContent = '⚠️ 播放失败 · 点 "🔊 听我的" 再试一次';
                statusEl.style.color = '#c40';
              };
              playbackAudio.play().catch(e => {
                statusEl.textContent = '⚠️ 自动播放被浏览器拦截 · 请手动点 "🔊 听我的"';
                statusEl.style.color = '#c80';
              });
            }, 200);
          } else {
            statusEl.textContent = '⚠️ 完全没录到声音(' + recordedBlob.size + 'B)· 请检查麦克风权限';
            statusEl.style.color = '#c40';
            playBtn.disabled = true;
            compareBtn.disabled = true;
          }
        };
        // 每 200ms 收集一次 chunk,避免停止后没数据
        mediaRecorder.start(200);
        recStartMs = Date.now();
        recBtn.textContent = '⏹ 停止';
        recBtn.classList.add('recording');
        statusEl.textContent = '🔴 录音中... 说 "' + word.en + '" 完了再按停止';
        statusEl.style.color = '#c03';
      } catch (e) {
        alert('无法访问麦克风 · 请授权后重试\n\n' + (e.message || e.name || ''));
      }
    }

    function stopRecording() {
      if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
    }

    recBtn.addEventListener('click', () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') stopRecording();
      else startRecording();
    });

    function playMyRecording() {
      if (!recordedUrl) return Promise.resolve();
      if (playbackAudio) { try { playbackAudio.pause(); } catch(e){} }
      playbackAudio = new Audio(recordedUrl);
      return new Promise(res => {
        playbackAudio.onended = res;
        playbackAudio.onerror = (err) => {
          statusEl.textContent = '⚠️ 播放失败 · 浏览器可能不支持此音频格式(' + (mediaRecorder?.mimeType || '?') + ')';
          statusEl.style.color = '#c40';
          res();
        };
        const p = playbackAudio.play();
        if (p && p.catch) p.catch(e => { statusEl.textContent = '⚠️ 播放被阻止: ' + e.name; res(); });
      });
    }

    playBtn.addEventListener('click', async () => {
      statusEl.textContent = '🔊 播放中...';
      statusEl.style.color = '#06a';
      await playMyRecording();
      statusEl.textContent = '✅ 听完了 · 觉得怎样?';
      statusEl.style.color = '#090';
    });

    compareBtn.addEventListener('click', async () => {
      if (!recordedUrl) return;
      const refUrl = resolveQuizAsset('vocab:' + word.id, 'audio') || `./audio/vocab/${word.id}.mp3`;
      statusEl.textContent = '🔊 老师先读...';
      statusEl.style.color = '#06a';
      await playMp3(refUrl);
      await sleep(400);
      statusEl.textContent = '🎤 现在听你的...';
      await playMyRecording();
      statusEl.textContent = '✅ 对比完了 · 像不像?';
      statusEl.style.color = '#090';
    });

    actions.append(refBtn, recBtn, playBtn, compareBtn);
    panel.appendChild(actions);

    const statusEl = h('div', { class: 'voice-status' }, '👆 先点 🔊 听老师,再按 🎤 说一遍');
    panel.appendChild(statusEl);

    const footer = h('div', { class: 'voice-footer' });
    const okBtn = h('button', { class: 'btn btn--lg btn--pink' }, '✓ 我说对了!');
    okBtn.addEventListener('click', () => {
      STATE.score += 2;
      saveState();
      renderTopbar();
      toast('+2 ⭐ 说得棒!');
      close();
    });
    const closeBtn = h('button', { class: 'btn btn--sm' }, '⏭ 跳过');
    closeBtn.addEventListener('click', close);
    footer.append(okBtn, closeBtn);
    panel.appendChild(footer);

    function close() {
      if (mediaRecorder && mediaRecorder.state === 'recording') { try { mediaRecorder.stop(); } catch(e){} }
      if (recStream) recStream.getTracks().forEach(t => t.stop());
      if (playbackAudio) { try { playbackAudio.pause(); } catch(e){} playbackAudio = null; }
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      stopAllAudio();
      bd.remove();
    }
  }

  // 纯单字单词判定:无空格/撇号/句号/逗号,且不是冠词/代词
  function isPureWord(v) {
    if (!v || !v.en || !v.zh) return false;
    const en = v.en.trim();
    if (!/^[a-zA-Z]+$/.test(en)) return false; // 必须只有字母,无标点空格
    if (en.length < 2) return false;
    const STOP = ['the','a','an','is','are','am','they','we','i','you','he','she','it','my','your','his','her','our','and','or','but'];
    return !STOP.includes(en.toLowerCase());
  }

  // 触发点 1：关卡切换时 30% 概率突袭
  function maybeTriggerPopQuizOnStageBreak(callback, currentStageIdx) {
    // Interleaving:在课程中段(关 2→3 和 3→4 过场)稳定插入单词题,
    // 避免 block 式学习(全听、全跟、全填),让单词+句子交错练
    let shouldFire;
    if (currentStageIdx === 1 || currentStageIdx === 2) {
      shouldFire = true;                    // 中段 100% 触发(interleaving 主场)
    } else {
      shouldFire = Math.random() < 0.3;     // 其他过场 30%(保留惊喜感)
    }
    if (!shouldFire) { callback(); return; }
    // 从当前课程句子里抽一个"纯单字"词(排除 I'm sorry 这类短语)
    const candidates = [];
    LESSON.sentences.forEach(s => {
      (s.slots || []).forEach(slot => {
        const v = findVocabByEn(slot.answer);
        if (isPureWord(v)) candidates.push(v);
      });
    });
    if (candidates.length === 0) { callback(); return; }
    const word = candidates[Math.floor(Math.random() * candidates.length)];
    showPopQuiz(word, () => callback());
  }

  // 触发点 2：填空答错时立刻插(只对纯单字词触发)
  function triggerPopQuizAfterFillWrong(wrongWord, callback) {
    const word = typeof wrongWord === 'string' ? findVocabByEn(wrongWord) : wrongWord;
    if (!isPureWord(word)) { callback && callback(); return; }
    setTimeout(() => showPopQuiz(word, () => callback && callback()), 400);
  }

  // 触发点 3：主菜单独立入口(只抽纯单字)
  function renderDailyPopQuiz() {
    const due = srsGetDueWords(20).filter(it => isPureWord(it.word));
    if (due.length >= 5) {
      runDailyPopQuiz(due.slice(0, 5));
    } else {
      const all = (VOCAB.core || []).filter(isPureWord);
      const pool = shuffle(all).slice(0, 5);
      runDailyPopQuiz(pool.map(w => ({ word: w })));
    }
  }
  function runDailyPopQuiz(list) {
    let i = 0;
    function next() {
      if (i >= list.length) {
        toast(`今日突袭完成 ✨ 连对 ${STATE.popStreak}!`);
        goHome();
        return;
      }
      showPopQuiz(list[i].word, () => { i++; next(); });
    }
    next();
  }

  /* ============================================================
   * 13.Y 默写本（听音默写 · 家长协助批改）
   * ============================================================
   * 流程: 选单元 → 抽 N 个词 → 一个个播放 → 孩子在纸上写
   *       → 家长点 ✓/✗ 批改 → 结算页显示对错 + 错的进错题银行
   * ============================================================ */
  function renderDictationPicker() {
    switchScreen('dictation');
    const screen = $('#screen-dictation');
    screen.innerHTML = '';

    const page = h('div', { style: 'max-width: 900px; margin: 0 auto; padding: 20px;' });
    page.appendChild(h('h2', { style: 'text-align: center; margin-bottom: 8px;' }, '✏️ 默写本'));
    page.appendChild(h('p', { style: 'text-align: center; color: var(--ink-light); margin-bottom: 16px;' },
      '大喇叭播放英文 · 孩子本子上写 · 家长点对错'));

    // —— 模式选择 —— 单词 / 句子
    const modeRow = h('div', { style: 'display: flex; gap: 12px; justify-content: center; margin-bottom: 20px;' });
    const modes = [
      { key: 'word',     label: '📖 单词默写', desc: '每单元的核心词'  },
      { key: 'sentence', label: '💬 句子默写', desc: '每单元的课文句'  },
    ];
    const currentMode = STATE._dictMode || 'word';
    modes.forEach(m => {
      const btn = h('button', {
        class: 'btn btn--lg ' + (m.key === currentMode ? 'btn--pink' : ''),
        style: 'display: flex; flex-direction: column; gap: 2px; padding: 12px 24px;',
      },
        h('span', { style: 'font-size: 1.05rem;' }, m.label),
        h('span', { style: 'font-size: 0.8rem; opacity: 0.8;' }, m.desc)
      );
      btn.addEventListener('click', () => {
        STATE._dictMode = m.key;
        renderDictationPicker();
      });
      modeRow.appendChild(btn);
    });
    page.appendChild(modeRow);

    // —— 单元选择 ——
    const unitGrid = h('div', { class: 'menu-grid', style: 'max-width: 900px;' });
    const colors = ['pink','blue','yellow','mint','coral','lavender','peach','sky'];
    UNITS.forEach(u => {
      const items = currentMode === 'word'
        ? VOCAB.core.filter(w => w.unit === u.id)
        : SENTENCES.filter(s => s.unit === u.id);
      const rec = STATE.dictations?.[`${currentMode}_${u.id}`];
      const best = rec ? `最高 ${rec.bestScore}/${rec.lastTotal}` : '未默';
      const tile = h('div', { class: `menu-tile menu-tile--${colors[u.id - 1]}` },
        h('div', { class: 'icon' }, u.emoji),
        h('div', { class: 'title' }, `Unit ${u.id}`),
        h('div', { class: 'sub' }, `${items.length} ${currentMode === 'word' ? '词' : '句'} · ${best}`)
      );
      if (items.length > 0) {
        tile.addEventListener('click', () => startDictation(u.id, currentMode));
      } else {
        tile.style.opacity = 0.5;
      }
      unitGrid.appendChild(tile);
    });
    page.appendChild(unitGrid);

    page.appendChild(h('div', { style: 'text-align: center; margin-top: 20px;' },
      h('button', { class: 'btn btn--sm', onclick: goHome }, '🏠 回主页')
    ));

    screen.appendChild(page);
  }

  const DICTATION = { unit: 0, mode: 'word', items: [], idx: 0, results: {} };

  function startDictation(unit, mode = 'word') {
    const items = mode === 'word'
      ? VOCAB.core.filter(w => w.unit === unit)
      : SENTENCES.filter(s => s.unit === unit);
    if (items.length === 0) { toast('此单元无可默'); return; }
    DICTATION.unit = unit;
    DICTATION.mode = mode;
    DICTATION.items = shuffle(items);
    DICTATION.idx = 0;
    DICTATION.results = {};
    renderDictationRound();
  }

  function renderDictationRound() {
    const screen = $('#screen-dictation');
    screen.innerHTML = '';
    const d = DICTATION;
    if (d.idx >= d.items.length) return finishDictation();
    const it = d.items[d.idx];
    const isSent = d.mode === 'sentence';
    const audioRef = (isSent ? 'sent:' : 'vocab:') + it.id;

    const page = h('div', { style: 'max-width: 760px; margin: 0 auto; padding: 24px; text-align: center;' });

    page.appendChild(h('div', { class: 'chip chip--blue', style: 'margin-bottom: 16px;' },
      `Unit ${d.unit} · ${isSent ? '句子' : '单词'}默写 · 第 ${d.idx + 1} / ${d.items.length}`
    ));

    const bigBox = h('div', { class: 'dictation-stage' });
    const bigBtn = h('button', { class: 'dictation-play' }, '🔊');
    bigBtn.addEventListener('click', () => playQuizAudio(audioRef, bigBtn));
    bigBox.appendChild(bigBtn);
    bigBox.appendChild(h('div', { class: 'dictation-hint' },
      isSent ? '播整句 · 孩子在本子上抄英文(可反复点重播)' : '点按钮听单词 · 孩子在本子上拼写',
      h('br'),
      h('span', { style: 'font-size: 0.85rem; color: var(--ink-light);' },
        '(中文义: 写完后 ↓)')
    ));
    page.appendChild(bigBox);

    const gradeBox = h('div', { class: 'dictation-grade' });
    gradeBox.appendChild(h('h3', {}, '👪 家长核对'));
    const answerEl = h('div', { class: 'dictation-answer' });
    if (isSent) {
      answerEl.append(
        h('div', { style: 'font-size: 1.5rem; font-family: var(--font-en); font-weight: 700; line-height: 1.3;' }, it.en),
        h('div', { style: 'font-size: 1rem; color: var(--ink-light); margin-top: 6px;' }, it.zh)
      );
    } else {
      answerEl.append(
        h('span', { style: 'font-size: 2.4rem; font-family: var(--font-en); font-weight: 700;' }, it.en),
        h('span', { style: 'font-size: 1.1rem; color: var(--ink-light); margin-left: 12px;' },
          `· ${it.zh} ${it.ipa || ''}`)
      );
    }
    gradeBox.appendChild(answerEl);

    const btnRow = h('div', { class: 'dictation-btns' });
    const wrongBtn = h('button', { class: 'btn btn--lg btn--coral' }, '✗ 写错了');
    wrongBtn.addEventListener('click', () => gradeItem(it, false));
    const rightBtn = h('button', { class: 'btn btn--lg btn--mint' }, '✓ 写对了');
    rightBtn.addEventListener('click', () => gradeItem(it, true));
    btnRow.append(wrongBtn, rightBtn);
    gradeBox.appendChild(btnRow);
    page.appendChild(gradeBox);

    page.appendChild(h('div', { style: 'margin-top: 24px;' },
      h('button', { class: 'btn btn--sm', onclick: confirmExitDictation }, '⏸ 退出默写')
    ));

    screen.appendChild(page);
    setTimeout(() => playQuizAudio(audioRef, bigBtn), 400);
  }

  function gradeItem(it, correct) {
    DICTATION.results[it.id] = correct;
    if (correct) {
      markCorrect(it.id);
      spawnConfetti(10);
    } else {
      markWrong(it.id);
    }
    DICTATION.idx++;
    setTimeout(renderDictationRound, 500);
  }

  function confirmExitDictation() {
    const m = modal(h('div', {},
      h('h3', {}, '退出默写？'),
      h('p', {}, '进度不保存。'),
      h('div', { class: 'modal-footer' },
        h('button', { class: 'btn', onclick: () => m.close() }, '继续'),
        h('button', { class: 'btn btn--coral', onclick: () => { m.close(); goHome(); } }, '退出')
      )
    ));
  }

  function finishDictation() {
    const d = DICTATION;
    const correct = Object.values(d.results).filter(x => x).length;
    const total = d.items.length;
    const score = Math.round(correct / total * 100);

    // 存进度 · 按 mode_unit 分别存
    STATE.dictations = STATE.dictations || {};
    const key = `${d.mode}_${d.unit}`;
    const prev = STATE.dictations[key];
    STATE.dictations[key] = {
      bestScore: Math.max(prev?.bestScore || 0, correct),
      lastScore: correct,
      lastTotal: total,
      lastDate:  new Date().toISOString().slice(0, 10),
    };
    let earned = correct * (d.mode === 'sentence' ? 3 : 2);
    if (score >= 90) earned += 3;
    STATE.score += earned;
    saveState();
    renderTopbar();

    const screen = $('#screen-dictation');
    screen.innerHTML = '';
    const page = h('div', { style: 'max-width: 760px; margin: 0 auto; padding: 20px; text-align: center;' });

    const title = score === 100 ? '💯 全对!' : score >= 80 ? '🏆 很棒' : score >= 60 ? '✨ 还行' : '💪 继续练';
    page.appendChild(h('h2', {}, title));
    page.appendChild(h('div', { class: 'big-score', style: 'font-size: 4rem;' }, String(correct)));
    page.appendChild(h('div', {}, `${correct} / ${total} 对 · +${earned} 金币`));

    page.appendChild(h('h3', { style: 'margin-top: 20px;' }, d.mode === 'sentence' ? '📋 句子明细' : '📋 单词明细'));
    const breakdown = h('div', { class: 'dictation-breakdown' });
    d.items.forEach(it => {
      const ok = d.results[it.id];
      breakdown.appendChild(h('div', { class: 'dict-row ' + (ok ? 'ok' : 'no') },
        h('span', { class: 'dict-mark' }, ok ? '✓' : '✗'),
        h('span', { class: 'dict-en' }, it.en),
        h('span', { class: 'dict-zh' }, it.zh)
      ));
    });
    page.appendChild(breakdown);

    page.appendChild(h('div', { class: 'result-actions', style: 'margin-top: 20px;' },
      h('button', { class: 'btn btn--lg btn--pink', onclick: goHome }, '🏠 回主页'),
      h('button', { class: 'btn btn--lg btn--blue', onclick: renderDictationPicker }, '🔁 再默一个单元')
    ));

    screen.appendChild(page);
    if (score >= 80) spawnConfetti(50);
  }

  /* ============================================================
   * 13.Z 错题回顾
   * ============================================================ */
  function renderErrorReview() {
    switchScreen('review');
    const screen = $('#screen-review');
    screen.innerHTML = '';

    const bank = STATE.mistakeBank || {};
    const ids = Object.keys(bank);

    // 包含标题 + 说明 + 列表
    const page = h('div', { class: 'review-page' });
    page.appendChild(h('h2', {}, '🔁 错题回顾'));

    if (ids.length === 0) {
      page.appendChild(h('div', { class: 'review-empty' },
        h('div', { style: 'font-size: 5rem;' }, '✨'),
        h('h3', {}, '没有错题!'),
        h('p', {}, '把课程和测验里做错的题目都会收到这里,一起复习干掉。')
      ));
      page.appendChild(h('button', { class: 'btn btn--lg btn--pink', onclick: goHome }, '🏠 回主页'));
      screen.appendChild(page);
      return;
    }

    // 分类：先按 id 前缀判断是句 / 词 / 字母
    const sentenceItems = [];
    const vocabItems = [];
    ids.forEach(id => {
      const rec = bank[id];
      if (typeof SENTENCES_BY_ID !== 'undefined' && SENTENCES_BY_ID[id]) {
        sentenceItems.push({ id, type: 'sent', data: SENTENCES_BY_ID[id], rec });
      } else if (typeof VOCAB !== 'undefined') {
        const w = [...(VOCAB.core||[]), ...(VOCAB.rhyme||[]), ...(VOCAB.alphabet||[])].find(x => x.id === id);
        if (w) vocabItems.push({ id, type: 'vocab', data: w, rec });
      }
    });

    const summary = h('p', { class: 'review-summary' },
      `共 ${ids.length} 道错题 · ${vocabItems.length} 个单词 + ${sentenceItems.length} 个句子。点 "我会了" 消除。`
    );
    page.appendChild(summary);

    // 操作条
    const controls = h('div', { class: 'review-controls' });
    controls.appendChild(h('button', { class: 'btn btn--lg btn--mint', onclick: startErrorDrill }, '🎯 开始闯关（全部过一遍）'));
    controls.appendChild(h('button', { class: 'btn btn--sm', onclick: confirmClearReview }, '🗑 清空错题'));
    controls.appendChild(h('button', { class: 'btn btn--sm', onclick: goHome }, '🏠 主页'));
    page.appendChild(controls);

    // 列表
    const list = h('div', { class: 'review-list' });
    [...vocabItems, ...sentenceItems].forEach(it => {
      list.appendChild(renderReviewCard(it));
    });
    page.appendChild(list);
    screen.appendChild(page);
  }

  function renderReviewCard(it) {
    const card = h('div', { class: 'review-card' });
    // 缩略图（有图用图，没图用 emoji）
    let thumb = null;
    if (it.type === 'vocab') {
      const url = getVocabImageUrl(it.id);
      if (url) thumb = h('div', { class: 'review-thumb' }, h('img', { src: url, loading: 'lazy' }));
      else thumb = h('div', { class: 'review-thumb review-thumb--emoji' }, it.data.emoji || '📘');
    } else {
      const url = getSentenceImageUrl(it.id);
      if (url) thumb = h('div', { class: 'review-thumb' }, h('img', { src: url, loading: 'lazy' }));
      else thumb = h('div', { class: 'review-thumb review-thumb--emoji' }, '💬');
    }
    card.appendChild(thumb);

    const info = h('div', { class: 'review-info' });
    info.appendChild(h('div', { class: 'review-en' }, it.data.en));
    info.appendChild(h('div', { class: 'review-zh' }, it.data.zh));
    info.appendChild(h('div', { class: 'review-meta' },
      `❌ 错 ${it.rec.wrong} 次 · 上次 ${it.rec.lastWrong || '—'}`
    ));
    card.appendChild(info);

    const actions = h('div', { class: 'review-actions' });
    const playBtn = h('button', { class: 'btn btn--sm btn--pink' }, '🔊 再听');
    playBtn.addEventListener('click', () => {
      const ref = (it.type === 'vocab' ? 'vocab:' : 'sent:') + it.id;
      playQuizAudio(ref, playBtn);
    });
    const knowBtn = h('button', { class: 'btn btn--sm btn--mint' }, '✓ 我会了');
    knowBtn.addEventListener('click', () => {
      // 从错题库移除 + 更新掌握度
      delete STATE.mistakeBank[it.id];
      markCorrect(it.id);
      saveState();
      card.style.opacity = '0.3';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        renderErrorReview();   // 重渲列表
        renderMenu();          // 更新菜单徽章
      }, 300);
    });
    actions.append(playBtn, knowBtn);
    card.appendChild(actions);
    return card;
  }

  function confirmClearReview() {
    const m = modal(h('div', {},
      h('h3', {}, '清空所有错题?'),
      h('p', {}, '会把错题银行全部清零,掌握度不动。'),
      h('div', { class: 'modal-footer' },
        h('button', { class: 'btn', onclick: () => m.close() }, '取消'),
        h('button', { class: 'btn btn--coral', onclick: () => {
          STATE.mistakeBank = {};
          saveState();
          m.close();
          renderErrorReview();
        }}, '清空')
      )
    ));
  }

  // —— 闯关模式：依次过每道题,每道给听 + 选对 / 选错 ——
  function startErrorDrill() {
    const bank = STATE.mistakeBank || {};
    const ids = Object.keys(bank);
    if (!ids.length) { toast('没有错题了'); return; }

    // 收集所有错题，打乱
    const deck = ids.map(id => {
      if (typeof SENTENCES_BY_ID !== 'undefined' && SENTENCES_BY_ID[id]) {
        return { id, type: 'sent', data: SENTENCES_BY_ID[id] };
      }
      const w = [...(VOCAB.core||[]), ...(VOCAB.rhyme||[]), ...(VOCAB.alphabet||[])].find(x => x.id === id);
      if (w) return { id, type: 'vocab', data: w };
      return null;
    }).filter(Boolean).sort(() => Math.random() - 0.5);

    let idx = 0;
    let gotRight = 0;

    function renderCard() {
      if (idx >= deck.length) return finishDrill();
      const screen = $('#screen-review');
      screen.innerHTML = '';
      const it = deck[idx];

      const page = h('div', { class: 'review-page' });
      page.appendChild(h('h2', { style: 'text-align: center;' },
        `🎯 闯关 ${idx + 1} / ${deck.length}`
      ));

      // 大卡片
      const big = h('div', { class: 'drill-card' });
      const url = it.type === 'vocab' ? getVocabImageUrl(it.id) : getSentenceImageUrl(it.id);
      if (url) big.appendChild(h('div', { class: 'drill-img' }, h('img', { src: url, loading: 'lazy' })));
      else     big.appendChild(h('div', { class: 'drill-img drill-img--emoji' }, it.data.emoji || '💬'));
      big.appendChild(h('div', { class: 'drill-en' }, it.data.en));
      big.appendChild(h('div', { class: 'drill-zh' }, it.data.zh));
      page.appendChild(big);

      // 播放按钮
      page.appendChild(h('div', { class: 'drill-play' },
        (() => {
          const b = h('button', { class: 'btn btn--xl btn--pink' }, '🔊 播放原音');
          b.addEventListener('click', () => playQuizAudio((it.type === 'vocab' ? 'vocab:' : 'sent:') + it.id, b));
          return b;
        })()
      ));

      // 判断按钮
      const actions = h('div', { class: 'drill-actions' });
      const stillBtn = h('button', { class: 'btn btn--lg btn--coral' }, '😵 还不会');
      stillBtn.addEventListener('click', () => {
        // 仍然错,增加错次数,进下一道
        const rec = STATE.mistakeBank[it.id] || { wrong: 0 };
        rec.wrong++;
        rec.lastWrong = new Date().toISOString().slice(0, 10);
        STATE.mistakeBank[it.id] = rec;
        saveState();
        idx++;
        renderCard();
      });
      const knowBtn = h('button', { class: 'btn btn--lg btn--mint' }, '✓ 我会了!');
      knowBtn.addEventListener('click', () => {
        delete STATE.mistakeBank[it.id];
        markCorrect(it.id);
        saveState();
        gotRight++;
        spawnConfetti(15);
        idx++;
        setTimeout(renderCard, 400);
      });
      actions.append(stillBtn, knowBtn);
      page.appendChild(actions);

      screen.appendChild(page);
      // 自动播一次
      setTimeout(() => {
        playQuizAudio((it.type === 'vocab' ? 'vocab:' : 'sent:') + it.id);
      }, 400);
    }

    function finishDrill() {
      const screen = $('#screen-review');
      screen.innerHTML = '';
      const page = h('div', { class: 'review-page' });
      page.appendChild(h('h2', {}, '🎉 闯关完成!'));
      page.appendChild(h('div', { class: 'drill-summary' },
        h('div', { style: 'font-size: 4rem;' }, gotRight === deck.length ? '💯' : '⭐'),
        h('p', {}, `消除了 ${gotRight} 道错题`),
        h('p', { style: 'color: var(--ink-light);' }, `剩余 ${Object.keys(STATE.mistakeBank).length} 道`)
      ));
      page.appendChild(h('div', { class: 'drill-actions' },
        h('button', { class: 'btn btn--lg btn--pink', onclick: renderErrorReview }, '📝 返回列表'),
        h('button', { class: 'btn btn--lg btn--blue',  onclick: goHome }, '🏠 主页')
      ));
      if (gotRight > 0) spawnConfetti(40);
      screen.appendChild(page);
    }

    renderCard();
  }

  /* ============================================================
   * 14. 进度看板
   * ============================================================ */
  function renderDashboard() {
    switchScreen('dashboard');
    const screen = $('#screen-dashboard');
    screen.innerHTML = '';

    const completedDays = Object.values(STATE.daily).filter(d => d.completed).length;
    const totalStars = Object.values(STATE.daily).reduce((a, d) => a + (d.stars || 0), 0);

    const body = h('div', { style: 'padding: 24px;' });

    body.appendChild(h('h2', {}, '📊 进度看板'));
    body.appendChild(h('div', { class: 'flex gap-lg flex-wrap', style: 'margin: 24px 0;' },
      h('div', { class: 'card card--pink',   style: 'text-align: center; min-width: 160px;' },
        h('div', { style: 'font-family: var(--font-en); font-size: 3rem; font-weight: 700; line-height: 1;' }, completedDays),
        h('div', { style: 'font-family: var(--font-zh-title); margin-top: 8px;' }, '完成天数')),
      h('div', { class: 'card card--blue',   style: 'text-align: center; min-width: 160px;' },
        h('div', { style: 'font-family: var(--font-en); font-size: 3rem; font-weight: 700; line-height: 1;' }, STATE.score),
        h('div', { style: 'font-family: var(--font-zh-title); margin-top: 8px;' }, '总金币')),
      h('div', { class: 'card card--yellow', style: 'text-align: center; min-width: 160px;' },
        h('div', { style: 'font-family: var(--font-en); font-size: 3rem; font-weight: 700; line-height: 1;' }, STATE.streak || 0),
        h('div', { style: 'font-family: var(--font-zh-title); margin-top: 8px;' }, '连续打卡')),
      h('div', { class: 'card card--mint',   style: 'text-align: center; min-width: 160px;' },
        h('div', { style: 'font-family: var(--font-en); font-size: 3rem; font-weight: 700; line-height: 1;' }, totalStars),
        h('div', { style: 'font-family: var(--font-zh-title); margin-top: 8px;' }, '累计星星'))
    ));

    body.appendChild(h('h3', { style: 'margin-top: 24px;' }, '每日闯关'));
    const dayGrid = h('div', { class: 'flex gap-sm flex-wrap', style: 'margin-top: 12px;' });
    for (let d = 1; d <= 19; d++) {
      const rec = STATE.daily[d];
      const cls = rec?.completed ? 'menu-tile--mint' : 'menu-tile--peach';
      const emoji = rec?.completed ? '⭐'.repeat(rec.stars || 1) : '💤';
      const tile = h('div', {
        class: `menu-tile ${cls}`,
        style: 'min-height: 80px; padding: 12px;'
      },
        h('div', { style: 'font-size: 1.5rem;' }, emoji),
        h('div', { style: 'font-family: var(--font-en); font-weight: 700;' }, 'Day ' + d)
      );
      tile.addEventListener('click', () => { setDay(d); goHome(); });
      dayGrid.appendChild(tile);
    }
    body.appendChild(dayGrid);

    body.appendChild(h('h3', { style: 'margin-top: 24px;' }, '单元测验成绩'));
    const unitRow = h('div', { class: 'glossary-grid', style: 'margin-top: 12px;' });
    UNITS.forEach(u => {
      const rec = STATE.unitTests?.[u.id];
      unitRow.appendChild(h('div', { class: 'glossary-item' },
        h('div', { class: 'row1' },
          h('span', { class: 'g-emoji' }, u.emoji),
          h('span', { class: 'g-en' }, 'Unit ' + u.id)
        ),
        h('div', { class: 'g-zh' }, u.titleZh),
        h('div', { style: 'font-family: var(--font-en); font-size: 1.4rem; color: var(--ink); margin-top: 4px;' },
          rec ? `${rec.bestScore} 分` : '—')
      ));
    });
    body.appendChild(unitRow);

    body.appendChild(h('div', { style: 'margin-top: 32px; text-align: center;' },
      h('button', { class: 'btn btn--coral btn--sm', onclick: () => {
        if (confirm('清空所有进度？（金币、星星、测验成绩将全部消失）')) {
          resetState();
          renderTopbar();
          renderDashboard();
          toast('进度已清空');
        }
      }}, '🗑 清空进度')
    ));

    screen.appendChild(body);
  }

  /* ============================================================
   * 15. Day 切换 & 顶栏
   * ============================================================ */
  function renderTopbar() {
    $('#day-num').textContent = 'Day ' + STATE.currentDay;
    $('#score-badge').textContent = '⭐ ' + STATE.score;
  }

  function setDay(n) {
    n = Math.max(CONFIG.MIN_DAY, Math.min(CONFIG.MAX_DAY, n));
    if (n === STATE.currentDay) return;
    STATE.currentDay = n;
    saveState();
    renderTopbar();
    if (currentScreen === 'menu') renderMenu();
  }

  function bindTopbar() {
    $('#btn-day-prev').addEventListener('click', () => setDay(STATE.currentDay - 1));
    $('#btn-day-next').addEventListener('click', () => setDay(STATE.currentDay + 1));
    $('#day-num').addEventListener('click', showDayPicker);
    $('#btn-home').addEventListener('click', goHome);
    // 长按 logo 显示视口信息（开发调试用）
    const logo = $('.topbar .logo');
    if (logo) {
      let pressTimer = null;
      const start = () => {
        pressTimer = setTimeout(showViewportInfo, 600);
      };
      const cancel = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } };
      logo.addEventListener('touchstart', start, { passive: true });
      logo.addEventListener('mousedown',  start);
      logo.addEventListener('touchend',   cancel);
      logo.addEventListener('touchcancel', cancel);
      logo.addEventListener('mouseup',    cancel);
      logo.addEventListener('mouseleave', cancel);
    }
  }

  function showViewportInfo() {
    const info = {
      'CSS 视口宽 × 高': `${window.innerWidth} × ${window.innerHeight}`,
      '屏幕宽 × 高':    `${screen.width} × ${screen.height}`,
      'DPR(像素比)':    window.devicePixelRatio,
      '方向':           window.innerWidth > window.innerHeight ? '横屏' : '竖屏',
      'User Agent':     navigator.userAgent,
    };
    const rows = Object.entries(info).map(([k, v]) =>
      h('div', { style: 'display: flex; gap: 12px; margin: 6px 0;' },
        h('span', { style: 'font-weight: 600; min-width: 130px;' }, k),
        h('span', { style: 'font-family: var(--font-en); word-break: break-all;' }, String(v))
      )
    );
    const m = modal(h('div', {},
      h('h3', {}, '📏 视口信息'),
      h('div', { style: 'font-family: var(--font-zh-body); font-size: 0.95rem;' }, ...rows),
      h('p', { style: 'font-size: 0.85rem; color: var(--ink-light); margin-top: 12px;' },
        '截图发给开发者,我按这个尺寸调布局'),
      h('div', { class: 'modal-footer' },
        h('button', { class: 'btn btn--pink', onclick: () => m.close() }, '关闭')
      )
    ));
  }

  function showDayPicker() {
    const grid = h('div', { class: 'flex flex-wrap gap-sm', style: 'margin: 16px 0; max-width: 420px;' });
    for (let d = CONFIG.MIN_DAY; d <= CONFIG.MAX_DAY; d++) {
      const isCur = d === STATE.currentDay;
      const b = h('button', {
        class: `btn btn--sm ${isCur ? 'btn--pink' : ''}`,
        style: 'min-width: 64px;'
      }, 'Day ' + d);
      b.addEventListener('click', () => { setDay(d); m.close(); });
      grid.appendChild(b);
    }
    const body = h('div', {},
      h('h3', {}, '跳转到哪一天？'),
      grid,
      h('div', { class: 'modal-footer' },
        h('button', { class: 'btn', onclick: () => m.close() }, '取消')
      )
    );
    const m = modal(body);
  }

  /* ============================================================
   * 16. 占位屏幕（默写 / 打印）
   * ============================================================ */
  /* ============================================================
   * 16.5 打印中心（A4 词卡 / 默写表 / 模拟试卷）
   * ============================================================ */
  function renderPrintCenter() {
    switchScreen('print');
    const screen = $('#screen-print');
    screen.innerHTML = '';

    const page = h('div', { style: 'max-width: 900px; margin: 0 auto; padding: 20px;' });
    page.appendChild(h('h2', { style: 'text-align: center;' }, '🖨️ 打印中心'));
    page.appendChild(h('p', { style: 'text-align: center; color: var(--ink-light); margin-bottom: 24px;' },
      '选类型 + 选单元,点"打印/另存 PDF",按 Ctrl+P / 三指下滑截图'
    ));

    // 模板选择
    const templates = [
      { id: 'flashcards', title: '📇 词卡', desc: '每单元 8 词/张 · 图+英+中',     render: renderPrintFlashcards },
      { id: 'dictation',  title: '✏️ 默写表', desc: '听音默写 · 大空格 · 家长批改栏', render: renderPrintDictation },
      { id: 'quiz',       title: '📝 模拟试卷', desc: '仿真考卷 · 12 大题 · 可打印',  render: renderPrintQuiz },
      { id: 'errors',     title: '🔁 错题集',   desc: '当前错题汇总 · 带答案',        render: renderPrintErrors },
    ];
    const grid = h('div', { style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;' });
    templates.forEach(t => {
      const card = h('div', { class: 'menu-tile menu-tile--sky', style: 'min-height: 120px; cursor: pointer;' },
        h('div', { class: 'title' }, t.title),
        h('div', { class: 'sub' }, t.desc)
      );
      card.addEventListener('click', () => openPrintUnitPicker(t));
      grid.appendChild(card);
    });
    page.appendChild(grid);

    page.appendChild(h('div', { style: 'text-align: center;' },
      h('button', { class: 'btn btn--sm', onclick: goHome }, '🏠 回主页')
    ));
    screen.appendChild(page);
  }

  function openPrintUnitPicker(template) {
    const m = modal(h('div', {},
      h('h3', {}, `${template.title} · 选单元`),
      (() => {
        const grid = h('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 16px 0;' });
        UNITS.forEach(u => {
          const b = h('button', { class: 'btn btn--sm' }, `U${u.id} ${u.emoji}`);
          b.addEventListener('click', () => {
            m.close();
            template.render(u.id);
          });
          grid.appendChild(b);
        });
        // 错题集不按单元
        if (template.id === 'errors') {
          grid.querySelectorAll('button').forEach(b => { b.disabled = true; b.style.opacity = 0.5; });
          const allBtn = h('button', { class: 'btn btn--lg btn--pink', style: 'grid-column: span 4;', onclick: () => { m.close(); template.render(null); } }, '📋 生成错题表');
          grid.appendChild(allBtn);
        }
        return grid;
      })(),
      h('div', { class: 'modal-footer' }, h('button', { class: 'btn', onclick: () => m.close() }, '取消'))
    ));
  }

  // —— 打印通用页（打印按钮 + 返回按钮 + A4 内容区） ——
  function printWrap(bodyNode, title) {
    const screen = $('#screen-print');
    screen.innerHTML = '';
    const page = h('div', { class: 'print-page' });

    const toolbar = h('div', { class: 'print-toolbar no-print' },
      h('button', { class: 'btn btn--sm', onclick: renderPrintCenter }, '‹ 换模板'),
      h('h3', { style: 'flex: 1; text-align: center; margin: 0;' }, title),
      h('button', { class: 'btn btn--lg btn--pink', onclick: () => window.print() }, '🖨️ 打印 / 保存 PDF')
    );
    page.appendChild(toolbar);
    page.appendChild(h('div', { class: 'print-sheet' }, bodyNode));
    screen.appendChild(page);
  }

  // —— 模板 1: 词卡 (8 张/页,A4) ——
  function renderPrintFlashcards(unit) {
    const words = VOCAB.core.filter(w => w.unit === unit);
    if (words.length === 0) { toast('此单元无词'); return; }
    const sheet = h('div', { class: 'print-flashcards' });
    words.forEach(w => {
      const img = getVocabImageUrl(w.id);
      const card = h('div', { class: 'pf-card' },
        img ? h('img', { src: img, loading: 'lazy' }) : h('div', { class: 'pf-emoji' }, w.emoji || '📘'),
        h('div', { class: 'pf-en' }, w.en),
        h('div', { class: 'pf-zh' }, w.zh)
      );
      sheet.appendChild(card);
    });
    printWrap(sheet, `Unit ${unit} · 词卡 · ${words.length} 词`);
  }

  // —— 模板 2: 默写表 ——
  function renderPrintDictation(unit) {
    const words = VOCAB.core.filter(w => w.unit === unit);
    const body = h('div', { class: 'print-dictation' });
    body.appendChild(h('h2', { class: 'pd-title' }, `Unit ${unit} · 默写本`));
    body.appendChild(h('div', { class: 'pd-meta' },
      h('span', {}, '姓名：________________'),
      h('span', {}, '日期：________________'),
      h('span', {}, '得分：_______ / ' + words.length)
    ));
    const table = h('table', { class: 'pd-table' });
    const thead = h('tr', {},
      h('th', { style: 'width: 40px;' }, '#'),
      h('th', { style: 'width: 120px;' }, '中文'),
      h('th', {}, '英文(请默写)'),
      h('th', { style: 'width: 50px;' }, '对/错')
    );
    table.appendChild(thead);
    words.forEach((w, i) => {
      table.appendChild(h('tr', {},
        h('td', {}, String(i + 1)),
        h('td', {}, w.zh),
        h('td', { class: 'pd-blank' }, ' '),
        h('td', {}, ' ')
      ));
    });
    body.appendChild(table);
    body.appendChild(h('p', { class: 'pd-tip no-print' },
      '💡 家长提示:先在 App 默写本模式播音,孩子在此纸上默写,最后对照本单元词库核对。'
    ));
    printWrap(body, `Unit ${unit} · 默写表`);
  }

  // —— 模板 3: 模拟试卷 (A4 · 12 大题笔试版，听力用音频 ID 标注) ——
  function renderPrintQuiz(unit) {
    if (typeof QUIZ_BANKS === 'undefined' || !QUIZ_BANKS[unit]) {
      toast('此单元题库待建'); return;
    }
    const paper = generateQuizPaper(unit);
    const body = h('div', { class: 'print-quiz' });
    body.appendChild(h('h2', { class: 'pq-title' }, `${paper.title} · 单元测试卷`));
    body.appendChild(h('div', { class: 'pq-meta' },
      h('span', {}, '姓名：________________'),
      h('span', {}, '班级：________________'),
      h('span', {}, '得分：_______ / 100')
    ));

    paper.sections.forEach(sec => {
      const s = h('div', { class: 'pq-section' });
      s.appendChild(h('h3', {}, sec.title + ` (共 ${sec.items.length * sec.pointsPerItem} 分)`));
      if (sec.hint) s.appendChild(h('p', { class: 'pq-hint' }, sec.hint));

      const type = sec.type;
      if (type === 'listen-choose' || type === 'listen-response') {
        sec.items.forEach((item, i) => {
          s.appendChild(h('div', { class: 'pq-item' },
            `${i + 1}. (  ) `,
            (item.options || []).map((opt, j) =>
              h('span', { class: 'pq-opt' }, `${String.fromCharCode(65 + j)}. ${opt}`)
            )
          ));
        });
      } else if (type === 'listen-judge' || type === 'pic-judge') {
        // 有图显示图 · 每道题一行:图 + 英文(pic-judge) / 图(listen-judge 不含文字) + 判断括号
        const row = h('div', { class: 'pq-judge-row' });
        sec.items.forEach((item, i) => {
          const cell = h('div', { class: 'pq-judge-cell' });
          cell.appendChild(h('div', { class: 'pq-judge-num' }, `${i + 1}.`));
          const imgUrl = resolveQuizAsset(item.image, 'image');
          if (imgUrl) {
            cell.appendChild(h('img', { src: imgUrl, class: 'pq-judge-img' }));
          }
          if (item.text) {
            cell.appendChild(h('div', { class: 'pq-judge-text' }, item.text));
          }
          cell.appendChild(h('div', { class: 'pq-judge-box' }, '(   )'));
          row.appendChild(cell);
        });
        s.appendChild(row);
      } else if (type === 'odd-one-out') {
        sec.items.forEach((item, i) => {
          s.appendChild(h('div', { class: 'pq-item' },
            `${i + 1}. (  ) `,
            (item.items || []).map((x, j) =>
              h('span', { class: 'pq-opt' }, `${String.fromCharCode(65 + j)}. ${x}`)
            )
          ));
        });
      } else if (type === 'scenario') {
        sec.items.forEach((item, i) => {
          s.appendChild(h('div', { class: 'pq-item' },
            `${i + 1}. ${item.scene}(  )`,
            h('div', { style: 'margin-left: 20px;' },
              (item.options || []).map((opt, j) =>
                h('span', { class: 'pq-opt' }, `${String.fromCharCode(65 + j)}. ${opt}`)
              )
            )
          ));
        });
      } else if (type === 'letter-neighbor') {
        sec.items.forEach((item, i) => {
          s.appendChild(h('div', { class: 'pq-item' },
            `${i + 1}. ____  ${item.letter}  ____`
          ));
        });
      } else if (type === 'match-columns') {
        const item = sec.items[0];
        if (item) {
          const pairsTable = h('table', { class: 'pq-match' });
          const aShuffle = item.pairs.map((_, i) => i).sort(() => Math.random() - 0.5);
          item.pairs.forEach((p, i) => {
            pairsTable.appendChild(h('tr', {},
              h('td', {}, `${String.fromCharCode(65 + i)}. ${p.q}`),
              h('td', { style: 'width: 40px; text-align: center;' }, '____'),
              h('td', {}, `${String.fromCharCode(97 + i)}. ${item.pairs[aShuffle[i]].a}`)
            ));
          });
          s.appendChild(pairsTable);
        }
      } else if (type === 'dialog-fill' || type === 'listen-fill') {
        const item = sec.items[0];
        if (item) {
          if (item.pool) {
            s.appendChild(h('div', { class: 'pq-pool' },
              '词库: ' + item.pool.join(' / ')
            ));
          }
          item.dialog.forEach(line => {
            let text = line.speaker + ': ';
            line.parts.forEach(p => { text += p.t || '______'; });
            s.appendChild(h('div', { class: 'pq-item' }, text));
          });
        }
      } else if (type === 'listen-order') {
        const item = sec.items[0];
        if (item) {
          const grid = h('div', { class: 'pq-order-grid' });
          item.images.forEach((imgRef, idx) => {
            const cell = h('div', { class: 'pq-order-cell' });
            const imgUrl = resolveQuizAsset(imgRef, 'image');
            if (imgUrl) cell.appendChild(h('img', { src: imgUrl, class: 'pq-order-img' }));
            cell.appendChild(h('div', { class: 'pq-order-num-box' }, '(   )'));
            grid.appendChild(cell);
          });
          s.appendChild(grid);
        }
      }

      body.appendChild(s);
    });

    printWrap(body, `${paper.title} · 试卷`);
  }

  // —— 模板 4: 错题集 ——
  function renderPrintErrors() {
    const bank = STATE.mistakeBank || {};
    const ids = Object.keys(bank);
    const body = h('div', { class: 'print-errors' });
    body.appendChild(h('h2', { class: 'pe-title' }, '🔁 我的错题集'));
    body.appendChild(h('div', { class: 'pd-meta' },
      h('span', {}, `共 ${ids.length} 题`),
      h('span', {}, '日期：' + new Date().toISOString().slice(0, 10))
    ));
    if (ids.length === 0) {
      body.appendChild(h('p', { style: 'text-align: center; margin-top: 40px;' }, '✨ 没有错题,继续保持!'));
      printWrap(body, '错题集');
      return;
    }
    const table = h('table', { class: 'pe-table' });
    table.appendChild(h('tr', {},
      h('th', { style: 'width: 40px;' }, '#'),
      h('th', {}, '英文'),
      h('th', {}, '中文'),
      h('th', { style: 'width: 60px;' }, '错次')
    ));
    let i = 1;
    ids.forEach(id => {
      const rec = bank[id];
      let en = id, zh = '';
      if (typeof SENTENCES_BY_ID !== 'undefined' && SENTENCES_BY_ID[id]) {
        en = SENTENCES_BY_ID[id].en; zh = SENTENCES_BY_ID[id].zh;
      } else if (typeof VOCAB !== 'undefined') {
        const w = [...(VOCAB.core||[]), ...(VOCAB.rhyme||[]), ...(VOCAB.alphabet||[])].find(x => x.id === id);
        if (w) { en = w.en; zh = w.zh; }
      }
      table.appendChild(h('tr', {},
        h('td', {}, String(i++)),
        h('td', {}, en),
        h('td', {}, zh),
        h('td', {}, '❌ ' + rec.wrong)
      ));
    });
    body.appendChild(table);
    printWrap(body, '错题集');
  }

  function renderStub(screenName, title, desc) {
    switchScreen(screenName);
    const s = document.getElementById('screen-' + screenName);
    s.innerHTML = '';
    s.appendChild(h('div', { style: 'padding: 48px; text-align: center;' },
      h('div', { style: 'font-size: 6rem; margin-bottom: 16px;' }, '🚧'),
      h('h2', {}, title),
      h('p', { style: 'font-family: var(--font-zh-body); color: var(--ink-light); font-size: 1.2rem;' }, desc),
      h('p', { style: 'font-family: var(--font-zh-body); color: var(--ink-light); margin-top: 8px;' }, 'Phase 2 即将上线'),
      h('button', { class: 'btn btn--pink', style: 'margin-top: 24px;', onclick: goHome }, '🏠 回主页')
    ));
  }

  /* ============================================================
   * 17. 启动
   * ============================================================ */
  function init() {
    loadState();
    initTTS();
    loadAudioManifest();    // 异步加载 MP3 清单（不阻塞启动）
    loadImageManifest();    // 异步加载图片清单
    loadTangtangManifest(); // 糖糖姐奖励 + 拼读三连
    bindTopbar();
    renderTopbar();
    switchScreen('menu');
    renderMenu();
    // 淡出 splash + 欢迎气泡(不自动播音,等首次点击解锁)
    setTimeout(() => {
      const s = $('#loading-splash');
      if (s) {
        s.classList.add('fade-out');
        setTimeout(() => s.remove(), 500);
      }
      setCoachMode('greeting');
      const greetLine = showCoach('greeting', { day: STATE.currentDay }, { duration: 6000, speak: false });

      // 浏览器 autoplay 政策 → 页面加载时不能播音。等用户第一次点屏幕解锁后再播招呼。
      let unlocked = false;
      function unlockAndSpeak() {
        if (unlocked) return;
        unlocked = true;
        document.removeEventListener('click',      unlockAndSpeak, true);
        document.removeEventListener('touchstart', unlockAndSpeak, true);
        if (greetLine && greetLine.en) {
          setTimeout(() => speakAsCoach(greetLine.en, { coachLineRaw: greetLine._raw }), 200);
        }
      }
      document.addEventListener('click',      unlockAndSpeak, true);
      document.addEventListener('touchstart', unlockAndSpeak, true);
    }, 300);
    console.log(`[App] 启动完成 · Day ${STATE.currentDay} · Score ${STATE.score} · Voice: ${ttsVoice?.name || '(none)'}`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 开发调试用（生产可删）
  window.__ENG = {
    get STATE() { return STATE; },
    resetState, setDay, goHome, startLesson, saveState,
    renderQuizPicker, startQuizSession,
  };
})();
