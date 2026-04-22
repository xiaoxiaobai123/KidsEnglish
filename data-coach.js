/* ================================================================
 * data-coach.js
 * Cory 教练的台词库（英文优先 + 中文备注）
 * ----------------------------------------------------------------
 * Cory 是本 App 的虚拟英语伙伴。所有台词都是「课文内词 + 1~2 个新词」，
 * 用语气和语境让孩子猜新词意思（i+1 输入假设）。
 *
 * 使用：COACH.line('correct', { name: 'Kele' })
 *       → 随机挑一句 + 占位符替换
 *
 * 占位符：
 *   {name}   孩子名字（默认 Kele）
 *   {coach}  教练名字（默认 Cory）
 *   {stars}  星星数
 *   {day}    天数
 * ================================================================ */

const COACH = {
  /* ---------- 默认配置 ---------- */
  meta: {
    defaultName:   'Cory',
    defaultAvatar: '🐱',  // Cat 教练（emoji 配合名字）
    defaultCoachName: 'Cat',
  },

  /* ---------- 台词池（按场景 key 分组）
   * 用词原则：一年级孩子已学过的词为主（look/like/have/do/go/see/
   * big/small/red/yes/no/good/nice 等），新词用重复+语气让孩子猜。
   * ---------- */
  lines: {
    /* 1. 进入主菜单 */
    greeting: [
      { en: "Hi {name}!",                                     zh: "嗨，{name}！" },
      { en: "Hi {name}! I'm {coach}.",                        zh: "嗨 {name}！我是 {coach}。" },
      { en: "Hello {name}! Let's play!",                      zh: "你好 {name}！我们玩吧！" },
      { en: "Welcome back, {name}!",                          zh: "欢迎回来，{name}！" },
      { en: "Day {day}! Let's go!",                           zh: "第 {day} 天！出发！" },
      { en: "Hey {name}! It's me, {coach}!",                  zh: "嘿 {name}！是我，{coach}！" },
      { en: "Good to see you!",                               zh: "见到你真好！" },
      { en: "Are you ready, {name}?",                         zh: "{name}，准备好了吗？" },
      { en: "Meow! Hi {name}!",                               zh: "喵！嗨 {name}！" },
    ],

    /* 2. 开始今日课程 */
    lessonStart: [
      { en: "Let's start!",                                   zh: "开始吧！" },
      { en: "Open your ears! Here we go!",                    zh: "竖起耳朵！出发！" },
      { en: "New words today! Fun fun fun!",                  zh: "今天学新词！好玩！" },
      { en: "Look and listen, {name}!",                       zh: "看和听，{name}！" },
      { en: "You can do it, {name}!",                         zh: "你可以的，{name}！" },
    ],

    /* 3. 关 1 · 听一听 */
    beforeListen: [
      { en: "Just listen. No talking!",                       zh: "只听。不说话！" },
      { en: "Big ears! Listen!",                              zh: "大耳朵！听！" },
      { en: "Shh! Ears on!",                                  zh: "嘘！打开耳朵！" },
      { en: "Listen to me, {name}.",                          zh: "听我说，{name}。" },
    ],

    /* 4. 关 2 · 跟一跟 */
    beforeFollow: [
      { en: "Your turn! Say it!",                             zh: "到你了！说！" },
      { en: "Big voice! Say after me!",                       zh: "大声跟我说！" },
      { en: "Copy me, {name}!",                               zh: "跟我读，{name}！" },
      { en: "Open your mouth! Speak up!",                     zh: "张嘴！大声说！" },
    ],

    /* 5. 关 3 · 填一填 */
    beforeFill: [
      { en: "Which word? Tap it!",                            zh: "哪个词？点一下！" },
      { en: "Think and tap!",                                 zh: "想一想，点！" },
      { en: "Pick the right one!",                            zh: "选对的那个！" },
      { en: "Look! Find the word!",                           zh: "看！找那个词！" },
    ],

    /* 6. 关 4 · 背一背 */
    beforeMemorize: [
      { en: "Look at the picture! Say it all!",               zh: "看图！说整句！" },
      { en: "No peek! Say it!",                               zh: "不许偷看！说！" },
      { en: "You know this one!",                             zh: "你会的！" },
      { en: "Try, {name}! You can!",                          zh: "试试，{name}！你可以！" },
    ],

    /* 7. 关 5 · 换一换 */
    beforeSwap: [
      { en: "Make new ones! Have fun!",                       zh: "造新的！好玩！" },
      { en: "Mix the words! Make three!",                     zh: "混搭词语！造三个！" },
      { en: "Now you are the teacher!",                       zh: "现在你是老师！" },
      { en: "Your turn, {name}! Play with words!",            zh: "到你了 {name}！玩词！" },
    ],

    /* 8. 答对 */
    correct: [
      { en: "Yes! Good!",                         zh: "对！好！" },
      { en: "Yes! Good job!",                     zh: "对！干得好！" },
      { en: "Cool, {name}!",                      zh: "酷，{name}！" },
      { en: "Wow! Yes!",                          zh: "哇！对！" },
      { en: "Good! Good! Good!",                  zh: "好！好！好！" },
      { en: "You got it!",                        zh: "你答对了！" },
      { en: "Yes! High five!",                    zh: "对！击掌！" },
      { en: "Right!",                             zh: "对！" },
      { en: "Nice one, {name}!",                  zh: "棒 {name}！" },
      { en: "Yay!",                               zh: "耶！" },
      { en: "Meow! Yes!",                         zh: "喵！对！" },
    ],

    /* 9. 答错 */
    wrong: [
      { en: "Oops! Try again!",                   zh: "哎呀！再试一次！" },
      { en: "No, try again.",                     zh: "不对，再来。" },
      { en: "Listen and try, {name}.",            zh: "听一遍再试，{name}。" },
      { en: "Not yet. One more!",                 zh: "还不对。再来！" },
      { en: "It's okay. Try.",                    zh: "没关系，试试。" },
      { en: "Hmm... one more try!",               zh: "嗯…再试一次！" },
    ],

    /* 10. 连对（2+） */
    streak: [
      { en: "Two! Wow!",                          zh: "连两个！哇！" },
      { en: "Three in a row! Cool!",              zh: "连三个！酷！" },
      { en: "So good! Keep it up!",               zh: "真好！继续！" },
      { en: "Hot hot hot! Go!",                   zh: "热热热！加油！" },
    ],

    /* 11. 句子切换 */
    nextSentence: [
      { en: "Next one!",                          zh: "下一句！" },
      { en: "OK, new one!",                       zh: "好，新的！" },
      { en: "More, more!",                        zh: "再来！" },
    ],

    /* 12. 关卡完成 */
    stageDone: [
      { en: "Done! Good job!",                    zh: "完成！好样的！" },
      { en: "You rock, {name}!",                  zh: "你最棒 {name}！" },
      { en: "Nice work! Next!",                   zh: "干得好！下一关！" },
      { en: "Yay! Go on!",                        zh: "耶！继续！" },
    ],

    /* 13. 全部课程完成（结算页） */
    lessonComplete: [
      { en: "Yay! Day {day} done!",                         zh: "耶！第 {day} 天完成！" },
      { en: "{stars} stars! Super!",                        zh: "{stars} 颗星！超棒！" },
      { en: "Super job, {name}!",                           zh: "太棒了 {name}！" },
      { en: "All done! High five!",                         zh: "全部完成！击掌！" },
      { en: "Good boy, {name}! I love it!",                 zh: "好孩子 {name}！我喜欢！" },
    ],

    /* 14. 鼓励（空闲/提示时） */
    encourage: [
      { en: "You can do it, {name}!",             zh: "你可以的 {name}！" },
      { en: "Slow and nice.",                     zh: "慢慢来，很棒。" },
      { en: "Speak! Don't be shy!",               zh: "说！别害羞！" },
      { en: "One more try, {name}!",              zh: "再试一次 {name}！" },
    ],

    /* 15. 开始某一句（跟读/背诵前） */
    beforeSentence: [
      { en: "Here we go!",                        zh: "来吧！" },
      { en: "Look and listen.",                   zh: "看和听。" },
      { en: "Easy one! Watch me!",                zh: "这个简单！看我！" },
      { en: "Ready?",                             zh: "准备好？" },
    ],

    /* 16. 造句成功（换一换） */
    swapSuccess: [
      { en: "Cool! You made it!",                 zh: "酷！你造出来了！" },
      { en: "Nice, {name}! One more!",            zh: "棒 {name}！再来一句！" },
      { en: "Good one! Make more!",               zh: "好句子！再多造几句！" },
      { en: "Yes! Your sentence is cool!",        zh: "对！你的句子很酷！" },
    ],

    /* 17. 突袭拼写 · 开场(hyped) */
    popIntro: [
      { en: "Pop quiz time! Let's spell it!",                 zh: "突袭拼写！一起拼！" },
      { en: "Surprise! Spelling time!",                       zh: "惊喜！拼写时间！" },
      { en: "Whoa! Spelling battle, {name}!",                 zh: "哇哦！拼写大战 {name}！" },
      { en: "Pop quiz! Are you ready?",                       zh: "突袭测验！准备好了吗？" },
      { en: "New challenge! Can you spell it?",               zh: "新挑战！你能拼出来吗？" },
      { en: "Here it comes! Spell with me!",                  zh: "来啦！跟我一起拼！" },
    ],

    /* 18. 突袭拼写 · 示范开始 */
    popDemo: [
      { en: "Watch me! Here we go!",                          zh: "看我的！开始！" },
      { en: "Listen and look, {name}!",                       zh: "听和看 {name}！" },
      { en: "Watch carefully!",                               zh: "看仔细哦！" },
      { en: "Check this out! Ready?",                         zh: "看这个！准备好了？" },
      { en: "Look! Letter by letter!",                        zh: "看！一个字母一个字母！" },
    ],

    /* 19. 突袭拼写 · 你来拼 */
    popYourTurn: [
      { en: "Now YOU try, {name}!",                           zh: "该你了 {name}！" },
      { en: "Your turn, superstar!",                          zh: "你来，小明星！" },
      { en: "You got this! Go for it!",                       zh: "你可以的！冲！" },
      { en: "I believe in you!",                              zh: "我相信你！" },
      { en: "Can you do it? Yes you can!",                    zh: "你行吗？你当然行！" },
      { en: "Your turn! Spell it!",                           zh: "你来拼！" },
    ],

    /* 20. 突袭拼写 · 夸奖(!!!最多变种!!!) */
    popPraise: [
      { en: "YES! Amazing, {name}!",                          zh: "棒！太棒了 {name}！" },
      { en: "Wow! You did it!",                               zh: "哇！你做到了！" },
      { en: "Awesome job!",                                   zh: "干得漂亮！" },
      { en: "Perfect! High five!",                            zh: "完美！击掌！" },
      { en: "You're a champion, {name}!",                     zh: "你是冠军 {name}！" },
      { en: "Incredible! Bravo!",                             zh: "不可思议！太棒了！" },
      { en: "Fantastic!",                                     zh: "太厉害了！" },
      { en: "Superstar! You rock!",                           zh: "小明星！你真行！" },
      { en: "Whoa! So good!",                                 zh: "哇！太好了！" },
      { en: "Nailed it!",                                     zh: "搞定啦！" },
      { en: "You're on fire, {name}!",                        zh: "你太火了 {name}！" },
      { en: "Woohoo! That's right!",                          zh: "耶！对啦！" },
      { en: "Brilliant! Keep going!",                         zh: "聪明！继续！" },
      { en: "Way to go, {name}!",                             zh: "{name}，干得好！" },
      { en: "Yes yes yes! Spelling king!",                    zh: "对对对！拼写王！" },
    ],

    /* 21. 突袭拼写 · 快到了,温柔再试 */
    popAlmost: [
      { en: "Almost! Try again!",                             zh: "就差一点！再来！" },
      { en: "So close! One more time!",                       zh: "很接近！再一次！" },
      { en: "Don't give up! You can do it!",                  zh: "别放弃！你可以的！" },
      { en: "Keep trying, {name}! I'm with you!",             zh: "继续 {name}！我陪着你！" },
      { en: "Oops! Let's do it together!",                    zh: "哎呀！我们一起来！" },
    ],

    /* 22. 突袭拼写 · 连对庆祝 */
    popStreak: [
      { en: "Two in a row! Wow!",                             zh: "连对两个！哇！" },
      { en: "Three in a row! You're on fire!",                zh: "连对三个！你太火了！" },
      { en: "You're unstoppable, {name}!",                    zh: "你挡都挡不住 {name}！" },
      { en: "Hot streak! Keep going!",                        zh: "连胜！继续！" },
    ],
  },

  /* ---------- 随机挑一条 + 占位符替换 ---------- */
  line(sceneKey, vars = {}) {
    const pool = this.lines[sceneKey];
    if (!pool || !pool.length) {
      return { en: '', zh: '', _raw: '' };
    }
    const raw = pool[Math.floor(Math.random() * pool.length)];
    const name  = vars.name   ?? this.meta.defaultName;
    const coach = vars.coach  ?? this.meta.defaultCoachName;
    const stars = vars.stars  ?? '';
    const day   = vars.day    ?? '';
    const replace = s => String(s)
      .replace(/\{name\}/g,  name)
      .replace(/\{coach\}/g, coach)
      .replace(/\{stars\}/g, stars)
      .replace(/\{day\}/g,   day);
    return { en: replace(raw.en), zh: replace(raw.zh), _raw: raw.en };
  },

  /* ---------- 挑 N 条不重复的 ---------- */
  lines_n(sceneKey, n, vars = {}) {
    const pool = this.lines[sceneKey] || [];
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, pool.length)).map(raw => {
      const name  = vars.name   ?? this.meta.defaultName;
      const coach = vars.coach  ?? this.meta.defaultCoachName;
      const replace = s => String(s)
        .replace(/\{name\}/g,  name)
        .replace(/\{coach\}/g, coach);
      return { en: replace(raw.en), zh: replace(raw.zh) };
    });
  },
};

/* ==================== 暴露到全局 ==================== */
if (typeof window !== 'undefined') {
  window.COACH = COACH;
}
