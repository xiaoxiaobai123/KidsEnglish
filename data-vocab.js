// ============================================================
// data-vocab.js
// 译林版一年级英语下册 · 词库
// 137 词条 = 65 核心词 + 46 歌谣词 + 26 字母
// ============================================================

// ---------- 单元元信息 ----------
const UNITS = [
  { id:1, title:"Let's count!",        titleZh:"数一数",          sub:"数字 & 颜色",         emoji:"🔢" },
  { id:2, title:"This is my pencil",   titleZh:"我的文具",        sub:"学习用品 & 礼貌用语", emoji:"✏️" },
  { id:3, title:"I like carrots",      titleZh:"我爱蔬菜",        sub:"蔬菜 & 喜好表达",     emoji:"🥕" },
  { id:4, title:"Spring",              titleZh:"春天",            sub:"大自然 & 形容词",     emoji:"🌸" },
  { id:5, title:"What's this?",        titleZh:"这是什么？",      sub:"昆虫 & 询问物品",     emoji:"🐞" },
  { id:6, title:"Are you ready?",      titleZh:"准备好了吗？",    sub:"动作动词",            emoji:"🏃" },
  { id:7, title:"What's that?",        titleZh:"那是什么？",      sub:"农场动物 & 动物叫声", emoji:"🐷" },
  { id:8, title:"What's in your bag?", titleZh:"你的包里是什么？",sub:"随身物品",            emoji:"🎒" },
];

// ---------- 词库 ----------
const VOCAB = {
  // ==================== 核心词 65 ====================
  core: [
    // Unit 1 — Let's count! (11)
    { id:"u1_lets",     unit:1, en:"let's",     zh:"让我们",   ipa:"/lets/",       note:"= let us",  emoji:"👉",  exEn:"Let's play!",          exZh:"我们来玩吧！" },
    { id:"u1_count",    unit:1, en:"count",     zh:"数数",     ipa:"/kaʊnt/",      note:"",          emoji:"🔢",  exEn:"I can count to ten.",  exZh:"我能数到十。" },
    { id:"u1_cool",     unit:1, en:"Cool!",     zh:"酷！",     ipa:"/kuːl/",       note:"",          emoji:"😎",  exEn:"Wow, that's cool!",    exZh:"哇，太酷了！" },
    { id:"u1_howmany",  unit:1, en:"how many",  zh:"多少",     ipa:"/haʊ ˈmɛ.ni/", note:"问数量",    emoji:"❓",  exEn:"How many apples?",     exZh:"有多少个苹果？" },
    { id:"u1_marble",   unit:1, en:"marble",    zh:"玻璃弹珠", ipa:"/ˈmɑːr.bəl/",  note:"",          emoji:"🔮",  exEn:"I have five marbles.", exZh:"我有五颗弹珠。" },
    { id:"u1_one",      unit:1, en:"one",       zh:"一",       ipa:"/wʌn/",        note:"",          emoji:"1️⃣",  exEn:"One apple, please.",   exZh:"请给一个苹果。" },
    { id:"u1_two",      unit:1, en:"two",       zh:"二",       ipa:"/tuː/",        note:"",          emoji:"2️⃣",  exEn:"I have two eyes.",     exZh:"我有两只眼睛。" },
    { id:"u1_three",    unit:1, en:"three",     zh:"三",       ipa:"/θriː/",       note:"",          emoji:"3️⃣",  exEn:"Three little bears.",  exZh:"三只小熊。" },
    { id:"u1_four",     unit:1, en:"four",      zh:"四",       ipa:"/fɔːr/",       note:"",          emoji:"4️⃣",  exEn:"A cat has four legs.", exZh:"猫有四条腿。" },
    { id:"u1_yellow",   unit:1, en:"yellow",    zh:"黄色的",   ipa:"/ˈjɛl.oʊ/",    note:"",          emoji:"💛",  exEn:"A yellow banana.",     exZh:"一根黄香蕉。" },
    { id:"u1_five",     unit:1, en:"five",      zh:"五",       ipa:"/faɪv/",       note:"",          emoji:"5️⃣",  exEn:"Give me five!",        exZh:"击个掌！" },

    // Unit 2 — This is my pencil (7)
    { id:"u2_pencil",   unit:2, en:"pencil",      zh:"铅笔",     ipa:"/ˈpɛn.səl/",    note:"",        emoji:"✏️",  exEn:"My pencil is red.",     exZh:"我的铅笔是红色的。" },
    { id:"u2_ouch",     unit:2, en:"Ouch!",       zh:"哎哟！",   ipa:"/aʊtʃ/",        note:"疼痛时说", emoji:"🤕",  exEn:"Ouch, that hurts!",     exZh:"哎哟，好疼！" },
    { id:"u2_sorry",    unit:2, en:"I'm sorry.",  zh:"对不起。", ipa:"/aɪm ˈsɑːr.i/", note:"",        emoji:"😔",  exEn:"I'm sorry, Mom.",       exZh:"对不起，妈妈。" },
    { id:"u2_ok",       unit:2, en:"That's OK.",  zh:"没关系。", ipa:"/ðæts oʊˈkeɪ/", note:"",        emoji:"😊",  exEn:"That's OK, my friend.", exZh:"没关系，朋友。" },
    { id:"u2_book",     unit:2, en:"book",        zh:"书",       ipa:"/bʊk/",         note:"",        emoji:"📖",  exEn:"I love this book.",     exZh:"我爱这本书。" },
    { id:"u2_ruler",    unit:2, en:"ruler",       zh:"直尺",     ipa:"/ˈruː.lər/",    note:"",        emoji:"📏",  exEn:"Lend me your ruler.",   exZh:"借我你的尺子。" },
    { id:"u2_rubber",   unit:2, en:"rubber",      zh:"橡皮",     ipa:"/ˈrʌb.ər/",     note:"",        emoji:"🧽",  exEn:"Pass me the rubber.",   exZh:"把橡皮给我。" },

    // Unit 3 — I like carrots (10)
    { id:"u3_like",      unit:3, en:"like",        zh:"喜欢",         ipa:"/laɪk/",     note:"",        emoji:"❤️",  exEn:"I like ice cream.",          exZh:"我喜欢冰淇淋。" },
    { id:"u3_carrot",    unit:3, en:"carrot",      zh:"胡萝卜",       ipa:"/ˈkær.ət/",  note:"",        emoji:"🥕",  exEn:"Rabbits eat carrots.",       exZh:"兔子吃胡萝卜。" },
    { id:"u3_metoo",     unit:3, en:"Me too.",     zh:"我也是。",     ipa:"/miː tuː/",  note:"",        emoji:"🙋",  exEn:"I love dogs. — Me too.",     exZh:"我爱小狗。— 我也是。" },
    { id:"u3_onion",     unit:3, en:"onion",       zh:"洋葱",         ipa:"/ˈʌn.jən/",  note:"",        emoji:"🧅",  exEn:"The onion is spicy.",        exZh:"洋葱很辣。" },
    { id:"u3_nothanks",  unit:3, en:"No, thanks.", zh:"不用了谢谢。", ipa:"/noʊ θæŋks/",note:"礼貌拒绝", emoji:"🙅",  exEn:"More cake? — No, thanks.",   exZh:"再来块蛋糕？— 不用了谢谢。" },
    { id:"u3_pea",       unit:3, en:"pea",         zh:"豌豆",         ipa:"/piː/",      note:"",        emoji:"🫛",  exEn:"Peas are green.",            exZh:"豌豆是绿色的。" },
    { id:"u3_yesplease", unit:3, en:"Yes, please.",zh:"好的谢谢。",   ipa:"/jɛs pliːz/",note:"礼貌接受", emoji:"🙆",  exEn:"More milk? — Yes, please.",  exZh:"再来点牛奶？— 好的谢谢。" },
    { id:"u3_we",        unit:3, en:"we",          zh:"我们",         ipa:"/wiː/",      note:"",        emoji:"👥",  exEn:"We are friends.",            exZh:"我们是朋友。" },
    { id:"u3_all",       unit:3, en:"all",         zh:"全部",         ipa:"/ɔːl/",      note:"",        emoji:"💯",  exEn:"We all love fruit.",         exZh:"我们都爱水果。" },
    { id:"u3_pepper",    unit:3, en:"pepper",      zh:"甜椒",         ipa:"/ˈpɛp.ər/",  note:"灯笼椒",   emoji:"🫑",  exEn:"Red pepper is sweet.",       exZh:"红甜椒很甜。" },

    // Unit 4 — Spring (10)
    { id:"u4_spring",    unit:4, en:"spring",      zh:"春天",     ipa:"/sprɪŋ/",         note:"",          emoji:"🌸",  exEn:"I love spring.",         exZh:"我爱春天。" },
    { id:"u4_the",       unit:4, en:"the",         zh:"这/那",    ipa:"/ðə/",            note:"定冠词",    emoji:"👉",  exEn:"Look at the cat.",       exZh:"看那只猫。" },
    { id:"u4_tree",      unit:4, en:"tree",        zh:"树",       ipa:"/triː/",          note:"",          emoji:"🌳",  exEn:"A tall tree.",           exZh:"一棵高高的树。" },
    { id:"u4_theyre",    unit:4, en:"they're",     zh:"他们是",   ipa:"/ðɛr/",           note:"= they are", emoji:"👫",  exEn:"They're my friends.",    exZh:"他们是我的朋友。" },
    { id:"u4_flower",    unit:4, en:"flower",      zh:"花",       ipa:"/ˈflaʊ.ər/",      note:"",          emoji:"🌼",  exEn:"A pretty flower.",       exZh:"一朵漂亮的花。" },
    { id:"u4_beautiful", unit:4, en:"beautiful",   zh:"漂亮的",   ipa:"/ˈbjuː.tɪ.fəl/",  note:"",          emoji:"✨",  exEn:"What a beautiful day!",  exZh:"多美的一天！" },
    { id:"u4_bird",      unit:4, en:"bird",        zh:"鸟",       ipa:"/bɜːrd/",         note:"",          emoji:"🐦",  exEn:"A little bird sings.",   exZh:"小鸟在唱歌。" },
    { id:"u4_happy",     unit:4, en:"happy",       zh:"开心的",   ipa:"/ˈhæp.i/",        note:"",          emoji:"😄",  exEn:"I am happy today.",      exZh:"我今天很开心。" },
    { id:"u4_kite",      unit:4, en:"kite",        zh:"风筝",     ipa:"/kaɪt/",          note:"",          emoji:"🪁",  exEn:"Let's fly a kite.",      exZh:"我们去放风筝吧。" },
    { id:"u4_colourful", unit:4, en:"colourful",   zh:"五彩的",   ipa:"/ˈkʌl.ər.fəl/",   note:"英式拼写",  emoji:"🌈",  exEn:"A colourful rainbow.",   exZh:"彩色的彩虹。" },

    // Unit 5 — What's this? (7)
    { id:"u5_whats",     unit:5, en:"what's",       zh:"是什么",     ipa:"/wʌts/",          note:"= what is",  emoji:"❓",  exEn:"What's your name?",         exZh:"你叫什么名字？" },
    { id:"u5_whatsthis", unit:5, en:"What's this?", zh:"这是什么？", ipa:"/wʌts ðɪs/",      note:"",           emoji:"👇",  exEn:"What's this? It's a cat.",  exZh:"这是什么？是只猫。" },
    { id:"u5_ladybird",  unit:5, en:"ladybird",     zh:"瓢虫",       ipa:"/ˈleɪ.di.bɜːrd/", note:"= ladybug",  emoji:"🐞",  exEn:"A ladybird has dots.",      exZh:"瓢虫身上有圆点。" },
    { id:"u5_cute",      unit:5, en:"cute",         zh:"可爱的",     ipa:"/kjuːt/",         note:"",           emoji:"🥰",  exEn:"What a cute puppy!",        exZh:"多可爱的小狗！" },
    { id:"u5_cicada",    unit:5, en:"cicada",       zh:"蝉",         ipa:"/sɪˈkeɪ.də/",     note:"知了",       emoji:"🦗",  exEn:"Cicadas sing in summer.",   exZh:"蝉在夏天鸣叫。" },
    { id:"u5_butterfly", unit:5, en:"butterfly",    zh:"蝴蝶",       ipa:"/ˈbʌt.ər.flaɪ/",  note:"",           emoji:"🦋",  exEn:"The butterfly is pink.",    exZh:"蝴蝶是粉色的。" },
    { id:"u5_dragonfly", unit:5, en:"dragonfly",    zh:"蜻蜓",       ipa:"/ˈdræɡ.ən.flaɪ/", note:"",           emoji:"🪰",  exEn:"A dragonfly flies fast.",   exZh:"蜻蜓飞得快。" },

    // Unit 6 — Are you ready? (6)
    { id:"u6_ready",    unit:6, en:"Are you ready?", zh:"你准备好了吗？", ipa:"/ɑːr juː ˈrɛd.i/", note:"",       emoji:"🏁",  exEn:"Are you ready? Let's go!", exZh:"准备好了吗？出发！" },
    { id:"u6_run",      unit:6, en:"run",            zh:"跑",              ipa:"/rʌn/",           note:"",       emoji:"🏃",  exEn:"Run, run, run!",            exZh:"跑，跑，跑！" },
    { id:"u6_jump",     unit:6, en:"jump",           zh:"跳",              ipa:"/dʒʌmp/",         note:"",       emoji:"🤸",  exEn:"Jump high!",                exZh:"跳高一点！" },
    { id:"u6_welldone", unit:6, en:"Well done!",     zh:"干得好！",        ipa:"/wɛl dʌn/",       note:"表扬",   emoji:"👏",  exEn:"Well done, Tommy!",         exZh:"干得好，汤米！" },
    { id:"u6_hop",      unit:6, en:"hop",            zh:"单脚跳",          ipa:"/hɑːp/",          note:"",       emoji:"🦘",  exEn:"Hop like a rabbit.",        exZh:"像小兔子一样跳。" },
    { id:"u6_walk",     unit:6, en:"walk",           zh:"走",              ipa:"/wɔːk/",          note:"",       emoji:"🚶",  exEn:"Walk slowly, please.",      exZh:"请慢慢走。" },

    // Unit 7 — What's that? (8)
    { id:"u7_whatsthat",unit:7, en:"What's that?", zh:"那是什么？", ipa:"/wʌts ðæt/", note:"",          emoji:"❓",  exEn:"What's that noise?",        exZh:"那是什么声音？" },
    { id:"u7_shh",      unit:7, en:"Shh!",         zh:"嘘！",       ipa:"/ʃ/",        note:"让别人安静", emoji:"🤫",  exEn:"Shh, baby is sleeping.",    exZh:"嘘，宝宝在睡觉。" },
    { id:"u7_pig",      unit:7, en:"pig",          zh:"猪",         ipa:"/pɪɡ/",      note:"",          emoji:"🐷",  exEn:"The pig is pink.",          exZh:"猪是粉色的。" },
    { id:"u7_baa",      unit:7, en:"Baa!",         zh:"咩！",       ipa:"/bɑː/",      note:"羊叫声",    emoji:"🐑",  exEn:"Baa! says the sheep.",      exZh:"羊咩咩叫。" },
    { id:"u7_lamb",     unit:7, en:"lamb",         zh:"小羊",       ipa:"/læm/",      note:"羊羔",      emoji:"🐏",  exEn:"A little white lamb.",      exZh:"一只小白羊羔。" },
    { id:"u7_quack",    unit:7, en:"Quack!",       zh:"嘎！",       ipa:"/kwæk/",     note:"鸭叫声",    emoji:"🦆",  exEn:"Quack, quack, quack!",      exZh:"嘎嘎嘎！" },
    { id:"u7_duck",     unit:7, en:"duck",         zh:"鸭子",       ipa:"/dʌk/",      note:"",          emoji:"🦆",  exEn:"A duck swims in the pond.", exZh:"鸭子在池塘里游泳。" },
    { id:"u7_cow",      unit:7, en:"cow",          zh:"奶牛",       ipa:"/kaʊ/",      note:"",          emoji:"🐮",  exEn:"The cow says moo.",         exZh:"奶牛哞哞叫。" },

    // Unit 8 — What's in your bag? (6)
    { id:"u8_in",      unit:8, en:"in",       zh:"在……里", ipa:"/ɪn/",        note:"介词",            emoji:"📦",  exEn:"It's in the box.",        exZh:"它在盒子里。" },
    { id:"u8_bottle",  unit:8, en:"bottle",   zh:"瓶子",   ipa:"/ˈbɑː.təl/",  note:"",                emoji:"🍼",  exEn:"A water bottle.",         exZh:"一个水瓶。" },
    { id:"u8_hankie",  unit:8, en:"hankie",   zh:"手帕",   ipa:"/ˈhæŋ.ki/",   note:"= handkerchief",   emoji:"🧻",  exEn:"Use a hankie, please.",   exZh:"请用手帕。" },
    { id:"u8_and",     unit:8, en:"and",      zh:"和",     ipa:"/ænd/",       note:"",                emoji:"➕",  exEn:"Mom and Dad.",             exZh:"妈妈和爸爸。" },
    { id:"u8_sticker", unit:8, en:"sticker",  zh:"贴纸",   ipa:"/ˈstɪk.ər/",  note:"",                emoji:"⭐",  exEn:"A shiny sticker.",         exZh:"一张闪亮的贴纸。" },
    { id:"u8_yoyo",    unit:8, en:"yo-yo",    zh:"溜溜球", ipa:"/ˈjoʊ.joʊ/",  note:"",                emoji:"🪀",  exEn:"A blue yo-yo.",            exZh:"一个蓝色的溜溜球。" },
  ],

  // ==================== 歌谣词 46 ====================
  rhyme: [
    // U1 rhyme "One, two, three" (4)
    { id:"r_u1_green",  unit:1, en:"green",  zh:"绿色的",  ipa:"/ɡriːn/", note:"U1 韵律", emoji:"💚",   exEn:"A green tree.",     exZh:"一棵绿树。" },
    { id:"r_u1_six",    unit:1, en:"six",    zh:"六",      ipa:"/sɪks/",  note:"U1 韵律", emoji:"6️⃣",   exEn:"Four, five, six!",  exZh:"四、五、六！" },
    { id:"r_u1_stick",  unit:1, en:"stick",  zh:"小木棍",  ipa:"/stɪk/",  note:"U1 韵律", emoji:"🪵",   exEn:"Count the sticks!", exZh:"数数小木棍！" },
    { id:"r_u1_look",   unit:1, en:"look",   zh:"看",      ipa:"/lʊk/",   note:"U1 韵律", emoji:"👀",   exEn:"Look at the tree.", exZh:"看那棵树。" },

    // U2 song "I am sorry" (4)
    { id:"r_u2_i",      unit:2, en:"I",      zh:"我",      ipa:"/aɪ/",    note:"U2 歌",   emoji:"🙋",   exEn:"I am happy.",       exZh:"我很开心。" },
    { id:"r_u2_am",     unit:2, en:"am",     zh:"是",      ipa:"/æm/",    note:"U2 歌",   emoji:"🟰",   exEn:"I am Tom.",         exZh:"我是汤姆。" },
    { id:"r_u2_my",     unit:2, en:"my",     zh:"我的",    ipa:"/maɪ/",   note:"U2 歌",   emoji:"🤚",   exEn:"My friend.",        exZh:"我的朋友。" },
    { id:"r_u2_friend", unit:2, en:"friend", zh:"朋友",    ipa:"/frɛnd/", note:"U2 歌",   emoji:"🤝",   exEn:"You are my friend.",exZh:"你是我的朋友。" },

    // U3 song "They're so yummy" (6)
    { id:"r_u3_you",    unit:3, en:"you",    zh:"你",      ipa:"/juː/",   note:"U3 歌",   emoji:"👉",   exEn:"Who are you?",      exZh:"你是谁？" },
    { id:"r_u3_sweet",  unit:3, en:"sweet",  zh:"甜的",    ipa:"/swiːt/", note:"U3 歌",   emoji:"🍭",   exEn:"Peas are sweet.",   exZh:"豌豆是甜的。" },
    { id:"r_u3_so",     unit:3, en:"so",     zh:"如此",    ipa:"/soʊ/",   note:"U3 歌",   emoji:"💫",   exEn:"So yummy!",         exZh:"真好吃！" },
    { id:"r_u3_yummy",  unit:3, en:"yummy",  zh:"好吃的",  ipa:"/ˈjʌm.i/",note:"U3 歌",   emoji:"😋",   exEn:"Yummy yummy!",      exZh:"真好吃！" },
    { id:"r_u3_eat",    unit:3, en:"eat",    zh:"吃",      ipa:"/iːt/",   note:"U3 歌",   emoji:"🍽️",   exEn:"I eat an apple.",   exZh:"我吃一个苹果。" },
    { id:"r_u3_to",     unit:3, en:"to",     zh:"去/到",   ipa:"/tuː/",   note:"U3 歌",   emoji:"➡️",   exEn:"I go to school.",   exZh:"我去上学。" },

    // U4 rhyme "Spring" (2)
    { id:"r_u4_smile",  unit:4, en:"smile",  zh:"微笑",    ipa:"/smaɪl/", note:"U4 韵律", emoji:"😊",   exEn:"Flowers smile.",    exZh:"花儿在微笑。" },
    { id:"r_u4_swing",  unit:4, en:"swing",  zh:"摇摆",    ipa:"/swɪŋ/",  note:"U4 韵律", emoji:"🎐",   exEn:"Trees swing.",      exZh:"树在摇摆。" },

    // U5 song "Butterfly" (11)
    { id:"r_u5_flutter",unit:5, en:"flutter",zh:"扑扇",    ipa:"/ˈflʌt.ər/",note:"U5 歌", emoji:"💨",  exEn:"Butterflies flutter.", exZh:"蝴蝶扑扇翅膀。" },
    { id:"r_u5_dance",  unit:5, en:"dance",  zh:"跳舞",    ipa:"/dæns/",    note:"U5 歌", emoji:"💃",  exEn:"Let's dance!",         exZh:"我们跳舞吧！" },
    { id:"r_u5_summer", unit:5, en:"summer", zh:"夏天",    ipa:"/ˈsʌm.ər/", note:"U5 歌", emoji:"🌞",  exEn:"Summer is hot.",       exZh:"夏天很热。" },
    { id:"r_u5_sky",    unit:5, en:"sky",    zh:"天空",    ipa:"/skaɪ/",    note:"U5 歌", emoji:"🌤️",  exEn:"The sky is blue.",     exZh:"天空是蓝色的。" },
    { id:"r_u5_fly",    unit:5, en:"fly",    zh:"飞",      ipa:"/flaɪ/",    note:"U5 歌", emoji:"🦋",  exEn:"Birds fly high.",      exZh:"小鸟飞得高。" },
    { id:"r_u5_over",   unit:5, en:"over",   zh:"在上方",  ipa:"/ˈoʊ.vər/", note:"U5 歌", emoji:"☁️",  exEn:"Over the sky.",        exZh:"在天空上方。" },
    { id:"r_u5_here",   unit:5, en:"here",   zh:"这里",    ipa:"/hɪr/",     note:"U5 歌", emoji:"📍",  exEn:"Come here, please.",   exZh:"请到这里来。" },
    { id:"r_u5_there",  unit:5, en:"there",  zh:"那里",    ipa:"/ðɛr/",     note:"U5 歌", emoji:"📌",  exEn:"Look over there!",     exZh:"看那边！" },
    { id:"r_u5_up",     unit:5, en:"up",     zh:"向上",    ipa:"/ʌp/",      note:"U5 歌", emoji:"⬆️",  exEn:"Jump up high.",        exZh:"向上跳高。" },
    { id:"r_u5_down",   unit:5, en:"down",   zh:"向下",    ipa:"/daʊn/",    note:"U5 歌", emoji:"⬇️",  exEn:"Sit down, please.",    exZh:"请坐下。" },
    { id:"r_u5_round",  unit:5, en:"round",  zh:"转圈",    ipa:"/raʊnd/",   note:"U5 歌", emoji:"🔄",  exEn:"Round and round.",     exZh:"一圈又一圈。" },

    // U6 rhyme "Hop, hop, hop" (3)
    { id:"r_u6_do",     unit:6, en:"do",     zh:"做",      ipa:"/duː/",     note:"U6 韵律", emoji:"🛠️",  exEn:"Let's do it!",    exZh:"我们来做吧！" },
    { id:"r_u6_it",     unit:6, en:"it",     zh:"它",      ipa:"/ɪt/",      note:"U6 韵律", emoji:"👇",  exEn:"I like it.",      exZh:"我喜欢它。" },
    { id:"r_u6_by",     unit:6, en:"by",     zh:"挨着",    ipa:"/baɪ/",     note:"U6 韵律", emoji:"↔️",  exEn:"One by one.",     exZh:"一个接一个。" },

    // U7 song "Mary has a little lamb" (8)
    { id:"r_u7_mary",   unit:7, en:"Mary",   zh:"玛丽",    ipa:"/ˈmɛr.i/",  note:"U7 歌·人名", emoji:"👧", exEn:"Mary is my friend.", exZh:"玛丽是我的朋友。" },
    { id:"r_u7_has",    unit:7, en:"has",    zh:"有",      ipa:"/hæz/",     note:"U7 歌",     emoji:"🎒",  exEn:"She has a pen.",     exZh:"她有一支笔。" },
    { id:"r_u7_little", unit:7, en:"little", zh:"小的",    ipa:"/ˈlɪt.əl/", note:"U7 歌",     emoji:"🐤",  exEn:"A little dog.",      exZh:"一只小狗。" },
    { id:"r_u7_its",    unit:7, en:"its",    zh:"它的",    ipa:"/ɪts/",     note:"U7 歌",     emoji:"🐾",  exEn:"Its fur is soft.",   exZh:"它的毛很软。" },
    { id:"r_u7_fleece", unit:7, en:"fleece", zh:"羊毛",    ipa:"/fliːs/",   note:"U7 歌",     emoji:"🐑",  exEn:"White fleece.",      exZh:"白色的羊毛。" },
    { id:"r_u7_white",  unit:7, en:"white",  zh:"白色的",  ipa:"/waɪt/",    note:"U7 歌",     emoji:"🤍",  exEn:"Snow is white.",     exZh:"雪是白色的。" },
    { id:"r_u7_as",     unit:7, en:"as",     zh:"像…一样", ipa:"/æz/",      note:"U7 歌",     emoji:"⚖️",  exEn:"White as snow.",     exZh:"像雪一样白。" },
    { id:"r_u7_snow",   unit:7, en:"snow",   zh:"雪",      ipa:"/snoʊ/",    note:"U7 歌",     emoji:"❄️",  exEn:"Snow is cold.",      exZh:"雪是冷的。" },

    // U8 rhyme "Here's my bag" (8)
    { id:"r_u8_heres",  unit:8, en:"here's", zh:"这是",    ipa:"/hɪrz/",    note:"= here is", emoji:"👇",  exEn:"Here's my pen.",  exZh:"这是我的笔。" },
    { id:"r_u8_bag",    unit:8, en:"bag",    zh:"包/书包", ipa:"/bæɡ/",     note:"U8 韵律",   emoji:"🎒",  exEn:"This is my bag.", exZh:"这是我的书包。" },
    { id:"r_u8_what",   unit:8, en:"what",   zh:"什么",    ipa:"/wʌt/",     note:"U8 韵律",   emoji:"❓",  exEn:"What is it?",     exZh:"这是什么？" },
    { id:"r_u8_can",    unit:8, en:"can",    zh:"能",      ipa:"/kæn/",     note:"U8 韵律",   emoji:"💪",  exEn:"I can run.",      exZh:"我能跑。" },
    { id:"r_u8_see",    unit:8, en:"see",    zh:"看见",    ipa:"/siː/",     note:"U8 韵律",   emoji:"👁️",  exEn:"I can see you.",  exZh:"我能看见你。" },
    { id:"r_u8_oh",     unit:8, en:"oh",     zh:"哦",      ipa:"/oʊ/",      note:"U8 韵律",   emoji:"😮",  exEn:"Oh no!",          exZh:"哦不！" },
    { id:"r_u8_no",     unit:8, en:"no",     zh:"不",      ipa:"/noʊ/",     note:"U8 韵律",   emoji:"🙅",  exEn:"No, I can't.",    exZh:"不，我不能。" },
    { id:"r_u8_bee",    unit:8, en:"bee",    zh:"蜜蜂",    ipa:"/biː/",     note:"U8 韵律",   emoji:"🐝",  exEn:"A yellow bee.",   exZh:"一只黄蜜蜂。" },
  ],

  // ==================== 26 字母 ====================
  alphabet: [
    { id:"a_a", letter:"Aa", ipa:"/eɪ/",          zh:"字母 A", example:"apple",     exampleZh:"苹果",   emoji:"🍎", exEn:"A is for apple.",     exZh:"A 像苹果的 A。" },
    { id:"a_b", letter:"Bb", ipa:"/biː/",         zh:"字母 B", example:"bear",      exampleZh:"熊",     emoji:"🐻", exEn:"B is for bear.",      exZh:"B 像熊的 B。" },
    { id:"a_c", letter:"Cc", ipa:"/siː/",         zh:"字母 C", example:"cat",       exampleZh:"猫",     emoji:"🐱", exEn:"C is for cat.",       exZh:"C 像猫的 C。" },
    { id:"a_d", letter:"Dd", ipa:"/diː/",         zh:"字母 D", example:"dog",       exampleZh:"狗",     emoji:"🐶", exEn:"D is for dog.",       exZh:"D 像狗的 D。" },
    { id:"a_e", letter:"Ee", ipa:"/iː/",          zh:"字母 E", example:"egg",       exampleZh:"蛋",     emoji:"🥚", exEn:"E is for egg.",       exZh:"E 像蛋的 E。" },
    { id:"a_f", letter:"Ff", ipa:"/ɛf/",          zh:"字母 F", example:"fish",      exampleZh:"鱼",     emoji:"🐟", exEn:"F is for fish.",      exZh:"F 像鱼的 F。" },
    { id:"a_g", letter:"Gg", ipa:"/dʒiː/",        zh:"字母 G", example:"girl",      exampleZh:"女孩",   emoji:"👧", exEn:"G is for girl.",      exZh:"G 像女孩的 G。" },
    { id:"a_h", letter:"Hh", ipa:"/eɪtʃ/",        zh:"字母 H", example:"house",     exampleZh:"房子",   emoji:"🏠", exEn:"H is for house.",     exZh:"H 像房子的 H。" },
    { id:"a_i", letter:"Ii", ipa:"/aɪ/",          zh:"字母 I", example:"ice cream", exampleZh:"冰淇淋", emoji:"🍦", exEn:"I is for ice cream.", exZh:"I 像冰淇淋的 I。" },
    { id:"a_j", letter:"Jj", ipa:"/dʒeɪ/",        zh:"字母 J", example:"juice",     exampleZh:"果汁",   emoji:"🧃", exEn:"J is for juice.",     exZh:"J 像果汁的 J。" },
    { id:"a_k", letter:"Kk", ipa:"/keɪ/",         zh:"字母 K", example:"king",      exampleZh:"国王",   emoji:"🤴", exEn:"K is for king.",      exZh:"K 像国王的 K。" },
    { id:"a_l", letter:"Ll", ipa:"/ɛl/",          zh:"字母 L", example:"lion",      exampleZh:"狮子",   emoji:"🦁", exEn:"L is for lion.",      exZh:"L 像狮子的 L。" },
    { id:"a_m", letter:"Mm", ipa:"/ɛm/",          zh:"字母 M", example:"moon",      exampleZh:"月亮",   emoji:"🌙", exEn:"M is for moon.",      exZh:"M 像月亮的 M。" },
    { id:"a_n", letter:"Nn", ipa:"/ɛn/",          zh:"字母 N", example:"nose",      exampleZh:"鼻子",   emoji:"👃", exEn:"N is for nose.",      exZh:"N 像鼻子的 N。" },
    { id:"a_o", letter:"Oo", ipa:"/oʊ/",          zh:"字母 O", example:"owl",       exampleZh:"猫头鹰", emoji:"🦉", exEn:"O is for owl.",       exZh:"O 像猫头鹰的 O。" },
    { id:"a_p", letter:"Pp", ipa:"/piː/",         zh:"字母 P", example:"pig",       exampleZh:"猪",     emoji:"🐷", exEn:"P is for pig.",       exZh:"P 像猪的 P。" },
    { id:"a_q", letter:"Qq", ipa:"/kjuː/",        zh:"字母 Q", example:"queen",     exampleZh:"女王",   emoji:"👸", exEn:"Q is for queen.",     exZh:"Q 像女王的 Q。" },
    { id:"a_r", letter:"Rr", ipa:"/ɑːr/",         zh:"字母 R", example:"rabbit",    exampleZh:"兔子",   emoji:"🐰", exEn:"R is for rabbit.",    exZh:"R 像兔子的 R。" },
    { id:"a_s", letter:"Ss", ipa:"/ɛs/",          zh:"字母 S", example:"sun",       exampleZh:"太阳",   emoji:"☀️", exEn:"S is for sun.",       exZh:"S 像太阳的 S。" },
    { id:"a_t", letter:"Tt", ipa:"/tiː/",         zh:"字母 T", example:"tiger",     exampleZh:"老虎",   emoji:"🐯", exEn:"T is for tiger.",     exZh:"T 像老虎的 T。" },
    { id:"a_u", letter:"Uu", ipa:"/juː/",         zh:"字母 U", example:"umbrella",  exampleZh:"伞",     emoji:"☂️", exEn:"U is for umbrella.",  exZh:"U 像雨伞的 U。" },
    { id:"a_v", letter:"Vv", ipa:"/viː/",         zh:"字母 V", example:"van",       exampleZh:"小货车", emoji:"🚐", exEn:"V is for van.",       exZh:"V 像小货车的 V。" },
    { id:"a_w", letter:"Ww", ipa:"/ˈdʌb.əl.juː/", zh:"字母 W", example:"water",     exampleZh:"水",     emoji:"💧", exEn:"W is for water.",     exZh:"W 像水的 W。" },
    { id:"a_x", letter:"Xx", ipa:"/ɛks/",         zh:"字母 X", example:"fox",       exampleZh:"狐狸",   emoji:"🦊", exEn:"X is for fox.",       exZh:"X 在 fox 的结尾。" },
    { id:"a_y", letter:"Yy", ipa:"/waɪ/",         zh:"字母 Y", example:"yellow",    exampleZh:"黄色",   emoji:"💛", exEn:"Y is for yellow.",    exZh:"Y 像黄色的 Y。" },
    { id:"a_z", letter:"Zz", ipa:"/ziː/",         zh:"字母 Z", example:"zoo",       exampleZh:"动物园", emoji:"🦓", exEn:"Z is for zoo.",       exZh:"Z 像动物园的 Z。" },
  ],
};

// ============================================================
// Phonic 规则标签 · 用于 PopQuiz 错答后的视觉提示
// ============================================================
// 规则 key:
//   silentE     - 词尾 e 不发音(魔法 e,让前元音说自己的名字)
//   silentB     - b 不发音(lamb 的 b)
//   silentW     - w 不发音(two 的 w)
//   doubleLetter- 两个相同字母连写(yellow 的 ll · tree 的 ee)
//
// 词 → 规则,大小写统一小写匹配
// ============================================================
const PHONIC_RULES = {
  // silent-e (魔法 e)
  'kite':  'silentE',
  'cute':  'silentE',
  'smile': 'silentE',
  'five':  'silentE',
  'like':  'silentE',
  'white': 'silentE',
  'nice':  'silentE',
  // silent-b
  'lamb':  'silentB',
  // silent-w
  'two':   'silentW',
  // 双字母
  'yellow':  'doubleLetter',  // ll
  'tree':    'doubleLetter',  // ee
  'see':     'doubleLetter',  // ee
  'bee':     'doubleLetter',  // ee
  'fleece':  'doubleLetter',  // ee
  'zoo':     'doubleLetter',  // oo
  'moon':    'doubleLetter',  // oo
  'rubber':  'doubleLetter',  // bb
  'happy':   'doubleLetter',  // pp
  'pepper':  'doubleLetter',  // pp
  'ball':    'doubleLetter',  // ll
  'hello':   'doubleLetter',  // ll
  'well':    'doubleLetter',  // ll
  'shh':     'doubleLetter',  // hh
};

// ============================================================
// 19 天核心词排课（与 data-sentences.js 的 DAILY_SENTENCES 对齐）
// 每个单元拆 2-3 天渐进引入，孩子当前 Unit 4 对应 Day 9
// ============================================================
const DAY_VOCAB = {
  // Unit 1 · Day 1-3 · 11 词 (4+4+3)
  1:  ["u1_lets","u1_count","u1_cool","u1_howmany"],
  2:  ["u1_marble","u1_one","u1_two","u1_three"],
  3:  ["u1_four","u1_yellow","u1_five"],
  // Unit 2 · Day 4-5 · 7 词 (4+3)
  4:  ["u2_pencil","u2_ouch","u2_sorry","u2_ok"],
  5:  ["u2_book","u2_ruler","u2_rubber"],
  // Unit 3 · Day 6-8 · 10 词 (4+3+3)
  6:  ["u3_like","u3_carrot","u3_metoo","u3_onion"],
  7:  ["u3_nothanks","u3_pea","u3_yesplease"],
  8:  ["u3_we","u3_all","u3_pepper"],
  // Unit 4 · Day 9-11 · 10 词 (4+3+3) ← 孩子当前位置
  9:  ["u4_spring","u4_the","u4_tree","u4_theyre"],
  10: ["u4_flower","u4_beautiful","u4_bird"],
  11: ["u4_happy","u4_kite","u4_colourful"],
  // Unit 5 · Day 12-13 · 7 词 (4+3)
  12: ["u5_whats","u5_whatsthis","u5_ladybird","u5_cute"],
  13: ["u5_cicada","u5_butterfly","u5_dragonfly"],
  // Unit 6 · Day 14-15 · 6 词 (3+3)
  14: ["u6_ready","u6_run","u6_jump"],
  15: ["u6_welldone","u6_hop","u6_walk"],
  // Unit 7 · Day 16-17 · 8 词 (4+4)
  16: ["u7_whatsthat","u7_shh","u7_pig","u7_baa"],
  17: ["u7_lamb","u7_quack","u7_duck","u7_cow"],
  // Unit 8 · Day 18-19 · 6 词 (3+3)
  18: ["u8_in","u8_bottle","u8_hankie"],
  19: ["u8_and","u8_sticker","u8_yoyo"],
};

// ============================================================
// Day 20+ 排课辅助（app.js 自动切片）
// Day 20-31: 每天 4 个歌谣词（共 46 个，12 天可覆盖）
// Day 32-44: 每天 2 个字母（共 26 个，13 天）
// Day 45-60: 综合复习（app.js 动态混合所有已学）
// ============================================================
const RHYME_ORDER = VOCAB.rhyme.map(w => w.id);       // 46 ids, 按单元顺序
const ALPHABET_ORDER = VOCAB.alphabet.map(w => w.id); // 26 ids, A→Z

// ============================================================
// 查词辅助
// ============================================================
function findVocab(id) {
  if (id.startsWith("u"))  return VOCAB.core.find(w => w.id === id);
  if (id.startsWith("r_")) return VOCAB.rhyme.find(w => w.id === id);
  if (id.startsWith("a_")) return VOCAB.alphabet.find(w => w.id === id);
  return null;
}

// 给 Day N 取今日要学的所有词（core + 歌谣 + 字母）
function getVocabForDay(N) {
  const ids = [];
  if (DAY_VOCAB[N]) ids.push(...DAY_VOCAB[N]);
  // Day 20+ 歌谣词：每天 4 个
  if (N >= 20 && N <= 31) {
    const offset = (N - 20) * 4;
    ids.push(...RHYME_ORDER.slice(offset, offset + 4));
  }
  // Day 32+ 字母：每天 2 个
  if (N >= 32 && N <= 44) {
    const offset = (N - 32) * 2;
    ids.push(...ALPHABET_ORDER.slice(offset, offset + 2));
  }
  return ids.map(findVocab).filter(Boolean);
}

// ============================================================
// 暴露到全局（供 app.js 使用）
// ⚠️ 必需：<script> 里的 const 不会自动挂 window
// ============================================================
if (typeof window !== 'undefined') {
  window.UNITS          = UNITS;
  window.VOCAB          = VOCAB;
  window.DAY_VOCAB      = DAY_VOCAB;
  window.RHYME_ORDER    = RHYME_ORDER;
  window.ALPHABET_ORDER = ALPHABET_ORDER;
  window.PHONIC_RULES   = PHONIC_RULES;
  window.findVocab      = findVocab;
  window.getVocabForDay = getVocabForDay;
}
