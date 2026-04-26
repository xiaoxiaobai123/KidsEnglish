/* ================================================================
 * data-mock-u3.js · Unit 3 真题模拟卷 (A 卷 / B 卷)
 * ----------------------------------------------------------------
 * 与 data-quiz.js 不同:这里的题目是固定的(非随机抽题),
 * 用于"真题模拟"印刷与做题,有答案版/试卷版两套打印模板。
 *
 * Audio/Image ref 复用 resolveQuizAsset:
 *   "vocab:u3_carrot" / "sent:s_u3_01"
 * ================================================================ */

const MOCK_PAPERS_U3 = {
  /* =============== A 卷 · 中等难度 (基础+综合,偏课文) =============== */
  A: {
    code: 'A',
    unit: 3,
    title: 'Unit 3 · I like carrots — 真题模拟 A 卷',
    subtitle: '基础综合卷 · 100 分 · 建议 30 分钟',
    totalPoints: 100,
    sections: [
      /* —— 一、听录音选出所听到的内容 (10 × 1' = 10') —— */
      {
        id: 1, type: 'listen-choose',
        title: '一、听录音,选出所听到的内容',
        hint: '播放录音,圈出听到的那个英文',
        pointsPerItem: 1,
        items: [
          { id:'mAq1_01', audio:'vocab:u3_like',    options:['like','lick','kite'],          correct:0 },
          { id:'mAq1_02', audio:'vocab:u3_carrot',  options:['carrot','cat','car'],          correct:0 },
          { id:'mAq1_03', audio:'vocab:u3_onion',   options:['onion','orange','open'],       correct:0 },
          { id:'mAq1_04', audio:'vocab:u3_pea',     options:['pea','pay','pig'],             correct:0 },
          { id:'mAq1_05', audio:'vocab:u3_pepper',  options:['pepper','paper','puppy'],      correct:0 },
          { id:'mAq1_06', audio:'vocab:u3_we',      options:['we','me','see'],               correct:0 },
          { id:'mAq1_07', audio:'vocab:u3_all',     options:['all','ball','apple'],          correct:0 },
          { id:'mAq1_08', audio:'vocab:r_u3_yummy', options:['yummy','mummy','jumpy'],       correct:0 },
          { id:'mAq1_09', audio:'vocab:r_u3_sweet', options:['sweet','sleep','seat'],        correct:0 },
          { id:'mAq1_10', audio:'vocab:r_u3_eat',   options:['eat','it','egg'],              correct:0 },
        ],
      },

      /* —— 二、听句子,判断与图片是否相符 (6 × 1' = 6') —— */
      {
        id: 2, type: 'listen-judge',
        title: '二、听句子,判断与图片是否相符',
        hint: '相符在 ( ) 里写 ✓,不符写 ✗',
        pointsPerItem: 1,
        items: [
          { id:'mAq2_01', audio:'sent:s_u3_01', image:'sent:s_u3_01', correct:true  }, // 吃胡萝卜→图也是
          { id:'mAq2_02', audio:'sent:s_u3_02', image:'sent:s_u3_02', correct:true  }, // 拒绝洋葱
          { id:'mAq2_03', audio:'sent:s_u3_03', image:'sent:s_u3_04', correct:false }, // 豌豆→甜椒
          { id:'mAq2_04', audio:'sent:s_u3_04', image:'sent:s_u3_03', correct:false }, // 甜椒→豌豆
          { id:'mAq2_05', audio:'sent:s_u3_05', image:'sent:s_u3_05', correct:true  }, // 甜的
          { id:'mAq2_06', audio:'sent:s_u3_07', image:'sent:s_u3_07', correct:true  }, // yummy
        ],
      },

      /* —— 三、听单词/短句,判断与图片是否相符 (6 × 1' = 6') —— */
      {
        id: 3, type: 'listen-judge',
        title: '三、听单词,判断与图片是否相符',
        hint: '相符在 ( ) 里写 ✓,不符写 ✗',
        pointsPerItem: 1,
        items: [
          { id:'mAq3_01', audio:'vocab:u3_carrot', image:'vocab:u3_carrot', correct:true  },
          { id:'mAq3_02', audio:'vocab:u3_pea',    image:'vocab:u3_pepper', correct:false },
          { id:'mAq3_03', audio:'vocab:u3_onion',  image:'vocab:u3_onion',  correct:true  },
          { id:'mAq3_04', audio:'vocab:u3_pepper', image:'vocab:u3_carrot', correct:false },
          { id:'mAq3_05', audio:'vocab:u3_like',   image:'vocab:u3_like',   correct:true  },
          { id:'mAq3_06', audio:'vocab:u3_carrot', image:'vocab:u3_onion',  correct:false },
        ],
      },

      /* —— 四、听录音,给下列图片排序 (1 × 12' = 12') —— */
      {
        id: 4, type: 'listen-order',
        title: '四、听录音,给下列图片排序',
        hint: '按你听到的先后,在每张图下方括号写 1–6',
        pointsPerItem: 12,
        items: [
          {
            id: 'mAq4_01',
            // 实际听到顺序(答案):s_u3_03 → s_u3_01 → s_u3_07 → s_u3_02 → s_u3_05 → s_u3_04
            sequence: ['sent:s_u3_03','sent:s_u3_01','sent:s_u3_07','sent:s_u3_02','sent:s_u3_05','sent:s_u3_04'],
            // 显示给孩子的图(乱序)
            images:   ['sent:s_u3_01','sent:s_u3_02','sent:s_u3_03','sent:s_u3_04','sent:s_u3_05','sent:s_u3_07'],
          },
        ],
      },

      /* —— 五、听问句,选答句 (6 × 2' = 12') —— */
      {
        id: 5, type: 'listen-response',
        title: '五、听问句,选出相应的答句',
        hint: '听问句 → 圈出最合适的英文答句',
        pointsPerItem: 2,
        items: [
          { id:'mAq5_01', audio:'quiz:u3q5_01', audioText:'Do you like carrots?',
            options:['Yes, I do.','Me too.','No, thanks.'], correct:0 },
          { id:'mAq5_02', audio:'quiz:u3q5_02', audioText:'An onion?',
            options:['No, thanks.','Yes, please.','Look!'], correct:0 },
          { id:'mAq5_03', audio:'quiz:u3q5_03', audioText:'A pea?',
            options:['Yes, please.','No, I don’t.','Hi.'], correct:0 },
          { id:'mAq5_04', audio:'quiz:u3q5_04', audioText:'I like peppers.',
            options:['Me too.','No, thanks.','Yes, I do.'], correct:0 },
          { id:'mAq5_05', audio:'quiz:u3q5_06', audioText:'Are peas sweet?',
            options:['Yes, they are.','No, thanks.','I like them.'], correct:0 },
          { id:'mAq5_06', audio:'quiz:u3q5_10', audioText:'How many peas?',
            options:['Five peas.','Three books.','Me too.'], correct:0 },
        ],
      },

      /* —— 六、听对话,选词填空 (5 空 × 2' = 10') —— */
      {
        id: 6, type: 'listen-fill',
        title: '六、听对话,从方框中选出正确的单词补全对话',
        hint: '词库:carrots / too / onion / pea / peppers',
        pointsPerItem: 2,
        items: [
          {
            id: 'mAq6_01',
            audio: 'quiz:u3q6_01',
            audioText: 'I like carrots. Me too! An onion? No, thanks. A pea? Yes, please. We all like peppers.',
            pool: ['carrots','too','onion','pea','peppers'],
            dialog: [
              { speaker:'A', parts:[{t:'I like '},{blank:'carrots'},{t:'.'}] },
              { speaker:'B', parts:[{t:'Me '},{blank:'too'},{t:'!'}] },
              { speaker:'A', parts:[{t:'An '},{blank:'onion'},{t:'? No, thanks.'}] },
              { speaker:'B', parts:[{t:'A '},{blank:'pea'},{t:'? Yes, please.'}] },
              { speaker:'A', parts:[{t:'We all like '},{blank:'peppers'},{t:'.'}] },
            ],
          },
        ],
      },

      /* —— 七、写出下列字母的左邻右舍 (4 × 1' = 4') —— */
      {
        id: 7, type: 'letter-neighbor',
        title: '七、写出下列字母的左邻右舍',
        hint: '把前一个 / 后一个字母写在横线上',
        pointsPerItem: 1,
        items: [
          { id:'mAq7_01', letter:'Cc', before:'Bb', after:'Dd' },
          { id:'mAq7_02', letter:'Hh', before:'Gg', after:'Ii' },
          { id:'mAq7_03', letter:'Mm', before:'Ll', after:'Nn' },
          { id:'mAq7_04', letter:'Tt', before:'Ss', after:'Uu' },
        ],
      },

      /* —— 八、选出每组中不同类的一项 (8 × 1' = 8') —— */
      {
        id: 8, type: 'odd-one-out',
        title: '八、选出每组中不同类的一项',
        hint: '把不一样的那个圈出来',
        pointsPerItem: 1,
        items: [
          { id:'mAq8_01', items:['carrot','pea','pepper','book'],   correct:3, note:'三蔬菜' },
          { id:'mAq8_02', items:['like','eat','walk','onion'],      correct:3, note:'三动词' },
          { id:'mAq8_03', items:['onion','apple','pear','cake'],    correct:0, note:'onion 蔬菜' },
          { id:'mAq8_04', items:['yes','no','please','pepper'],     correct:3, note:'pepper 蔬菜' },
          { id:'mAq8_05', items:['me','we','you','pea'],            correct:3, note:'三代词' },
          { id:'mAq8_06', items:['sweet','yummy','green','book'],   correct:3, note:'三形容词' },
          { id:'mAq8_07', items:['carrot','onion','pea','five'],    correct:3, note:'five 数字' },
          { id:'mAq8_08', items:['green','red','yellow','pea'],     correct:3, note:'三颜色' },
        ],
      },

      /* —— 九、判断下列句子与图片是否相符 (6 × 1' = 6') —— */
      {
        id: 9, type: 'pic-judge',
        title: '九、看图,判断英文句子是否与图相符',
        hint: '相符 ✓,不符 ✗',
        pointsPerItem: 1,
        items: [
          { id:'mAq9_01', image:'vocab:u3_carrot', text:'It’s a carrot.', correct:true  },
          { id:'mAq9_02', image:'vocab:u3_onion',  text:'It’s a pea.',    correct:false },
          { id:'mAq9_03', image:'vocab:u3_pepper', text:'It’s a pepper.', correct:true  },
          { id:'mAq9_04', image:'sent:s_u3_01',    text:'I like carrots.',     correct:true  },
          { id:'mAq9_05', image:'sent:s_u3_02',    text:'A pea? Yes, please.', correct:false },
          { id:'mAq9_06', image:'sent:s_u3_04',    text:'We all like peppers.',correct:true  },
        ],
      },

      /* —— 十、情景选择 (8 × 1' = 8') —— */
      {
        id: 10, type: 'scenario',
        title: '十、情景选择',
        hint: '根据中文场景,圈出最合适的英文',
        pointsPerItem: 1,
        items: [
          { id:'mAq10_01', scene:'同学请你吃胡萝卜,你想吃,说:',
            options:['Yes, please.','No, thanks.','Me too.'], correct:0 },
          { id:'mAq10_02', scene:'别人让你吃洋葱,你不想吃,说:',
            options:['No, thanks.','Yes, please.','Hi.'], correct:0 },
          { id:'mAq10_03', scene:'你喜欢豌豆,朋友也喜欢,他说:',
            options:['Me too.','No.','Bye.'], correct:0 },
          { id:'mAq10_04', scene:'夸豌豆很好吃:',
            options:['They’re yummy!','I’m sorry.','Three peas.'], correct:0 },
          { id:'mAq10_05', scene:'告诉朋友自己喜欢胡萝卜:',
            options:['I like carrots.','A pea, please.','Hello.'], correct:0 },
          { id:'mAq10_06', scene:'问朋友喜不喜欢甜椒:',
            options:['Do you like peppers?','What’s this?','Bye!'], correct:0 },
          { id:'mAq10_07', scene:'有人感谢你递了胡萝卜,你回应:',
            options:['You’re welcome.','No, thanks.','Hi.'], correct:0 },
          { id:'mAq10_08', scene:'告诉大家"我们都喜欢甜椒":',
            options:['We all like peppers.','I like onions.','How many?'], correct:0 },
        ],
      },

      /* —— 十一、连线题 · 6 对 × 2' = 12' —— */
      {
        id: 11, type: 'match-columns',
        title: '十一、从右栏中选出左栏问句的答语',
        hint: '把对应字母写在左栏后的括号里',
        pointsPerItem: 2,
        items: [
          {
            id: 'mAq11_01',
            pairs: [
              { q:'Do you like carrots?',  a:'Yes, I do.' },
              { q:'An onion?',             a:'No, thanks.' },
              { q:'A pea?',                a:'Yes, please.' },
              { q:'I like peppers.',       a:'Me too.' },
              { q:'How many peas?',        a:'Five peas.' },
              { q:'Are peas sweet?',       a:'Yes, they are.' },
            ],
          },
        ],
      },

      /* —— 十二、对话补全 · 6 空 × 1' = 6' —— */
      {
        id: 12, type: 'dialog-fill',
        title: '十二、从词库中选词补全对话',
        hint: '词库:like / carrots / Me / please / No / peppers',
        pointsPerItem: 1,
        items: [
          {
            id: 'mAq12_01',
            pool: ['like','carrots','Me','please','No','peppers'],
            dialog: [
              { speaker:'A', parts:[{t:'I '},{blank:'like'},{t:' '},{blank:'carrots'},{t:'.'}] },
              { speaker:'B', parts:[{blank:'Me'},{t:' too!'}] },
              { speaker:'A', parts:[{t:'An onion? '},{blank:'No'},{t:', thanks.'}] },
              { speaker:'B', parts:[{t:'A pea? Yes, '},{blank:'please'},{t:'.'}] },
              { speaker:'A', parts:[{t:'We all like '},{blank:'peppers'},{t:'.'}] },
            ],
          },
        ],
      },
    ],
  },

  /* =============== B 卷 · 拔高难度 (扩词+辨易混) =============== */
  B: {
    code: 'B',
    unit: 3,
    title: 'Unit 3 · I like carrots — 真题模拟 B 卷',
    subtitle: '能力提升卷 · 100 分 · 建议 35 分钟',
    totalPoints: 100,
    sections: [
      /* —— 一、听音选词 (10 × 1' = 10') · 加入跨单元易混 —— */
      {
        id: 1, type: 'listen-choose',
        title: '一、听录音,选出所听到的内容',
        hint: '听 → 圈',
        pointsPerItem: 1,
        items: [
          { id:'mBq1_01', audio:'vocab:u3_pea',     options:['pea','pay','bee'],         correct:0 },
          { id:'mBq1_02', audio:'vocab:u3_pepper',  options:['pepper','paper','pizza'],  correct:0 },
          { id:'mBq1_03', audio:'vocab:u3_onion',   options:['onion','open','only'],     correct:0 },
          { id:'mBq1_04', audio:'vocab:u3_carrot',  options:['carrot','cat','candy'],    correct:0 },
          { id:'mBq1_05', audio:'vocab:u3_like',    options:['like','look','lake'],      correct:0 },
          { id:'mBq1_06', audio:'vocab:u3_we',      options:['we','me','three'],         correct:0 },
          { id:'mBq1_07', audio:'vocab:r_u3_sweet', options:['sweet','street','sleep'],  correct:0 },
          { id:'mBq1_08', audio:'vocab:r_u3_yummy', options:['yummy','mummy','funny'],   correct:0 },
          { id:'mBq1_09', audio:'vocab:u2_book',    options:['book','look','foot'],      correct:0 },
          { id:'mBq1_10', audio:'vocab:u4_green',   options:['green','grin','grow'],     correct:0 },
        ],
      },

      /* —— 二、听句子判断 (6 × 1' = 6') · 全句子混合 —— */
      {
        id: 2, type: 'listen-judge',
        title: '二、听句子,判断与图片是否相符',
        hint: '相符 ✓,不符 ✗',
        pointsPerItem: 1,
        items: [
          { id:'mBq2_01', audio:'sent:s_u3_03', image:'sent:s_u3_03', correct:true  }, // 豌豆
          { id:'mBq2_02', audio:'sent:s_u3_04', image:'sent:s_u3_04', correct:true  }, // 甜椒
          { id:'mBq2_03', audio:'sent:s_u3_01', image:'sent:s_u3_02', correct:false }, // 胡萝卜→拒绝洋葱
          { id:'mBq2_04', audio:'sent:s_u3_07', image:'sent:s_u3_05', correct:false }, // yummy→sweet
          { id:'mBq2_05', audio:'sent:s_u3_08', image:'sent:s_u3_08', correct:true  }, // yes I do
          { id:'mBq2_06', audio:'sent:s_u3_06', image:'sent:s_u3_06', correct:true  }, // 大家吃豌豆
        ],
      },

      /* —— 三、听单词判图 (6 × 1' = 6') · 全易混 —— */
      {
        id: 3, type: 'listen-judge',
        title: '三、听单词,判断与图片是否相符',
        hint: '相符 ✓,不符 ✗',
        pointsPerItem: 1,
        items: [
          { id:'mBq3_01', audio:'vocab:u3_carrot', image:'vocab:u3_pepper', correct:false },
          { id:'mBq3_02', audio:'vocab:u3_onion',  image:'vocab:u3_onion',  correct:true  },
          { id:'mBq3_03', audio:'vocab:u3_pea',    image:'vocab:u3_pea',    correct:true  },
          { id:'mBq3_04', audio:'vocab:u3_pepper', image:'vocab:u3_onion',  correct:false },
          { id:'mBq3_05', audio:'vocab:u3_we',     image:'vocab:u3_we',     correct:true  },
          { id:'mBq3_06', audio:'vocab:u3_all',    image:'vocab:u3_we',     correct:false },
        ],
      },

      /* —— 四、听录音排序 (12') —— */
      {
        id: 4, type: 'listen-order',
        title: '四、听录音,给下列图片排序',
        hint: '按播放顺序在括号写 1–6',
        pointsPerItem: 12,
        items: [
          {
            id: 'mBq4_01',
            sequence: ['sent:s_u3_04','sent:s_u3_07','sent:s_u3_02','sent:s_u3_06','sent:s_u3_01','sent:s_u3_03'],
            images:   ['sent:s_u3_01','sent:s_u3_02','sent:s_u3_03','sent:s_u3_04','sent:s_u3_06','sent:s_u3_07'],
          },
        ],
      },

      /* —— 五、听问句选答句 (6 × 2' = 12') —— */
      {
        id: 5, type: 'listen-response',
        title: '五、听问句,选出相应的答句',
        hint: '听 → 圈',
        pointsPerItem: 2,
        items: [
          { id:'mBq5_01', audio:'quiz:u3q5_07', audioText:'Do you like onions?',
            options:['No, thanks.','Yes, please.','Me too.'], correct:0 },
          { id:'mBq5_02', audio:'quiz:u3q5_02', audioText:'An onion?',
            options:['No, thanks.','Hi.','Look!'], correct:0 },
          { id:'mBq5_03', audio:'quiz:u3q5_05', audioText:'What colour are peas?',
            options:['Green.','Red.','Yellow.'], correct:0 },
          { id:'mBq5_04', audio:'quiz:u3q5_08', audioText:'Carrots, please.',
            options:['Here you are.','No, thanks.','Look!'], correct:0 },
          { id:'mBq5_05', audio:'quiz:u3q5_09', audioText:'Thank you.',
            options:['You’re welcome.','Me too.','Yes, please.'], correct:0 },
          { id:'mBq5_06', audio:'quiz:u3q5_11', audioText:'Yummy!',
            options:['Me too!','No.','Bye.'], correct:0 },
        ],
      },

      /* —— 六、听对话填空 (5 空 × 2' = 10') —— */
      {
        id: 6, type: 'listen-fill',
        title: '六、听对话,从方框中选出正确的单词补全',
        hint: '词库:like / yummy / sweet / green / Me',
        pointsPerItem: 2,
        items: [
          {
            id: 'mBq6_01',
            audio: 'quiz:u3q6_01',
            audioText: 'I like peas. Me too! Peas are green and sweet. They’re yummy.',
            pool: ['like','Me','green','sweet','yummy'],
            dialog: [
              { speaker:'A', parts:[{t:'I '},{blank:'like'},{t:' peas.'}] },
              { speaker:'B', parts:[{blank:'Me'},{t:' too!'}] },
              { speaker:'A', parts:[{t:'Peas are '},{blank:'green'},{t:' and '},{blank:'sweet'},{t:'.'}] },
              { speaker:'B', parts:[{t:'They’re '},{blank:'yummy'},{t:'!'}] },
            ],
          },
        ],
      },

      /* —— 七、字母左邻右舍 (4 × 1' = 4') —— */
      {
        id: 7, type: 'letter-neighbor',
        title: '七、写出下列字母的左邻右舍',
        hint: '前一个 / 后一个',
        pointsPerItem: 1,
        items: [
          { id:'mBq7_01', letter:'Ee', before:'Dd', after:'Ff' },
          { id:'mBq7_02', letter:'Kk', before:'Jj', after:'Ll' },
          { id:'mBq7_03', letter:'Pp', before:'Oo', after:'Qq' },
          { id:'mBq7_04', letter:'Vv', before:'Uu', after:'Ww' },
        ],
      },

      /* —— 八、不同类 (8 × 1' = 8') —— */
      {
        id: 8, type: 'odd-one-out',
        title: '八、选出每组中不同类的一项',
        hint: '不一样的圈出来',
        pointsPerItem: 1,
        items: [
          { id:'mBq8_01', items:['book','pencil','ruler','carrot'], correct:3, note:'三学习用品' },
          { id:'mBq8_02', items:['eat','like','love','pepper'],     correct:3, note:'三动词' },
          { id:'mBq8_03', items:['pea','peas','pear','pepper'],     correct:2, note:'pear 水果' },
          { id:'mBq8_04', items:['yes','please','thanks','carrot'], correct:3, note:'三礼貌词' },
          { id:'mBq8_05', items:['me','we','all','carrot'],         correct:3, note:'三代词/量' },
          { id:'mBq8_06', items:['tree','flower','bird','carrot'],  correct:3, note:'三春天物' },
          { id:'mBq8_07', items:['one','two','three','like'],       correct:3, note:'三数字' },
          { id:'mBq8_08', items:['sweet','yummy','green','book'],   correct:3, note:'三形容词' },
        ],
      },

      /* —— 九、看图判句 (6 × 1' = 6') —— */
      {
        id: 9, type: 'pic-judge',
        title: '九、看图,判断英文句子是否与图相符',
        hint: '相符 ✓,不符 ✗',
        pointsPerItem: 1,
        items: [
          { id:'mBq9_01', image:'vocab:u3_pea',    text:'It’s a pea.',                 correct:true  },
          { id:'mBq9_02', image:'vocab:u3_onion',  text:'It’s a carrot.',              correct:false },
          { id:'mBq9_03', image:'vocab:u3_pepper', text:'It’s an onion.',              correct:false },
          { id:'mBq9_04', image:'sent:s_u3_03',    text:'A pea? Yes, please.',              correct:true  },
          { id:'mBq9_05', image:'sent:s_u3_04',    text:'We all like peppers.',             correct:true  },
          { id:'mBq9_06', image:'sent:s_u3_07',    text:'An onion? No, thanks.',            correct:false },
        ],
      },

      /* —— 十、情景选择 (8 × 1' = 8') —— */
      {
        id: 10, type: 'scenario',
        title: '十、情景选择',
        hint: '根据中文场景,圈出最合适的英文',
        pointsPerItem: 1,
        items: [
          { id:'mBq10_01', scene:'朋友问你想吃豌豆吗,你想:',
            options:['Yes, please.','No, I don’t.','Look!'], correct:0 },
          { id:'mBq10_02', scene:'你不喜欢洋葱,有人请你吃:',
            options:['No, thanks.','Me too.','Yes, please.'], correct:0 },
          { id:'mBq10_03', scene:'同桌说"I like peppers.",你也喜欢:',
            options:['Me too.','No, thanks.','I’m sorry.'], correct:0 },
          { id:'mBq10_04', scene:'描述豌豆的颜色和味道:',
            options:['Peas are sweet and green.','Peas are red.','Peas are big.'], correct:0 },
          { id:'mBq10_05', scene:'夸食物好吃:',
            options:['Yummy!','Sorry.','Bye.'], correct:0 },
          { id:'mBq10_06', scene:'问"你喜欢胡萝卜吗?":',
            options:['Do you like carrots?','What’s this?','How many?'], correct:0 },
          { id:'mBq10_07', scene:'告诉别人"我们都爱吃甜椒":',
            options:['We all like peppers.','I like onions.','It’s a pea.'], correct:0 },
          { id:'mBq10_08', scene:'有人说"Thank you.",你回:',
            options:['You’re welcome.','Me too.','No, thanks.'], correct:0 },
        ],
      },

      /* —— 十一、连线 (6 × 2' = 12') —— */
      {
        id: 11, type: 'match-columns',
        title: '十一、从右栏中选出左栏问句的答语',
        hint: '把对应字母写在括号里',
        pointsPerItem: 2,
        items: [
          {
            id: 'mBq11_01',
            pairs: [
              { q:'A pea?',                a:'Yes, please.' },
              { q:'An onion?',             a:'No, thanks.' },
              { q:'Do you like peppers?',  a:'Yes, I do.' },
              { q:'I like carrots.',       a:'Me too.' },
              { q:'How many carrots?',     a:'Three carrots.' },
              { q:'Thank you.',            a:'You’re welcome.' },
            ],
          },
        ],
      },

      /* —— 十二、对话补全 (6 空 × 1' = 6') —— */
      {
        id: 12, type: 'dialog-fill',
        title: '十二、从词库中选词补全对话',
        hint: '词库:like / pea / yummy / Yes / sweet / Me',
        pointsPerItem: 1,
        items: [
          {
            id: 'mBq12_01',
            pool: ['like','pea','yummy','Yes','sweet','Me'],
            dialog: [
              { speaker:'A', parts:[{t:'A '},{blank:'pea'},{t:'? '},{blank:'Yes'},{t:', please.'}] },
              { speaker:'B', parts:[{t:'I '},{blank:'like'},{t:' peas.'}] },
              { speaker:'A', parts:[{blank:'Me'},{t:' too! Peas are '},{blank:'sweet'},{t:'.'}] },
              { speaker:'B', parts:[{t:'They’re '},{blank:'yummy'},{t:'!'}] },
            ],
          },
        ],
      },
    ],
  },
};

/* ==================== 答案抽取助手 ==================== */
function getMockAnswerString(section, item) {
  const t = section.type;
  if (t === 'listen-choose' || t === 'odd-one-out' || t === 'scenario' || t === 'listen-response') {
    const idx = item.correct;
    const opts = item.options || item.items;
    if (opts && opts[idx] != null) return `${String.fromCharCode(65 + idx)}. ${opts[idx]}`;
  }
  if (t === 'listen-judge' || t === 'pic-judge') {
    return item.correct ? '✓' : '✗';
  }
  if (t === 'letter-neighbor') {
    return `${item.before}  ${item.letter}  ${item.after}`;
  }
  if (t === 'listen-order') {
    // 答案 = 排序: 输入图片在 sequence 中的位置
    const indexMap = item.images.map(imgRef => item.sequence.indexOf(imgRef) + 1);
    return indexMap.join(' / ');
  }
  if (t === 'match-columns') {
    return item.pairs.map((p, i) => `${String.fromCharCode(65 + i)} → ${i + 1}`).join('  ');
  }
  if (t === 'dialog-fill' || t === 'listen-fill') {
    const blanks = [];
    item.dialog.forEach(line => {
      line.parts.forEach(p => { if (p.blank) blanks.push(p.blank); });
    });
    return blanks.join(' / ');
  }
  return '—';
}

/* ==================== 暴露 ==================== */
if (typeof window !== 'undefined') {
  window.MOCK_PAPERS_U3 = MOCK_PAPERS_U3;
  window.getMockAnswerString = getMockAnswerString;
}
