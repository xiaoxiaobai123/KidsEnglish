/* ================================================================
 * data-sentences.js
 * 译林版一年级英语下册 · 句库数据
 * 58 单元句子（U1-U8）+ 16 综合句 = 共 74 句
 * ================================================================
 * 字段说明：
 *   id        唯一 ID（s_u4_01 / s_mix_01）
 *   unit      1-8 或 'MIX'
 *   type      'story' | 'song' | 'rhyme' | 'practice'
 *   en / zh   原句（英/中）
 *   frame     句型模板，___ 代表空位（每句必有，支持闯关 3/5）
 *   slots     空位数组，顺序对应 frame 的 ___ 出现顺序
 *             每个 slot: { answer: 正确答案, pool: [3-4 个选项] }
 * ================================================================
 * 关卡 3·填一填：随机挑 1 个 slot，展示 frame + 3 选项
 * 关卡 5·换一换：展示 frame + 合并所有 slot.pool 作词汇库
 * ================================================================ */

const SENTENCES = [
  /* ====================== Unit 1 · Let's count!（8） ====================== */
  { id:'s_u1_01', unit:1, type:'story', en:"Look! How many red marbles?", zh:"看！多少个红弹珠？",
    frame:"How many ___ marbles?",
    slots:[{ answer:"red", pool:["red","yellow","green"] }] },
  { id:'s_u1_02', unit:1, type:'story', en:"One, two, three. Three red marbles.", zh:"一、二、三。三个红弹珠。",
    frame:"One, two, three. ___ red marbles.",
    slots:[{ answer:"Three", pool:["One","Two","Three"] }] },
  { id:'s_u1_03', unit:1, type:'story', en:"Four yellow marbles.", zh:"四个黄弹珠。",
    frame:"___ yellow marbles.",
    slots:[{ answer:"Four", pool:["Three","Four","Five"] }] },
  { id:'s_u1_04', unit:1, type:'story', en:"Five green peas.", zh:"五颗绿豌豆。",
    frame:"___ green peas.",
    slots:[{ answer:"Five", pool:["Three","Four","Five"] }] },
  { id:'s_u1_05', unit:1, type:'rhyme', en:"One, two, three. Look! A green tree.", zh:"一、二、三。看！一棵绿树。",
    frame:"One, two, three. Look! A ___ tree.",
    slots:[{ answer:"green", pool:["green","yellow","red"] }] },
  { id:'s_u1_06', unit:1, type:'rhyme', en:"Four, five, six. Count the sticks!", zh:"四、五、六。数数木棍！",
    frame:"Four, five, ___. Count the sticks!",
    slots:[{ answer:"six", pool:["six","five","seven"] }] },
  { id:'s_u1_07', unit:1, type:'practice', en:"Cool! Let's count to five!", zh:"酷！让我们数到五！",
    frame:"Cool! Let's count to ___!",
    slots:[{ answer:"five", pool:["three","four","five"] }] },
  { id:'s_u1_08', unit:1, type:'practice', en:"How many apples? Three apples.", zh:"多少个苹果？三个苹果。",
    frame:"How many apples? ___ apples.",
    slots:[{ answer:"Three", pool:["One","Two","Three","Four"] }] },

  /* ====================== Unit 2 · This is my pencil（7） ====================== */
  { id:'s_u2_01', unit:2, type:'story', en:"This is my pencil.", zh:"这是我的铅笔。",
    frame:"This is my ___.",
    slots:[{ answer:"pencil", pool:["pencil","book","ruler","rubber"] }] },
  { id:'s_u2_02', unit:2, type:'story', en:"Ouch! I'm sorry. That's OK.", zh:"哎哟！对不起。没关系。",
    frame:"Ouch! I'm ___. That's OK.",
    slots:[{ answer:"sorry", pool:["sorry","happy","cool"] }] },
  { id:'s_u2_03', unit:2, type:'story', en:"This is my book.", zh:"这是我的书。",
    frame:"This is my ___.",
    slots:[{ answer:"book", pool:["pencil","book","ruler","rubber"] }] },
  { id:'s_u2_04', unit:2, type:'story', en:"This is my ruler.", zh:"这是我的尺子。",
    frame:"This is my ___.",
    slots:[{ answer:"ruler", pool:["pencil","book","ruler","rubber"] }] },
  { id:'s_u2_05', unit:2, type:'story', en:"This is my rubber.", zh:"这是我的橡皮。",
    frame:"This is my ___.",
    slots:[{ answer:"rubber", pool:["pencil","book","ruler","rubber"] }] },
  { id:'s_u2_06', unit:2, type:'song', en:"I am sorry, my friend.", zh:"对不起，我的朋友。",
    frame:"I am ___, my friend.",
    slots:[{ answer:"sorry", pool:["sorry","happy","here"] }] },
  { id:'s_u2_07', unit:2, type:'practice', en:"Is this your pencil? Yes, it is.", zh:"这是你的铅笔吗？是的。",
    frame:"Is this your ___? Yes, it is.",
    slots:[{ answer:"pencil", pool:["pencil","book","ruler","rubber"] }] },

  /* ====================== Unit 3 · I like carrots（8） ====================== */
  { id:'s_u3_01', unit:3, type:'story', en:"I like carrots. Me too!", zh:"我喜欢胡萝卜。我也是！",
    frame:"I like ___. Me too!",
    slots:[{ answer:"carrots", pool:["carrots","peas","peppers","onions"] }] },
  { id:'s_u3_02', unit:3, type:'story', en:"An onion? No, thanks.", zh:"要洋葱吗？不用了谢谢。",
    frame:"An ___? No, thanks.",
    slots:[{ answer:"onion", pool:["onion","apple","orange"] }] },
  { id:'s_u3_03', unit:3, type:'story', en:"A pea? Yes, please.", zh:"要豌豆吗？好的谢谢。",
    frame:"A ___? Yes, please.",
    slots:[{ answer:"pea", pool:["pea","carrot","pepper"] }] },
  { id:'s_u3_04', unit:3, type:'story', en:"We all like peppers.", zh:"我们都喜欢甜椒。",
    frame:"We all like ___.",
    slots:[{ answer:"peppers", pool:["peppers","carrots","peas","onions"] }] },
  { id:'s_u3_05', unit:3, type:'song', en:"Peas are sweet and green.", zh:"豌豆又甜又绿。",
    frame:"Peas are ___ and ___.",
    slots:[
      { answer:"sweet", pool:["sweet","yummy","little"] },
      { answer:"green", pool:["green","yellow","white"] }
    ] },
  { id:'s_u3_06', unit:3, type:'song', en:"We all like to eat lots of peas.", zh:"我们都爱吃很多豌豆。",
    frame:"We all like to eat lots of ___.",
    slots:[{ answer:"peas", pool:["peas","carrots","peppers"] }] },
  { id:'s_u3_07', unit:3, type:'song', en:"Sweet and green, they're so yummy!", zh:"又甜又绿，真好吃！",
    frame:"Sweet and green, they're so ___!",
    slots:[{ answer:"yummy", pool:["yummy","sweet","cute"] }] },
  { id:'s_u3_08', unit:3, type:'practice', en:"Do you like carrots? Yes, I do.", zh:"你喜欢胡萝卜吗？是的。",
    frame:"Do you like ___? Yes, I do.",
    slots:[{ answer:"carrots", pool:["carrots","peas","peppers","onions"] }] },

  /* ====================== Unit 4 · Spring（7）← 孩子当前位置 ====================== */
  { id:'s_u4_01', unit:4, type:'story', en:"Look at the trees. They're green.", zh:"看那些树。它们是绿的。",
    frame:"Look at the ___. They're ___.",
    slots:[
      { answer:"trees",  pool:["trees","flowers","birds","kites"] },
      { answer:"green",  pool:["green","beautiful","happy","colourful"] }
    ] },
  { id:'s_u4_02', unit:4, type:'story', en:"Look at the flowers. They're beautiful.", zh:"看那些花。它们真美。",
    frame:"Look at the ___. They're ___.",
    slots:[
      { answer:"flowers",    pool:["trees","flowers","birds","kites"] },
      { answer:"beautiful",  pool:["green","beautiful","happy","colourful"] }
    ] },
  { id:'s_u4_03', unit:4, type:'story', en:"Look at the birds. They're happy.", zh:"看那些鸟。它们很开心。",
    frame:"Look at the ___. They're ___.",
    slots:[
      { answer:"birds",  pool:["trees","flowers","birds","kites"] },
      { answer:"happy",  pool:["green","beautiful","happy","colourful"] }
    ] },
  { id:'s_u4_04', unit:4, type:'story', en:"Look at the kites. They're colourful.", zh:"看那些风筝。它们五彩缤纷。",
    frame:"Look at the ___. They're ___.",
    slots:[
      { answer:"kites",      pool:["trees","flowers","birds","kites"] },
      { answer:"colourful",  pool:["green","beautiful","happy","colourful"] }
    ] },
  { id:'s_u4_05', unit:4, type:'rhyme', en:"Flowers, flowers, smile in spring.", zh:"花儿花儿，春天里微笑。",
    frame:"Flowers, flowers, ___ in spring.",
    slots:[{ answer:"smile", pool:["smile","swing","dance"] }] },
  { id:'s_u4_06', unit:4, type:'rhyme', en:"Trees, trees, swing and swing.", zh:"树儿树儿，摇啊摇。",
    frame:"Trees, trees, ___ and ___.",
    slots:[
      { answer:"swing", pool:["swing","smile","dance"] },
      { answer:"swing", pool:["swing","smile","dance"] }
    ] },
  { id:'s_u4_07', unit:4, type:'practice', en:"Spring is here! The birds sing.", zh:"春天来了！小鸟歌唱。",
    frame:"___ is here! The birds sing.",
    slots:[{ answer:"Spring", pool:["Spring","Summer","Winter"] }] },

  /* ====================== Unit 5 · What's this?（8） ====================== */
  { id:'s_u5_01', unit:5, type:'story', en:"What's this? It's a ladybird.", zh:"这是什么？是一只瓢虫。",
    frame:"What's this? It's a ___.",
    slots:[{ answer:"ladybird", pool:["ladybird","cicada","butterfly","dragonfly"] }] },
  { id:'s_u5_02', unit:5, type:'story', en:"It's a cicada. How cute!", zh:"是一只蝉。多可爱！",
    frame:"It's a ___. How cute!",
    slots:[{ answer:"cicada", pool:["cicada","ladybird","butterfly","dragonfly"] }] },
  { id:'s_u5_03', unit:5, type:'story', en:"It's a butterfly.", zh:"是一只蝴蝶。",
    frame:"It's a ___.",
    slots:[{ answer:"butterfly", pool:["butterfly","ladybird","cicada","dragonfly"] }] },
  { id:'s_u5_04', unit:5, type:'story', en:"It's a dragonfly.", zh:"是一只蜻蜓。",
    frame:"It's a ___.",
    slots:[{ answer:"dragonfly", pool:["dragonfly","ladybird","cicada","butterfly"] }] },
  { id:'s_u5_05', unit:5, type:'song', en:"Flutter, flutter, butterfly.", zh:"扑扑扇扇，小蝴蝶。",
    frame:"Flutter, flutter, ___.",
    slots:[{ answer:"butterfly", pool:["butterfly","ladybird","dragonfly"] }] },
  { id:'s_u5_06', unit:5, type:'song', en:"Dancing in the summer sky.", zh:"在夏日天空跳舞。",
    frame:"Dancing in the summer ___.",
    slots:[{ answer:"sky", pool:["sky","tree","sun"] }] },
  { id:'s_u5_07', unit:5, type:'song', en:"Fly over here and over there.", zh:"飞到这里飞到那里。",
    frame:"Fly over ___ and over ___.",
    slots:[
      { answer:"here",  pool:["here","there","up"] },
      { answer:"there", pool:["there","here","down"] }
    ] },
  { id:'s_u5_08', unit:5, type:'song', en:"Up and down, round and round.", zh:"上上下下，转啊转。",
    frame:"Up and ___, round and round.",
    slots:[{ answer:"down", pool:["down","up","here"] }] },

  /* ====================== Unit 6 · Are you ready?（6） ====================== */
  { id:'s_u6_01', unit:6, type:'story', en:"Are you ready? Let's go!", zh:"准备好了吗？出发！",
    frame:"Are you ready? Let's ___!",
    slots:[{ answer:"go", pool:["go","run","jump"] }] },
  { id:'s_u6_02', unit:6, type:'story', en:"Run, run, run! Well done!", zh:"跑跑跑！干得好！",
    frame:"Run, run, ___! Well done!",
    slots:[{ answer:"run", pool:["run","jump","hop","walk"] }] },
  { id:'s_u6_03', unit:6, type:'story', en:"Jump, jump, jump!", zh:"跳跳跳！",
    frame:"Jump, jump, ___!",
    slots:[{ answer:"jump", pool:["jump","run","hop","walk"] }] },
  { id:'s_u6_04', unit:6, type:'story', en:"Hop! Walk!", zh:"单脚跳！走！",
    frame:"Hop! ___!",
    slots:[{ answer:"Walk", pool:["Walk","Run","Jump"] }] },
  { id:'s_u6_05', unit:6, type:'rhyme', en:"Hop, hop, hop. Run, run, run.", zh:"跳跳跳。跑跑跑。",
    frame:"Hop, hop, hop. ___, ___, ___.",
    slots:[
      { answer:"Run", pool:["Run","Jump","Walk"] },
      { answer:"Run", pool:["Run","Jump","Walk"] },
      { answer:"Run", pool:["Run","Jump","Walk"] }
    ] },
  { id:'s_u6_06', unit:6, type:'rhyme', en:"Let's do it, one by one!", zh:"一个接一个来吧！",
    frame:"Let's do it, one ___ one!",
    slots:[{ answer:"by", pool:["by","and","to"] }] },

  /* ====================== Unit 7 · What's that?（7） ====================== */
  { id:'s_u7_01', unit:7, type:'story', en:"What's that? Shh! It's a pig.", zh:"那是什么？嘘！是一只猪。",
    frame:"What's that? Shh! It's a ___.",
    slots:[{ answer:"pig", pool:["pig","lamb","duck","cow"] }] },
  { id:'s_u7_02', unit:7, type:'story', en:"Baa! It's a lamb.", zh:"咩！是一只小羊。",
    frame:"Baa! It's a ___.",
    slots:[{ answer:"lamb", pool:["lamb","pig","duck","cow"] }] },
  { id:'s_u7_03', unit:7, type:'story', en:"Quack! It's a duck.", zh:"嘎！是一只鸭子。",
    frame:"Quack! It's a ___.",
    slots:[{ answer:"duck", pool:["duck","pig","lamb","cow"] }] },
  { id:'s_u7_04', unit:7, type:'story', en:"It's a cow.", zh:"是一头奶牛。",
    frame:"It's a ___.",
    slots:[{ answer:"cow", pool:["cow","pig","lamb","duck"] }] },
  { id:'s_u7_05', unit:7, type:'song', en:"Mary has a little lamb.", zh:"玛丽有一只小羊羔。",
    frame:"Mary has a little ___.",
    slots:[{ answer:"lamb", pool:["lamb","pig","duck"] }] },
  { id:'s_u7_06', unit:7, type:'song', en:"Its fleece is white as snow.", zh:"它的毛白如雪。",
    frame:"Its fleece is ___ as snow.",
    slots:[{ answer:"white", pool:["white","yellow","green"] }] },
  { id:'s_u7_07', unit:7, type:'practice', en:"The pig is pink and the cow is black.", zh:"猪是粉色的，奶牛是黑色的。",
    frame:"The pig is ___ and the cow is ___.",
    slots:[
      { answer:"pink",  pool:["pink","green","yellow"] },
      { answer:"black", pool:["black","white","red"] }
    ] },

  /* ====================== Unit 8 · What's in your bag?（7） ====================== */
  { id:'s_u8_01', unit:8, type:'story', en:"What's in your bag?", zh:"你包里有什么？",
    frame:"What's in your ___?",
    slots:[{ answer:"bag", pool:["bag","book","pencil"] }] },
  { id:'s_u8_02', unit:8, type:'story', en:"A bottle and a hankie.", zh:"一个瓶子和一块手帕。",
    frame:"A ___ and a ___.",
    slots:[
      { answer:"bottle", pool:["bottle","hankie","sticker","yo-yo"] },
      { answer:"hankie", pool:["bottle","hankie","sticker","yo-yo"] }
    ] },
  { id:'s_u8_03', unit:8, type:'story', en:"A sticker and a yo-yo.", zh:"一张贴纸和一个溜溜球。",
    frame:"A ___ and a ___.",
    slots:[
      { answer:"sticker", pool:["bottle","hankie","sticker","yo-yo"] },
      { answer:"yo-yo",   pool:["bottle","hankie","sticker","yo-yo"] }
    ] },
  { id:'s_u8_04', unit:8, type:'rhyme', en:"Here's my bag, look!", zh:"这是我的包，看！",
    frame:"Here's my ___, look!",
    slots:[{ answer:"bag", pool:["bag","book","pencil"] }] },
  { id:'s_u8_05', unit:8, type:'rhyme', en:"What can you see?", zh:"你能看到什么？",
    frame:"What can you ___?",
    slots:[{ answer:"see", pool:["see","do","eat"] }] },
  { id:'s_u8_06', unit:8, type:'rhyme', en:"Two yo-yos and a book.", zh:"两个溜溜球和一本书。",
    frame:"Two ___ and a book.",
    slots:[{ answer:"yo-yos", pool:["yo-yos","stickers","hankies"] }] },
  { id:'s_u8_07', unit:8, type:'rhyme', en:"Oh no! And a yellow bee.", zh:"哦不！还有一只黄蜜蜂。",
    frame:"Oh no! And a yellow ___.",
    slots:[{ answer:"bee", pool:["bee","bird","butterfly"] }] },

  /* ====================== Mixed Practice（16 · 综合复习）====================== */
  { id:'s_mix_01', unit:'MIX', type:'practice', en:"I have three books and two pencils.", zh:"我有三本书和两支铅笔。",
    frame:"I have ___ books and ___ pencils.",
    slots:[
      { answer:"three", pool:["two","three","four","five"] },
      { answer:"two",   pool:["two","three","four","five"] }
    ] },
  { id:'s_mix_02', unit:'MIX', type:'practice', en:"My pencil is yellow.", zh:"我的铅笔是黄色的。",
    frame:"My pencil is ___.",
    slots:[{ answer:"yellow", pool:["yellow","green","white","red"] }] },
  { id:'s_mix_03', unit:'MIX', type:'practice', en:"The bird is on the tree.", zh:"小鸟在树上。",
    frame:"The ___ is on the tree.",
    slots:[{ answer:"bird", pool:["bird","pig","cow","cat"] }] },
  { id:'s_mix_04', unit:'MIX', type:'practice', en:"I like the red flower.", zh:"我喜欢红色的花。",
    frame:"I like the ___ flower.",
    slots:[{ answer:"red", pool:["red","yellow","green","white"] }] },
  { id:'s_mix_05', unit:'MIX', type:'practice', en:"A cow eats carrots.", zh:"奶牛吃胡萝卜。",
    frame:"A ___ eats carrots.",
    slots:[{ answer:"cow", pool:["cow","pig","duck","lamb"] }] },
  { id:'s_mix_06', unit:'MIX', type:'practice', en:"Jump up! Jump down!", zh:"向上跳！向下跳！",
    frame:"Jump ___! Jump ___!",
    slots:[
      { answer:"up",   pool:["up","down","round"] },
      { answer:"down", pool:["up","down","round"] }
    ] },
  { id:'s_mix_07', unit:'MIX', type:'practice', en:"A little pig runs fast.", zh:"小猪跑得快。",
    frame:"A little ___ runs fast.",
    slots:[{ answer:"pig", pool:["pig","cow","lamb","duck"] }] },
  { id:'s_mix_08', unit:'MIX', type:'practice', en:"Can you see the dragonfly?", zh:"你能看见那只蜻蜓吗？",
    frame:"Can you see the ___?",
    slots:[{ answer:"dragonfly", pool:["dragonfly","butterfly","ladybird","cicada"] }] },
  { id:'s_mix_09', unit:'MIX', type:'practice', en:"One, two, three, jump!", zh:"一二三，跳！",
    frame:"One, two, three, ___!",
    slots:[{ answer:"jump", pool:["jump","run","hop","walk"] }] },
  { id:'s_mix_10', unit:'MIX', type:'practice', en:"Look at the five cute ducks.", zh:"看那五只可爱的鸭子。",
    frame:"Look at the ___ cute ducks.",
    slots:[{ answer:"five", pool:["three","four","five"] }] },
  { id:'s_mix_11', unit:'MIX', type:'practice', en:"Walk to the tree, please.", zh:"请走到树那边。",
    frame:"___ to the tree, please.",
    slots:[{ answer:"Walk", pool:["Walk","Run","Jump","Hop"] }] },
  { id:'s_mix_12', unit:'MIX', type:'practice', en:"We all like spring.", zh:"我们都喜欢春天。",
    frame:"We all like ___.",
    slots:[{ answer:"spring", pool:["spring","summer","winter"] }] },
  { id:'s_mix_13', unit:'MIX', type:'practice', en:"Happy spring! Hop, hop, hop!", zh:"快乐的春天！跳跳跳！",
    frame:"Happy ___! Hop, hop, hop!",
    slots:[{ answer:"spring", pool:["spring","summer","winter"] }] },
  { id:'s_mix_14', unit:'MIX', type:'practice', en:"The lamb is white as snow.", zh:"小羊像雪一样白。",
    frame:"The ___ is white as snow.",
    slots:[{ answer:"lamb", pool:["lamb","pig","cow","duck"] }] },
  { id:'s_mix_15', unit:'MIX', type:'practice', en:"My yo-yo is in the bag.", zh:"我的溜溜球在包里。",
    frame:"My ___ is in the bag.",
    slots:[{ answer:"yo-yo", pool:["yo-yo","pencil","book","sticker"] }] },
  { id:'s_mix_16', unit:'MIX', type:'practice', en:"I'm sorry. That's OK, my friend.", zh:"对不起。没关系，朋友。",
    frame:"I'm sorry. ___, my friend.",
    slots:[{ answer:"That's OK", pool:["That's OK","Thank you","Me too"] }] },
];

/* ==================== 索引 ==================== */
const SENTENCES_BY_ID = Object.fromEntries(SENTENCES.map(s => [s.id, s]));

/* ==================== 每日句子排课（Day 1-19）====================
 * 每个单元按 startDay 起算，每天侧重不同类型：
 *   单元第 1 天 → story（本单元课文主句，4-5 句）
 *   单元第 2 天 → rhyme 或 song（韵文/歌曲）
 *   单元第 3 天 → practice（巩固）
 * Day 20+ 留给 MIX 综合复习（app.js 可按需取用）
 * ================================================================= */
const DAILY_SENTENCES = {
  // U1 (Day 1-3)
  1:  ['s_u1_01','s_u1_02','s_u1_03','s_u1_04'],
  2:  ['s_u1_05','s_u1_06'],
  3:  ['s_u1_07','s_u1_08'],
  // U2 (Day 4-5)
  4:  ['s_u2_01','s_u2_02','s_u2_03','s_u2_04','s_u2_05'],
  5:  ['s_u2_06','s_u2_07'],
  // U3 (Day 6-8)
  6:  ['s_u3_01','s_u3_02','s_u3_03','s_u3_04'],
  7:  ['s_u3_05','s_u3_06','s_u3_07'],
  8:  ['s_u3_08'],
  // U4 (Day 9-11) ← 孩子当前位置
  9:  ['s_u4_01','s_u4_02','s_u4_03','s_u4_04'],
  10: ['s_u4_05','s_u4_06'],
  11: ['s_u4_07'],
  // U5 (Day 12-13)
  12: ['s_u5_01','s_u5_02','s_u5_03','s_u5_04'],
  13: ['s_u5_05','s_u5_06','s_u5_07','s_u5_08'],
  // U6 (Day 14-15)
  14: ['s_u6_01','s_u6_02','s_u6_03','s_u6_04'],
  15: ['s_u6_05','s_u6_06'],
  // U7 (Day 16-17)
  16: ['s_u7_01','s_u7_02','s_u7_03','s_u7_04'],
  17: ['s_u7_05','s_u7_06','s_u7_07'],
  // U8 (Day 18-19)
  18: ['s_u8_01','s_u8_02','s_u8_03'],
  19: ['s_u8_04','s_u8_05','s_u8_06','s_u8_07'],
  // Day 20+ 综合复习：按需从 MIX_SENTENCES 取
  20: ['s_mix_01','s_mix_02','s_mix_03','s_mix_04'],
  21: ['s_mix_05','s_mix_06','s_mix_07'],
  22: ['s_mix_08','s_mix_09','s_mix_10'],
  23: ['s_mix_11','s_mix_12','s_mix_13'],
  24: ['s_mix_14','s_mix_15','s_mix_16'],
};

/* ==================== 便捷集合 ==================== */
const MIX_SENTENCES = SENTENCES.filter(s => s.unit === 'MIX');

function sentencesByUnit(unit) {
  return SENTENCES.filter(s => s.unit === unit);
}

/* ==================== 整单元合并课（新增 · Phase 1.5） ====================
 * 每个 Unit 合并 story + rhyme/song + practice，一节课完整过一个 Unit，
 * 避免"学完 4 句就结束，还要切 Day 10 才有歌谣"的割裂体验。
 * 用户在设置里可切换课程模式：
 *   'daily'      → 沿用 DAILY_SENTENCES（细分版，每天 2~5 句）
 *   'unit-full'  → 用下面这份（一次学完一个 Unit，5~8 句，10~15 分钟）
 * ====================================================================== */
const UNIT_FULL_LESSONS = {
  1: SENTENCES.filter(s => s.unit === 1).map(s => s.id),
  2: SENTENCES.filter(s => s.unit === 2).map(s => s.id),
  3: SENTENCES.filter(s => s.unit === 3).map(s => s.id),
  4: SENTENCES.filter(s => s.unit === 4).map(s => s.id),
  5: SENTENCES.filter(s => s.unit === 5).map(s => s.id),
  6: SENTENCES.filter(s => s.unit === 6).map(s => s.id),
  7: SENTENCES.filter(s => s.unit === 7).map(s => s.id),
  8: SENTENCES.filter(s => s.unit === 8).map(s => s.id),
};

/* Day → Unit 的反查：Day 9/10/11 都映射到 Unit 4 的整课 */
const DAY_TO_UNIT = {
  1:1, 2:1, 3:1,
  4:2, 5:2,
  6:3, 7:3, 8:3,
  9:4, 10:4, 11:4,
  12:5, 13:5,
  14:6, 15:6,
  16:7, 17:7,
  18:8, 19:8,
};

/* 统一接口：根据 day 和 mode 取句子 ID 列表 */
function getLessonSentenceIds(day, mode = 'unit-full') {
  if (mode === 'daily') return DAILY_SENTENCES[day] || [];
  // 默认 unit-full：day 先映射 unit，再取整个 Unit
  const unit = DAY_TO_UNIT[day];
  if (!unit) {
    // Day 20+ 综合复习天：直接用 DAILY_SENTENCES
    return DAILY_SENTENCES[day] || [];
  }
  return UNIT_FULL_LESSONS[unit] || [];
}

/* ==================== 默认切入日 ==================== */
const DEFAULT_DAY = 9;  // Unit 4 第一天，匹配孩子当前进度

/* ==================== 暴露到全局 ==================== */
if (typeof window !== 'undefined') {
  window.SENTENCES          = SENTENCES;
  window.SENTENCES_BY_ID    = SENTENCES_BY_ID;
  window.DAILY_SENTENCES    = DAILY_SENTENCES;
  window.UNIT_FULL_LESSONS  = UNIT_FULL_LESSONS;
  window.DAY_TO_UNIT        = DAY_TO_UNIT;
  window.MIX_SENTENCES      = MIX_SENTENCES;
  window.DEFAULT_DAY        = DEFAULT_DAY;
  window.sentencesByUnit    = sentencesByUnit;
  window.getLessonSentenceIds = getLessonSentenceIds;
}
