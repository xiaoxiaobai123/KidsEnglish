/* ================================================================
 * data-quiz.js · 单元测验题库（对齐译林版一下真考卷格式）
 * ----------------------------------------------------------------
 * 结构:
 *   QUIZ_BANKS[unit] = {
 *     unit, title, totalPoints,
 *     sections: [ { id, type, title, bank: [...], pickCount, pointsPerItem, ... } ]
 *   }
 *
 * 12 种题型（type 字段）:
 *   1. listen-choose    · 听录音选词 (单词 + 3 选项)
 *   2. listen-judge     · 听句子判断 ✓/✗
 *   3. listen-pic       · 听录音判断图片 ✓/✗
 *   4. listen-order     · 听录音给图片排序
 *   5. listen-response  · 听问句选答句
 *   6. listen-fill      · 听对话填单词 (对话 + 6 空)
 *   7. letter-neighbor  · 字母左邻右舍
 *   8. odd-one-out      · 不同类
 *   9. pic-judge        · 图片与句子判断 ✓/✗
 *  10. scenario         · 情景选择（中文场景 → 英文）
 *  11. match-columns    · 左右栏连线
 *  12. dialog-fill      · 对话补全（词库填空）
 *
 * Audio ref:
 *   "vocab:u4_tree"      → audio/vocab/u4_tree.mp3
 *   "sent:s_u4_01"       → audio/sentences/s_u4_01.mp3
 *   "quiz:q_xxx"         → audio/quiz/q_xxx.mp3 （需专门生成）
 *
 * Image ref:
 *   "vocab:u4_tree"      → audio/images/vocab/u4_tree.jpg
 *   "sent:s_u4_01"       → audio/images/sentences/s_u4_01.jpg
 *   "quiz:qi_xxx"        → audio/images/quiz/qi_xxx.jpg
 * ================================================================ */

/* ==================== 跨单元共享的字母邻居题库 ==================== */
const SHARED_LETTER_NEIGHBORS = [
  { id:'qL_Bb', letter:'Bb', before:'Aa', after:'Cc' },
  { id:'qL_Cc', letter:'Cc', before:'Bb', after:'Dd' },
  { id:'qL_Dd', letter:'Dd', before:'Cc', after:'Ee' },
  { id:'qL_Ee', letter:'Ee', before:'Dd', after:'Ff' },
  { id:'qL_Ff', letter:'Ff', before:'Ee', after:'Gg' },
  { id:'qL_Gg', letter:'Gg', before:'Ff', after:'Hh' },
  { id:'qL_Hh', letter:'Hh', before:'Gg', after:'Ii' },
  { id:'qL_Ii', letter:'Ii', before:'Hh', after:'Jj' },
  { id:'qL_Jj', letter:'Jj', before:'Ii', after:'Kk' },
  { id:'qL_Kk', letter:'Kk', before:'Jj', after:'Ll' },
  { id:'qL_Ll', letter:'Ll', before:'Kk', after:'Mm' },
  { id:'qL_Mm', letter:'Mm', before:'Ll', after:'Nn' },
  { id:'qL_Nn', letter:'Nn', before:'Mm', after:'Oo' },
  { id:'qL_Oo', letter:'Oo', before:'Nn', after:'Pp' },
  { id:'qL_Pp', letter:'Pp', before:'Oo', after:'Qq' },
  { id:'qL_Qq', letter:'Qq', before:'Pp', after:'Rr' },
  { id:'qL_Rr', letter:'Rr', before:'Qq', after:'Ss' },
  { id:'qL_Ss', letter:'Ss', before:'Rr', after:'Tt' },
  { id:'qL_Tt', letter:'Tt', before:'Ss', after:'Uu' },
  { id:'qL_Uu', letter:'Uu', before:'Tt', after:'Vv' },
  { id:'qL_Vv', letter:'Vv', before:'Uu', after:'Ww' },
  { id:'qL_Ww', letter:'Ww', before:'Vv', after:'Xx' },
  { id:'qL_Xx', letter:'Xx', before:'Ww', after:'Yy' },
  { id:'qL_Yy', letter:'Yy', before:'Xx', after:'Zz' },
];

const QUIZ_BANKS = {
  /* ============================================================
   * Unit 1 · Let's count!
   * ============================================================ */
  1: {
    unit: 1, title: "Unit 1 · Let's count!", totalPoints: 100,
    sections: [
      { id:1, type:'listen-choose', title:'一、听录音选出所听到的内容', hint:'听词 → 选一个', pickCount:6, pointsPerItem:1, bank:[
        { id:'u1q1_01', audio:'vocab:u1_one',    options:['one','on','own'],       correct:0 },
        { id:'u1q1_02', audio:'vocab:u1_two',    options:['two','to','too'],       correct:0 },
        { id:'u1q1_03', audio:'vocab:u1_three',  options:['three','tree','free'],  correct:0 },
        { id:'u1q1_04', audio:'vocab:u1_four',   options:['four','fur','for'],     correct:0 },
        { id:'u1q1_05', audio:'vocab:u1_five',   options:['five','fine','fire'],   correct:0 },
        { id:'u1q1_06', audio:'vocab:u1_yellow', options:['yellow','yo-yo','yummy'],correct:0 },
        { id:'u1q1_07', audio:'vocab:u1_marble', options:['marble','marvel','mabel'],correct:0 },
        { id:'u1q1_08', audio:'vocab:u1_count',  options:['count','country','cool'],correct:0 },
        { id:'u1q1_09', audio:'vocab:u2_book',   options:['book','look','cook'],   correct:0 },
        { id:'u1q1_10', audio:'vocab:u3_pea',    options:['pea','pay','pig'],      correct:0 },
      ]},
      { id:2, type:'listen-judge', title:'二、听录音判断听到的内容与图片是否相符', hint:'相符 ✓ 不符 ✗', pickCount:6, pointsPerItem:1, bank:[
        { id:'u1q2_01', audio:'vocab:u1_one',   image:'vocab:u1_one',   correct:true  },
        { id:'u1q2_02', audio:'vocab:u1_two',   image:'vocab:u1_two',   correct:true  },
        { id:'u1q2_03', audio:'vocab:u1_three', image:'vocab:u1_three', correct:true  },
        { id:'u1q2_04', audio:'vocab:u1_four',  image:'vocab:u1_four',  correct:true  },
        { id:'u1q2_05', audio:'vocab:u1_five',  image:'vocab:u1_five',  correct:true  },
        { id:'u1q2_06', audio:'vocab:u1_one',   image:'vocab:u1_three', correct:false },
        { id:'u1q2_07', audio:'vocab:u1_two',   image:'vocab:u1_four',  correct:false },
        { id:'u1q2_08', audio:'vocab:u1_five',  image:'vocab:u1_one',   correct:false },
        { id:'u1q2_09', audio:'vocab:u1_yellow',image:'vocab:u1_yellow',correct:true  },
        { id:'u1q2_10', audio:'sent:s_u1_01',   image:'sent:s_u1_01',   correct:true  },
      ]},
      { id:3, type:'listen-judge', title:'三、听录音判断所听到的句子与图片是否相符', hint:'相符 ✓ 不符 ✗', pickCount:6, pointsPerItem:1, bank:[
        { id:'u1q3_01', audio:'sent:s_u1_01',  image:'sent:s_u1_01', correct:true  },
        { id:'u1q3_02', audio:'sent:s_u1_02',  image:'sent:s_u1_02', correct:true  },
        { id:'u1q3_03', audio:'sent:s_u1_03',  image:'sent:s_u1_03', correct:true  },
        { id:'u1q3_04', audio:'sent:s_u1_04',  image:'sent:s_u1_04', correct:true  },
        { id:'u1q3_05', audio:'sent:s_u1_01',  image:'sent:s_u1_03', correct:false },
        { id:'u1q3_06', audio:'sent:s_u1_02',  image:'sent:s_u1_04', correct:false },
        { id:'u1q3_07', audio:'vocab:u1_marble',image:'vocab:u1_marble', correct:true },
        { id:'u1q3_08', audio:'vocab:u1_marble',image:'vocab:u1_yellow', correct:false },
      ]},
      { id:4, type:'listen-order', title:'四、听录音给下列图片排序', hint:'按播放顺序给图片写 1–6', pickCount:1, pointsPerItem:12, bank:[{
        id:'u1q4_01',
        sequence:['sent:s_u1_02','sent:s_u1_01','sent:s_u1_04','sent:s_u1_03','sent:s_u1_07','sent:s_u1_08'],
        images:  ['sent:s_u1_01','sent:s_u1_02','sent:s_u1_03','sent:s_u1_04','sent:s_u1_07','sent:s_u1_08'],
      }]},
      { id:5, type:'listen-response', title:'五、听录音选出相应的答句', hint:'听问句 → 选答句', pickCount:6, pointsPerItem:2, bank:[
        { id:'u1q5_01', audio:'quiz:u1q5_01', audioText:"How many apples?",      options:["Three apples.","Me too.","Yes."], correct:0 },
        { id:'u1q5_02', audio:'quiz:u1q5_02', audioText:"Let's count to five!",  options:["Cool!","No, thanks.","Hi."],     correct:0 },
        { id:'u1q5_03', audio:'quiz:u1q5_03', audioText:"How many red marbles?", options:["Three red marbles.","Yes, I do.","Bye."], correct:0 },
        { id:'u1q5_04', audio:'quiz:u1q5_04', audioText:"What colour is it?",    options:["It's yellow.","It's a pea.","Me too."], correct:0 },
        { id:'u1q5_05', audio:'quiz:u1q5_05', audioText:"Four yellow marbles.",  options:["Cool!","Sorry.","Yes, please."],  correct:0 },
        { id:'u1q5_06', audio:'quiz:u1q5_06', audioText:"Can you count to ten?", options:["Yes, I can.","Me too.","Hello."], correct:0 },
        { id:'u1q5_07', audio:'quiz:u1q5_07', audioText:"One, two, three.",      options:["Four, five, six.","Me too.","Hi."], correct:0 },
        { id:'u1q5_08', audio:'quiz:u1q5_08', audioText:"How many birds?",       options:["Five birds.","I like birds.","Bye."], correct:0 },
      ]},
      { id:6, type:'listen-fill', title:'六、听录音选出正确的单词填空', hint:'听 → 填词', pickCount:1, pointsPerItem:10, bank:[{
        id:'u1q6_01', audio:'quiz:u1q6_01',
        audioText:"Look! How many red marbles? One, two, three. Three red marbles. Four yellow marbles. Cool!",
        pool:['red','Three','Four','yellow','Cool'],
        dialog:[
          { speaker:'A', parts:[{t:'Look! How many '}, {blank:'red'}, {t:' marbles?'}] },
          { speaker:'B', parts:[{t:'One, two, three. '}, {blank:'Three'}, {t:' red marbles.'}] },
          { speaker:'A', parts:[{blank:'Four'}, {t:' '}, {blank:'yellow'}, {t:' marbles.'}] },
          { speaker:'B', parts:[{blank:'Cool'}, {t:'!'}] },
        ],
      }]},
      { id:7, type:'letter-neighbor', title:'七、写出下列字母的左邻右舍', hint:'', pickCount:4, pointsPerItem:1, bank:'SHARED_LETTERS' },
      { id:8, type:'odd-one-out', title:'八、选出每组中不同类的一项', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u1q8_01', items:['one','two','three','book'],   correct:3 },
        { id:'u1q8_02', items:['red','yellow','green','five'], correct:3 },
        { id:'u1q8_03', items:['four','five','six','tree'],    correct:3 },
        { id:'u1q8_04', items:['marble','ball','book','three'], correct:3 },
        { id:'u1q8_05', items:['apple','pea','pepper','count'], correct:3 },
        { id:'u1q8_06', items:['cool','hi','hello','seven'],   correct:3 },
        { id:'u1q8_07', items:['one','yellow','two','three'],  correct:1 },
        { id:'u1q8_08', items:['marble','toy','game','carrot'], correct:3 },
        { id:'u1q8_09', items:['count','run','jump','marble'],  correct:3 },
        { id:'u1q8_10', items:['red','blue','green','two'],     correct:3 },
      ]},
      { id:9, type:'pic-judge', title:'九、判断下列句子与图片是否相符', hint:'', pickCount:4, pointsPerItem:1, bank:[
        { id:'u1q9_01', image:'vocab:u1_one',    text:"It's one.",       correct:true  },
        { id:'u1q9_02', image:'vocab:u1_three',  text:"It's three.",     correct:true  },
        { id:'u1q9_03', image:'vocab:u1_five',   text:"It's five.",      correct:true  },
        { id:'u1q9_04', image:'vocab:u1_yellow', text:"It's red.",       correct:false },
        { id:'u1q9_05', image:'vocab:u1_two',    text:"It's three.",     correct:false },
        { id:'u1q9_06', image:'vocab:u1_marble', text:"It's a marble.",  correct:true  },
        { id:'u1q9_07', image:'sent:s_u1_01',    text:"How many red marbles?", correct:true },
        { id:'u1q9_08', image:'sent:s_u1_03',    text:"Four yellow marbles.",  correct:true },
      ]},
      { id:10, type:'scenario', title:'十、情景选择', hint:'', pickCount:4, pointsPerItem:1, bank:[
        { id:'u1q10_01', scene:'想问别人有几个苹果：', options:["How many apples?","Me too.","Hi."], correct:0 },
        { id:'u1q10_02', scene:'数数到五,邀请朋友一起：', options:["Let's count to five!","Bye.","Sorry."], correct:0 },
        { id:'u1q10_03', scene:'说有三个红弹珠：', options:["Three red marbles.","Me too.","Cool."], correct:0 },
        { id:'u1q10_04', scene:'说东西很酷：', options:["Cool!","Sorry.","Bye."], correct:0 },
        { id:'u1q10_05', scene:'问要不要一起数数：', options:["Let's count!","No, thanks.","Look!"], correct:0 },
        { id:'u1q10_06', scene:'描述黄色弹珠：', options:["Yellow marbles.","Green birds.","Red trees."], correct:0 },
        { id:'u1q10_07', scene:'想问是否是五个：', options:["How many?","Me too.","Hi."], correct:0 },
        { id:'u1q10_08', scene:'打招呼：', options:["Hi!","No.","Sorry."], correct:0 },
      ]},
      { id:11, type:'match-columns', title:'十一、从 II 栏中选出 I 栏相对应的答句', hint:'', pickCount:1, pointsPerItem:12, bank:[{
        id:'u1q11_01', pairs:[
          { q:'How many apples?',      a:'Three apples.' },
          { q:"Let's count to five!",  a:'Cool!' },
          { q:'What colour is it?',    a:"It's yellow." },
          { q:'One, two, three.',      a:'Four, five, six.' },
          { q:'How many birds?',       a:'Five birds.' },
          { q:'Hello!',                a:'Hi!' },
        ],
      }]},
      { id:12, type:'dialog-fill', title:'十二、从方框中选出正确的单词补全对话', hint:'', pickCount:1, pointsPerItem:10, bank:[{
        id:'u1q12_01', pool:['many','Three','yellow','five','Cool'],
        dialog:[
          { speaker:'A', parts:[{t:'How '}, {blank:'many'}, {t:' red marbles?'}] },
          { speaker:'B', parts:[{blank:'Three'}, {t:' red marbles.'}] },
          { speaker:'A', parts:[{t:'Four '}, {blank:'yellow'}, {t:' marbles.'}] },
          { speaker:'B', parts:[{t:"Let's count to "}, {blank:'five'}, {t:'!'}] },
          { speaker:'A', parts:[{blank:'Cool'}, {t:'!'}] },
        ],
      }]},
    ],
  },

  /* ============================================================
   * Unit 2 · This is my pencil
   * ============================================================ */
  2: {
    unit: 2, title: "Unit 2 · This is my pencil", totalPoints: 100,
    sections: [
      { id:1, type:'listen-choose', title:'一、听录音选出所听到的内容', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u2q1_01', audio:'vocab:u2_pencil', options:['pencil','pen','penny'], correct:0 },
        { id:'u2q1_02', audio:'vocab:u2_book',   options:['book','look','cook'],   correct:0 },
        { id:'u2q1_03', audio:'vocab:u2_ruler',  options:['ruler','rubber','river'],correct:0 },
        { id:'u2q1_04', audio:'vocab:u2_rubber', options:['rubber','ruler','river'],correct:0 },
        { id:'u2q1_05', audio:'vocab:u1_one',    options:['one','on','own'],        correct:0 },
        { id:'u2q1_06', audio:'vocab:u1_two',    options:['two','too','to'],        correct:0 },
        { id:'u2q1_07', audio:'vocab:u3_carrot', options:['carrot','cat','car'],    correct:0 },
        { id:'u2q1_08', audio:'vocab:u1_yellow', options:['yellow','yo-yo','yummy'],correct:0 },
        { id:'u2q1_09', audio:'vocab:u1_five',   options:['five','four','fine'],    correct:0 },
        { id:'u2q1_10', audio:'vocab:u4_tree',   options:['tree','three','free'],   correct:0 },
      ]},
      { id:2, type:'listen-judge', title:'二、听录音判断听到的内容与图片是否相符', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u2q2_01', audio:'vocab:u2_pencil', image:'vocab:u2_pencil', correct:true  },
        { id:'u2q2_02', audio:'vocab:u2_book',   image:'vocab:u2_book',   correct:true  },
        { id:'u2q2_03', audio:'vocab:u2_ruler',  image:'vocab:u2_ruler',  correct:true  },
        { id:'u2q2_04', audio:'vocab:u2_rubber', image:'vocab:u2_rubber', correct:true  },
        { id:'u2q2_05', audio:'vocab:u2_pencil', image:'vocab:u2_book',   correct:false },
        { id:'u2q2_06', audio:'vocab:u2_ruler',  image:'vocab:u2_rubber', correct:false },
        { id:'u2q2_07', audio:'sent:s_u2_01',    image:'sent:s_u2_01',    correct:true  },
        { id:'u2q2_08', audio:'sent:s_u2_03',    image:'sent:s_u2_03',    correct:true  },
        { id:'u2q2_09', audio:'sent:s_u2_01',    image:'sent:s_u2_04',    correct:false },
        { id:'u2q2_10', audio:'sent:s_u2_04',    image:'sent:s_u2_05',    correct:false },
      ]},
      { id:3, type:'listen-judge', title:'三、听录音判断所听到的句子与图片是否相符', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u2q3_01', audio:'sent:s_u2_01', image:'sent:s_u2_01', correct:true },
        { id:'u2q3_02', audio:'sent:s_u2_03', image:'sent:s_u2_03', correct:true },
        { id:'u2q3_03', audio:'sent:s_u2_04', image:'sent:s_u2_04', correct:true },
        { id:'u2q3_04', audio:'sent:s_u2_05', image:'sent:s_u2_05', correct:true },
        { id:'u2q3_05', audio:'sent:s_u2_01', image:'sent:s_u2_05', correct:false },
        { id:'u2q3_06', audio:'sent:s_u2_02', image:'sent:s_u2_04', correct:false },
        { id:'u2q3_07', audio:'vocab:u2_pencil',image:'vocab:u2_pencil', correct:true },
        { id:'u2q3_08', audio:'vocab:u2_rubber',image:'vocab:u2_ruler', correct:false },
      ]},
      { id:4, type:'listen-order', title:'四、听录音给下列图片排序', hint:'', pickCount:1, pointsPerItem:12, bank:[{
        id:'u2q4_01',
        sequence:['sent:s_u2_03','sent:s_u2_01','sent:s_u2_04','sent:s_u2_05','sent:s_u2_07','sent:s_u2_06'],
        images:  ['sent:s_u2_01','sent:s_u2_03','sent:s_u2_04','sent:s_u2_05','sent:s_u2_06','sent:s_u2_07'],
      }]},
      { id:5, type:'listen-response', title:'五、听录音选出相应的答句', hint:'', pickCount:6, pointsPerItem:2, bank:[
        { id:'u2q5_01', audio:'quiz:u2q5_01', audioText:"Is this your pencil?",     options:["Yes, it is.","Me too.","No, thanks."], correct:0 },
        { id:'u2q5_02', audio:'quiz:u2q5_02', audioText:"Ouch!",                    options:["I'm sorry.","Hi.","Bye."],             correct:0 },
        { id:'u2q5_03', audio:'quiz:u2q5_03', audioText:"I'm sorry.",               options:["That's OK.","Me too.","Yes, I do."],  correct:0 },
        { id:'u2q5_04', audio:'quiz:u2q5_04', audioText:"What's this?",             options:["It's a book.","Me too.","Sorry."],    correct:0 },
        { id:'u2q5_05', audio:'quiz:u2q5_05', audioText:"How many rulers?",         options:["Two rulers.","Hi.","No, thanks."],     correct:0 },
        { id:'u2q5_06', audio:'quiz:u2q5_06', audioText:"Is this your rubber?",     options:["No, it's my ruler.","Me too.","Sorry."], correct:0 },
        { id:'u2q5_07', audio:'quiz:u2q5_07', audioText:"Hello, Cory.",             options:["Hi!","No.","Bye."],                    correct:0 },
        { id:'u2q5_08', audio:'quiz:u2q5_08', audioText:"Thank you.",               options:["You're welcome.","Me too.","Sorry."], correct:0 },
      ]},
      { id:6, type:'listen-fill', title:'六、听录音选出正确的单词填空', hint:'', pickCount:1, pointsPerItem:10, bank:[{
        id:'u2q6_01', audio:'quiz:u2q6_01',
        audioText:"This is my pencil. This is my book. Is this your ruler? Yes, it is. That's OK.",
        pool:['pencil','book','ruler','Yes','OK'],
        dialog:[
          { speaker:'A', parts:[{t:'This is my '}, {blank:'pencil'}, {t:'.'}] },
          { speaker:'A', parts:[{t:'This is my '}, {blank:'book'}, {t:'.'}] },
          { speaker:'B', parts:[{t:'Is this your '}, {blank:'ruler'}, {t:'?'}] },
          { speaker:'A', parts:[{blank:'Yes'}, {t:', it is.'}] },
          { speaker:'B', parts:[{t:"That's "}, {blank:'OK'}, {t:'.'}] },
        ],
      }]},
      { id:7, type:'letter-neighbor', title:'七、写出下列字母的左邻右舍', hint:'', pickCount:4, pointsPerItem:1, bank:'SHARED_LETTERS' },
      { id:8, type:'odd-one-out', title:'八、选出每组中不同类的一项', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u2q8_01', items:['pencil','book','ruler','carrot'], correct:3 },
        { id:'u2q8_02', items:['rubber','pencil','ruler','bird'], correct:3 },
        { id:'u2q8_03', items:['one','two','three','pencil'],     correct:3 },
        { id:'u2q8_04', items:['red','yellow','book','blue'],     correct:2 },
        { id:'u2q8_05', items:['sorry','ouch','hello','book'],    correct:3 },
        { id:'u2q8_06', items:['book','apple','pear','pea'],      correct:0 },
        { id:'u2q8_07', items:['my','your','his','pencil'],       correct:3 },
        { id:'u2q8_08', items:['yes','no','please','book'],       correct:3 },
        { id:'u2q8_09', items:['tree','flower','book','bird'],    correct:2 },
        { id:'u2q8_10', items:['pencil','book','ruler','rubber'], correct:null, note:'全都是学习用品,此题答案留空作示范' },
      ]},
      { id:9, type:'pic-judge', title:'九、判断下列句子与图片是否相符', hint:'', pickCount:4, pointsPerItem:1, bank:[
        { id:'u2q9_01', image:'vocab:u2_pencil', text:"This is my pencil.",  correct:true  },
        { id:'u2q9_02', image:'vocab:u2_book',   text:"This is my book.",    correct:true  },
        { id:'u2q9_03', image:'vocab:u2_ruler',  text:"This is my ruler.",   correct:true  },
        { id:'u2q9_04', image:'vocab:u2_rubber', text:"This is my pencil.",  correct:false },
        { id:'u2q9_05', image:'vocab:u2_book',   text:"This is my rubber.",  correct:false },
        { id:'u2q9_06', image:'sent:s_u2_01',    text:"This is my pencil.",  correct:true  },
        { id:'u2q9_07', image:'sent:s_u2_04',    text:"This is my ruler.",   correct:true  },
        { id:'u2q9_08', image:'sent:s_u2_05',    text:"This is my book.",    correct:false },
      ]},
      { id:10, type:'scenario', title:'十、情景选择', hint:'', pickCount:4, pointsPerItem:1, bank:[
        { id:'u2q10_01', scene:'展示你的铅笔：', options:["This is my pencil.","Bye.","No, thanks."], correct:0 },
        { id:'u2q10_02', scene:'不小心撞到同学：', options:["I'm sorry.","Cool!","Me too."], correct:0 },
        { id:'u2q10_03', scene:'同学说对不起,你说没关系：', options:["That's OK.","Yes, please.","No."], correct:0 },
        { id:'u2q10_04', scene:'问同学这是否是他的书：', options:["Is this your book?","What's this?","Me too."], correct:0 },
        { id:'u2q10_05', scene:'被东西撞到：', options:["Ouch!","Hi.","Yes."], correct:0 },
        { id:'u2q10_06', scene:'展示橡皮：', options:["This is my rubber.","Bye.","Me too."], correct:0 },
        { id:'u2q10_07', scene:'询问直尺属于谁：', options:["Is this your ruler?","What colour?","Me too."], correct:0 },
        { id:'u2q10_08', scene:'问对方要不要用铅笔：', options:["Pencil, please?","Cool!","Yes."], correct:0 },
      ]},
      { id:11, type:'match-columns', title:'十一、从 II 栏中选出 I 栏相对应的答句', hint:'', pickCount:1, pointsPerItem:12, bank:[{
        id:'u2q11_01', pairs:[
          { q:'Is this your book?',   a:'Yes, it is.' },
          { q:"I'm sorry.",           a:"That's OK." },
          { q:"What's this?",         a:"It's a pencil." },
          { q:'How many rulers?',     a:'Two rulers.' },
          { q:'Ouch!',                a:"I'm sorry." },
          { q:'Thank you.',           a:"You're welcome." },
        ],
      }]},
      { id:12, type:'dialog-fill', title:'十二、从方框中选出正确的单词补全对话', hint:'', pickCount:1, pointsPerItem:10, bank:[{
        id:'u2q12_01', pool:['pencil','my','book','Yes','sorry'],
        dialog:[
          { speaker:'A', parts:[{t:'This is '}, {blank:'my'}, {t:' '}, {blank:'pencil'}, {t:'.'}] },
          { speaker:'B', parts:[{t:'Is this your '}, {blank:'book'}, {t:'?'}] },
          { speaker:'A', parts:[{blank:'Yes'}, {t:', it is.'}] },
          { speaker:'B', parts:[{t:"I'm "}, {blank:'sorry'}, {t:'.'}] },
        ],
      }]},
    ],
  },

  /* ============================================================
   * Unit 6 · Are you ready?
   * ============================================================ */
  6: {
    unit: 6, title: "Unit 6 · Are you ready?", totalPoints: 100,
    sections: [
      { id:1, type:'listen-choose', title:'一、听录音选出所听到的内容', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u6q1_01', audio:'vocab:u6_run',  options:['run','rain','ran'],    correct:0 },
        { id:'u6q1_02', audio:'vocab:u6_jump', options:['jump','jam','gym'],    correct:0 },
        { id:'u6q1_03', audio:'vocab:u6_hop',  options:['hop','hope','hot'],    correct:0 },
        { id:'u6q1_04', audio:'vocab:u6_walk', options:['walk','work','wait'],  correct:0 },
        { id:'u6q1_05', audio:'vocab:u4_bird', options:['bird','bed','big'],    correct:0 },
        { id:'u6q1_06', audio:'vocab:u3_pea',  options:['pea','pay','pig'],     correct:0 },
        { id:'u6q1_07', audio:'vocab:u5_ladybird', options:['ladybird','butterfly','dragonfly'], correct:0 },
        { id:'u6q1_08', audio:'vocab:u1_three', options:['three','tree','free'], correct:0 },
      ]},
      { id:2, type:'listen-judge', title:'二、听录音判断听到的内容与图片是否相符', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u6q2_01', audio:'vocab:u6_run',  image:'vocab:u6_run',  correct:true  },
        { id:'u6q2_02', audio:'vocab:u6_jump', image:'vocab:u6_jump', correct:true  },
        { id:'u6q2_03', audio:'vocab:u6_hop',  image:'vocab:u6_hop',  correct:true  },
        { id:'u6q2_04', audio:'vocab:u6_walk', image:'vocab:u6_walk', correct:true  },
        { id:'u6q2_05', audio:'vocab:u6_run',  image:'vocab:u6_walk', correct:false },
        { id:'u6q2_06', audio:'vocab:u6_jump', image:'vocab:u6_hop',  correct:false },
        { id:'u6q2_07', audio:'sent:s_u6_01',  image:'sent:s_u6_01',  correct:true  },
        { id:'u6q2_08', audio:'sent:s_u6_02',  image:'sent:s_u6_03',  correct:false },
      ]},
      { id:3, type:'listen-judge', title:'三、听录音判断所听到的句子与图片是否相符', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u6q3_01', audio:'sent:s_u6_01', image:'sent:s_u6_01', correct:true },
        { id:'u6q3_02', audio:'sent:s_u6_02', image:'sent:s_u6_02', correct:true },
        { id:'u6q3_03', audio:'sent:s_u6_03', image:'sent:s_u6_03', correct:true },
        { id:'u6q3_04', audio:'sent:s_u6_04', image:'sent:s_u6_04', correct:true },
        { id:'u6q3_05', audio:'sent:s_u6_01', image:'sent:s_u6_03', correct:false },
        { id:'u6q3_06', audio:'vocab:u6_run', image:'vocab:u6_walk', correct:false },
        { id:'u6q3_07', audio:'vocab:u6_ready', image:'vocab:u6_ready', correct:true },
        { id:'u6q3_08', audio:'vocab:u6_walk', image:'vocab:u6_walk', correct:true },
      ]},
      { id:4, type:'listen-order', title:'四、听录音给下列图片排序', hint:'', pickCount:1, pointsPerItem:12, bank:[{
        id:'u6q4_01',
        sequence:['sent:s_u6_02','sent:s_u6_03','sent:s_u6_04','sent:s_u6_01','sent:s_u6_05','sent:s_u6_06'],
        images:  ['sent:s_u6_01','sent:s_u6_02','sent:s_u6_03','sent:s_u6_04','sent:s_u6_05','sent:s_u6_06'],
      }]},
      { id:5, type:'listen-response', title:'五、听录音选出相应的答句', hint:'', pickCount:6, pointsPerItem:2, bank:[
        { id:'u6q5_01', audio:'quiz:u6q5_01', audioText:"Are you ready?",         options:["Yes, let's go!","Me too.","Sorry."], correct:0 },
        { id:'u6q5_02', audio:'quiz:u6q5_02', audioText:"Let's run!",             options:["OK!","No, thanks.","Hi."],          correct:0 },
        { id:'u6q5_03', audio:'quiz:u6q5_03', audioText:"Well done!",             options:["Thank you.","Sorry.","No."],        correct:0 },
        { id:'u6q5_04', audio:'quiz:u6q5_04', audioText:"Can you jump?",          options:["Yes, I can.","Me too.","Bye."],     correct:0 },
        { id:'u6q5_05', audio:'quiz:u6q5_05', audioText:"Walk, please.",          options:["OK.","No.","Bye."],                 correct:0 },
        { id:'u6q5_06', audio:'quiz:u6q5_06', audioText:"Hop, hop, hop!",         options:["Fun!","Sorry.","Yes, please."],     correct:0 },
        { id:'u6q5_07', audio:'quiz:u6q5_07', audioText:"Can you walk?",          options:["Yes, I can.","Hi.","Me too."],      correct:0 },
        { id:'u6q5_08', audio:'quiz:u6q5_08', audioText:"Let's go!",              options:["Cool!","Sorry.","Bye."],            correct:0 },
      ]},
      { id:6, type:'listen-fill', title:'六、听录音选出正确的单词填空', hint:'', pickCount:1, pointsPerItem:10, bank:[{
        id:'u6q6_01', audio:'quiz:u6q6_01',
        audioText:"Are you ready? Let's go! Run, run, run! Well done! Jump, jump, jump! Walk!",
        pool:['ready','run','jump','walk','Well'],
        dialog:[
          { speaker:'A', parts:[{t:'Are you '}, {blank:'ready'}, {t:'?'}] },
          { speaker:'B', parts:[{t:"Let's go! "}, {blank:'run'}, {t:", "}, {blank:'run'}, {t:', run!'}] },
          { speaker:'A', parts:[{blank:'Well'}, {t:' done! Jump, '}, {blank:'jump'}, {t:', jump!'}] },
          { speaker:'B', parts:[{blank:'walk'}, {t:'!'}] },
        ],
      }]},
      { id:7, type:'letter-neighbor', title:'七、写出下列字母的左邻右舍', hint:'', pickCount:4, pointsPerItem:1, bank:'SHARED_LETTERS' },
      { id:8, type:'odd-one-out', title:'八、选出每组中不同类的一项', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u6q8_01', items:['run','jump','walk','book'],  correct:3 },
        { id:'u6q8_02', items:['hop','run','jump','pencil'], correct:3 },
        { id:'u6q8_03', items:['ready','walk','jump','pear'], correct:3 },
        { id:'u6q8_04', items:['go','stop','walk','pig'],    correct:3 },
        { id:'u6q8_05', items:['one','two','run','three'],    correct:2 },
        { id:'u6q8_06', items:['cow','duck','run','pig'],     correct:2 },
        { id:'u6q8_07', items:['happy','sad','angry','run'],  correct:3 },
        { id:'u6q8_08', items:['red','blue','yellow','walk'], correct:3 },
      ]},
      { id:9, type:'pic-judge', title:'九、判断下列句子与图片是否相符', hint:'', pickCount:4, pointsPerItem:1, bank:[
        { id:'u6q9_01', image:'vocab:u6_run',  text:"Run, run, run!",  correct:true  },
        { id:'u6q9_02', image:'vocab:u6_jump', text:"Jump!",           correct:true  },
        { id:'u6q9_03', image:'vocab:u6_hop',  text:"Hop!",            correct:true  },
        { id:'u6q9_04', image:'vocab:u6_walk', text:"Run!",            correct:false },
        { id:'u6q9_05', image:'sent:s_u6_01',  text:"Are you ready?",  correct:true  },
        { id:'u6q9_06', image:'sent:s_u6_03',  text:"Jump, jump, jump!", correct:true },
        { id:'u6q9_07', image:'sent:s_u6_04',  text:"Walk!",            correct:true },
        { id:'u6q9_08', image:'sent:s_u6_02',  text:"Walk!",            correct:false },
      ]},
      { id:10, type:'scenario', title:'十、情景选择', hint:'', pickCount:4, pointsPerItem:1, bank:[
        { id:'u6q10_01', scene:'准备跑步时问大家：', options:["Are you ready?","Bye.","Me too."], correct:0 },
        { id:'u6q10_02', scene:'要出发时喊：', options:["Let's go!","No.","Sorry."], correct:0 },
        { id:'u6q10_03', scene:'夸同学做得好：', options:["Well done!","Sorry.","Bye."], correct:0 },
        { id:'u6q10_04', scene:'说"我们跑吧"：', options:["Let's run!","Me too.","Bye."], correct:0 },
        { id:'u6q10_05', scene:'让大家一起跳：', options:["Jump, jump, jump!","Sorry.","Me too."], correct:0 },
        { id:'u6q10_06', scene:'问朋友会不会单脚跳：', options:["Can you hop?","No!","Bye."], correct:0 },
        { id:'u6q10_07', scene:'让大家走：', options:["Walk!","Hi.","Sorry."], correct:0 },
        { id:'u6q10_08', scene:'别人夸你,你说谢谢：', options:["Thank you.","Me too.","Bye."], correct:0 },
      ]},
      { id:11, type:'match-columns', title:'十一、从 II 栏中选出 I 栏相对应的答句', hint:'', pickCount:1, pointsPerItem:12, bank:[{
        id:'u6q11_01', pairs:[
          { q:'Are you ready?', a:"Yes, let's go!" },
          { q:"Can you jump?",  a:'Yes, I can.' },
          { q:'Well done!',     a:'Thank you.' },
          { q:"Let's run!",     a:'OK!' },
          { q:'Hop, hop, hop!', a:'Fun!' },
          { q:'Walk, please.',  a:'OK.' },
        ],
      }]},
      { id:12, type:'dialog-fill', title:'十二、从方框中选出正确的单词补全对话', hint:'', pickCount:1, pointsPerItem:10, bank:[{
        id:'u6q12_01', pool:['ready','run','jump','Well','walk'],
        dialog:[
          { speaker:'A', parts:[{t:'Are you '}, {blank:'ready'}, {t:'?'}] },
          { speaker:'B', parts:[{t:"Let's "}, {blank:'run'}, {t:'!'}] },
          { speaker:'A', parts:[{blank:'Well'}, {t:' done! '}, {blank:'Jump'}, {t:'!'}] },
          { speaker:'B', parts:[{blank:'Walk'}, {t:'!'}] },
        ],
      }]},
    ],
  },

  /* ============================================================
   * Unit 7 · What's that?
   * ============================================================ */
  7: {
    unit: 7, title: "Unit 7 · What's that?", totalPoints: 100,
    sections: [
      { id:1, type:'listen-choose', title:'一、听录音选出所听到的内容', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u7q1_01', audio:'vocab:u7_pig',  options:['pig','peg','big'],   correct:0 },
        { id:'u7q1_02', audio:'vocab:u7_lamb', options:['lamb','lamp','land'], correct:0 },
        { id:'u7q1_03', audio:'vocab:u7_duck', options:['duck','dock','dark'], correct:0 },
        { id:'u7q1_04', audio:'vocab:u7_cow',  options:['cow','cot','cap'],    correct:0 },
        { id:'u7q1_05', audio:'vocab:u6_run',  options:['run','rain','ran'],   correct:0 },
        { id:'u7q1_06', audio:'vocab:u3_carrot', options:['carrot','cat','car'], correct:0 },
        { id:'u7q1_07', audio:'vocab:u4_bird', options:['bird','bed','big'],    correct:0 },
        { id:'u7q1_08', audio:'vocab:u1_three',options:['three','tree','free'], correct:0 },
      ]},
      { id:2, type:'listen-judge', title:'二、听录音判断听到的内容与图片是否相符', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u7q2_01', audio:'vocab:u7_pig',  image:'vocab:u7_pig',  correct:true  },
        { id:'u7q2_02', audio:'vocab:u7_lamb', image:'vocab:u7_lamb', correct:true  },
        { id:'u7q2_03', audio:'vocab:u7_duck', image:'vocab:u7_duck', correct:true  },
        { id:'u7q2_04', audio:'vocab:u7_cow',  image:'vocab:u7_cow',  correct:true  },
        { id:'u7q2_05', audio:'vocab:u7_pig',  image:'vocab:u7_cow',  correct:false },
        { id:'u7q2_06', audio:'vocab:u7_lamb', image:'vocab:u7_duck', correct:false },
        { id:'u7q2_07', audio:'sent:s_u7_01',  image:'sent:s_u7_01',  correct:true  },
        { id:'u7q2_08', audio:'sent:s_u7_04',  image:'sent:s_u7_02',  correct:false },
      ]},
      { id:3, type:'listen-judge', title:'三、听录音判断所听到的句子与图片是否相符', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u7q3_01', audio:'sent:s_u7_01', image:'sent:s_u7_01', correct:true },
        { id:'u7q3_02', audio:'sent:s_u7_02', image:'sent:s_u7_02', correct:true },
        { id:'u7q3_03', audio:'sent:s_u7_03', image:'sent:s_u7_03', correct:true },
        { id:'u7q3_04', audio:'sent:s_u7_04', image:'sent:s_u7_04', correct:true },
        { id:'u7q3_05', audio:'sent:s_u7_01', image:'sent:s_u7_04', correct:false },
        { id:'u7q3_06', audio:'sent:s_u7_03', image:'sent:s_u7_02', correct:false },
        { id:'u7q3_07', audio:'vocab:u7_pig', image:'vocab:u7_duck', correct:false },
        { id:'u7q3_08', audio:'vocab:u7_cow', image:'vocab:u7_cow',  correct:true },
      ]},
      { id:4, type:'listen-order', title:'四、听录音给下列图片排序', hint:'', pickCount:1, pointsPerItem:12, bank:[{
        id:'u7q4_01',
        sequence:['sent:s_u7_02','sent:s_u7_01','sent:s_u7_03','sent:s_u7_04','sent:s_u7_05','sent:s_u7_07'],
        images:  ['sent:s_u7_01','sent:s_u7_02','sent:s_u7_03','sent:s_u7_04','sent:s_u7_05','sent:s_u7_07'],
      }]},
      { id:5, type:'listen-response', title:'五、听录音选出相应的答句', hint:'', pickCount:6, pointsPerItem:2, bank:[
        { id:'u7q5_01', audio:'quiz:u7q5_01', audioText:"What's that?",          options:["It's a pig.","Me too.","Bye."],     correct:0 },
        { id:'u7q5_02', audio:'quiz:u7q5_02', audioText:"Baa!",                  options:["It's a lamb.","Hi.","No."],         correct:0 },
        { id:'u7q5_03', audio:'quiz:u7q5_03', audioText:"Quack!",                options:["It's a duck.","It's a pig.","Sorry."], correct:0 },
        { id:'u7q5_04', audio:'quiz:u7q5_04', audioText:"Is it a cow?",          options:["Yes, it is.","Me too.","Bye."],     correct:0 },
        { id:'u7q5_05', audio:'quiz:u7q5_05', audioText:"What colour is the pig?", options:["It's pink.","Me too.","No."],     correct:0 },
        { id:'u7q5_06', audio:'quiz:u7q5_06', audioText:"How many lambs?",       options:["Three lambs.","I'm happy.","Hi."],  correct:0 },
        { id:'u7q5_07', audio:'quiz:u7q5_07', audioText:"Can you see the cow?",  options:["Yes, I can.","Me too.","Sorry."],   correct:0 },
        { id:'u7q5_08', audio:'quiz:u7q5_08', audioText:"Shh! It's a pig.",      options:["OK.","Bye.","Me too."],             correct:0 },
      ]},
      { id:6, type:'listen-fill', title:'六、听录音选出正确的单词填空', hint:'', pickCount:1, pointsPerItem:10, bank:[{
        id:'u7q6_01', audio:'quiz:u7q6_01',
        audioText:"What's that? Shh! It's a pig. Baa! It's a lamb. Quack! It's a duck. It's a cow.",
        pool:['pig','lamb','duck','cow','Shh'],
        dialog:[
          { speaker:'A', parts:[{t:"What's that? "}, {blank:'Shh'}, {t:"! It's a "}, {blank:'pig'}, {t:'.'}] },
          { speaker:'B', parts:[{t:"Baa! It's a "}, {blank:'lamb'}, {t:'.'}] },
          { speaker:'A', parts:[{t:"Quack! It's a "}, {blank:'duck'}, {t:'.'}] },
          { speaker:'B', parts:[{t:"It's a "}, {blank:'cow'}, {t:'.'}] },
        ],
      }]},
      { id:7, type:'letter-neighbor', title:'七、写出下列字母的左邻右舍', hint:'', pickCount:4, pointsPerItem:1, bank:'SHARED_LETTERS' },
      { id:8, type:'odd-one-out', title:'八、选出每组中不同类的一项', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u7q8_01', items:['pig','cow','duck','book'],     correct:3 },
        { id:'u7q8_02', items:['lamb','duck','pig','pencil'],  correct:3 },
        { id:'u7q8_03', items:['cow','bird','butterfly','pig'],correct:2, note:'butterfly 是昆虫' },
        { id:'u7q8_04', items:['pink','black','white','cow'],   correct:3 },
        { id:'u7q8_05', items:['baa','quack','moo','jump'],     correct:3 },
        { id:'u7q8_06', items:['one','two','three','pig'],      correct:3 },
        { id:'u7q8_07', items:['dog','cat','cow','carrot'],     correct:3 },
        { id:'u7q8_08', items:['pig','tree','flower','bird'],   correct:0, note:'pig 是动物' },
      ]},
      { id:9, type:'pic-judge', title:'九、判断下列句子与图片是否相符', hint:'', pickCount:4, pointsPerItem:1, bank:[
        { id:'u7q9_01', image:'vocab:u7_pig',  text:"It's a pig.",  correct:true  },
        { id:'u7q9_02', image:'vocab:u7_lamb', text:"It's a lamb.", correct:true  },
        { id:'u7q9_03', image:'vocab:u7_duck', text:"It's a duck.", correct:true  },
        { id:'u7q9_04', image:'vocab:u7_cow',  text:"It's a pig.",  correct:false },
        { id:'u7q9_05', image:'sent:s_u7_01',  text:"It's a pig.",  correct:true  },
        { id:'u7q9_06', image:'sent:s_u7_04',  text:"It's a cow.",  correct:true  },
        { id:'u7q9_07', image:'sent:s_u7_02',  text:"It's a duck.", correct:false },
        { id:'u7q9_08', image:'sent:s_u7_05',  text:"Mary has a little lamb.", correct:true },
      ]},
      { id:10, type:'scenario', title:'十、情景选择', hint:'', pickCount:4, pointsPerItem:1, bank:[
        { id:'u7q10_01', scene:'远远看到一只小猪，问同伴：', options:["What's that?","What colour?","Bye."], correct:0 },
        { id:'u7q10_02', scene:'想让别人安静：', options:["Shh!","Hi!","Sorry."], correct:0 },
        { id:'u7q10_03', scene:'模仿小羊叫：', options:["Baa!","Quack!","Moo!"], correct:0 },
        { id:'u7q10_04', scene:'告诉妈妈那是一头牛：', options:["It's a cow.","It's a lamb.","Sorry."], correct:0 },
        { id:'u7q10_05', scene:'模仿鸭子叫：', options:["Quack!","Baa!","Moo!"], correct:0 },
        { id:'u7q10_06', scene:'告诉妈妈那是小猪：', options:["It's a pig.","Sorry.","Bye."], correct:0 },
        { id:'u7q10_07', scene:'问有几头牛：', options:["How many cows?","Me too.","Hi."], correct:0 },
        { id:'u7q10_08', scene:'形容猪是粉色的：', options:["The pig is pink.","The cow is black.","Run!"], correct:0 },
      ]},
      { id:11, type:'match-columns', title:'十一、从 II 栏中选出 I 栏相对应的答句', hint:'', pickCount:1, pointsPerItem:12, bank:[{
        id:'u7q11_01', pairs:[
          { q:"What's that?",      a:"It's a pig." },
          { q:"Baa!",              a:"It's a lamb." },
          { q:"Quack!",             a:"It's a duck." },
          { q:"Is it a cow?",      a:"Yes, it is." },
          { q:"What colour is the pig?", a:"It's pink." },
          { q:"How many ducks?",   a:"Three ducks." },
        ],
      }]},
      { id:12, type:'dialog-fill', title:'十二、从方框中选出正确的单词补全对话', hint:'', pickCount:1, pointsPerItem:10, bank:[{
        id:'u7q12_01', pool:['that','pig','cow','lamb','duck'],
        dialog:[
          { speaker:'A', parts:[{t:"What's "}, {blank:'that'}, {t:"? It's a "}, {blank:'pig'}, {t:'.'}] },
          { speaker:'B', parts:[{t:"It's a "}, {blank:'lamb'}, {t:'.'}] },
          { speaker:'A', parts:[{t:"It's a "}, {blank:'duck'}, {t:'.'}] },
          { speaker:'B', parts:[{t:"It's a "}, {blank:'cow'}, {t:'.'}] },
        ],
      }]},
    ],
  },

  /* ============================================================
   * Unit 8 · What's in your bag?
   * ============================================================ */
  8: {
    unit: 8, title: "Unit 8 · What's in your bag?", totalPoints: 100,
    sections: [
      { id:1, type:'listen-choose', title:'一、听录音选出所听到的内容', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u8q1_01', audio:'vocab:u8_bag',     options:['bag','bat','big'],      correct:0 },
        { id:'u8q1_02', audio:'vocab:u8_bottle',  options:['bottle','battle','butter'], correct:0 },
        { id:'u8q1_03', audio:'vocab:u8_hankie',  options:['hankie','hanky','honey'], correct:0 },
        { id:'u8q1_04', audio:'vocab:u8_sticker', options:['sticker','stacker','sticky'], correct:0 },
        { id:'u8q1_05', audio:'vocab:u8_yoyo',    options:['yo-yo','yummy','yellow'], correct:0 },
        { id:'u8q1_06', audio:'vocab:u8_bee',     options:['bee','be','big'],         correct:0 },
        { id:'u8q1_07', audio:'vocab:u2_book',    options:['book','look','cook'],    correct:0 },
        { id:'u8q1_08', audio:'vocab:u2_pencil',  options:['pencil','pen','penny'], correct:0 },
      ]},
      { id:2, type:'listen-judge', title:'二、听录音判断听到的内容与图片是否相符', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u8q2_01', audio:'vocab:u8_bag',     image:'vocab:u8_bag',     correct:true  },
        { id:'u8q2_02', audio:'vocab:u8_bottle',  image:'vocab:u8_bottle',  correct:true  },
        { id:'u8q2_03', audio:'vocab:u8_hankie',  image:'vocab:u8_hankie',  correct:true  },
        { id:'u8q2_04', audio:'vocab:u8_sticker', image:'vocab:u8_sticker', correct:true  },
        { id:'u8q2_05', audio:'vocab:u8_yoyo',    image:'vocab:u8_yoyo',    correct:true  },
        { id:'u8q2_06', audio:'vocab:u8_bag',     image:'vocab:u8_bottle',  correct:false },
        { id:'u8q2_07', audio:'vocab:u8_hankie',  image:'vocab:u8_sticker', correct:false },
        { id:'u8q2_08', audio:'sent:s_u8_01',     image:'sent:s_u8_01',     correct:true  },
      ]},
      { id:3, type:'listen-judge', title:'三、听录音判断所听到的句子与图片是否相符', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u8q3_01', audio:'sent:s_u8_01', image:'sent:s_u8_01', correct:true },
        { id:'u8q3_02', audio:'sent:s_u8_02', image:'sent:s_u8_02', correct:true },
        { id:'u8q3_03', audio:'sent:s_u8_03', image:'sent:s_u8_03', correct:true },
        { id:'u8q3_04', audio:'sent:s_u8_04', image:'sent:s_u8_04', correct:true },
        { id:'u8q3_05', audio:'sent:s_u8_01', image:'sent:s_u8_04', correct:false },
        { id:'u8q3_06', audio:'sent:s_u8_02', image:'sent:s_u8_03', correct:false },
        { id:'u8q3_07', audio:'vocab:u8_bee', image:'vocab:u8_bee', correct:true },
        { id:'u8q3_08', audio:'vocab:u8_yoyo',image:'vocab:u8_bag', correct:false },
      ]},
      { id:4, type:'listen-order', title:'四、听录音给下列图片排序', hint:'', pickCount:1, pointsPerItem:12, bank:[{
        id:'u8q4_01',
        sequence:['sent:s_u8_02','sent:s_u8_01','sent:s_u8_03','sent:s_u8_04','sent:s_u8_06','sent:s_u8_07'],
        images:  ['sent:s_u8_01','sent:s_u8_02','sent:s_u8_03','sent:s_u8_04','sent:s_u8_06','sent:s_u8_07'],
      }]},
      { id:5, type:'listen-response', title:'五、听录音选出相应的答句', hint:'', pickCount:6, pointsPerItem:2, bank:[
        { id:'u8q5_01', audio:'quiz:u8q5_01', audioText:"What's in your bag?",    options:["A book and a pencil.","Yes.","Me too."], correct:0 },
        { id:'u8q5_02', audio:'quiz:u8q5_02', audioText:"Is this a yo-yo?",       options:["Yes, it is.","Me too.","Bye."], correct:0 },
        { id:'u8q5_03', audio:'quiz:u8q5_03', audioText:"How many yo-yos?",       options:["Two yo-yos.","Hi.","Me too."], correct:0 },
        { id:'u8q5_04', audio:'quiz:u8q5_04', audioText:"What can you see?",      options:["A bee!","Bye.","Me too."], correct:0 },
        { id:'u8q5_05', audio:'quiz:u8q5_05', audioText:"Here's my bag.",         options:["Cool!","Sorry.","Me too."], correct:0 },
        { id:'u8q5_06', audio:'quiz:u8q5_06', audioText:"Oh no!",                 options:["What's wrong?","Hi!","Bye."], correct:0 },
        { id:'u8q5_07', audio:'quiz:u8q5_07', audioText:"Is this your sticker?",  options:["Yes, it is.","Me too.","Bye."], correct:0 },
        { id:'u8q5_08', audio:'quiz:u8q5_08', audioText:"What colour is the bee?", options:["It's yellow.","Me too.","Bye."], correct:0 },
      ]},
      { id:6, type:'listen-fill', title:'六、听录音选出正确的单词填空', hint:'', pickCount:1, pointsPerItem:10, bank:[{
        id:'u8q6_01', audio:'quiz:u8q6_01',
        audioText:"What's in your bag? A bottle and a hankie. A sticker and a yo-yo. Oh no! A yellow bee.",
        pool:['bag','bottle','sticker','yo-yo','bee'],
        dialog:[
          { speaker:'A', parts:[{t:"What's in your "}, {blank:'bag'}, {t:'?'}] },
          { speaker:'B', parts:[{t:'A '}, {blank:'bottle'}, {t:' and a hankie.'}] },
          { speaker:'A', parts:[{t:'A '}, {blank:'sticker'}, {t:' and a '}, {blank:'yo-yo'}, {t:'.'}] },
          { speaker:'B', parts:[{t:'Oh no! A yellow '}, {blank:'bee'}, {t:'!'}] },
        ],
      }]},
      { id:7, type:'letter-neighbor', title:'七、写出下列字母的左邻右舍', hint:'', pickCount:4, pointsPerItem:1, bank:'SHARED_LETTERS' },
      { id:8, type:'odd-one-out', title:'八、选出每组中不同类的一项', hint:'', pickCount:6, pointsPerItem:1, bank:[
        { id:'u8q8_01', items:['bag','bottle','hankie','run'],      correct:3 },
        { id:'u8q8_02', items:['book','pencil','ruler','bee'],      correct:3 },
        { id:'u8q8_03', items:['sticker','yo-yo','carrot','bag'],   correct:2 },
        { id:'u8q8_04', items:['yellow','red','bag','green'],       correct:2 },
        { id:'u8q8_05', items:['pig','bee','cow','duck'],           correct:1 },
        { id:'u8q8_06', items:['bottle','book','ruler','bee'],      correct:3 },
        { id:'u8q8_07', items:['one','two','three','bag'],          correct:3 },
        { id:'u8q8_08', items:['hankie','sticker','yo-yo','sky'],   correct:3 },
      ]},
      { id:9, type:'pic-judge', title:'九、判断下列句子与图片是否相符', hint:'', pickCount:4, pointsPerItem:1, bank:[
        { id:'u8q9_01', image:'vocab:u8_bag',     text:"It's a bag.",    correct:true  },
        { id:'u8q9_02', image:'vocab:u8_bottle',  text:"It's a bottle.", correct:true  },
        { id:'u8q9_03', image:'vocab:u8_yoyo',    text:"It's a yo-yo.",  correct:true  },
        { id:'u8q9_04', image:'vocab:u8_sticker', text:"It's a bag.",    correct:false },
        { id:'u8q9_05', image:'sent:s_u8_01',     text:"What's in your bag?",          correct:true },
        { id:'u8q9_06', image:'sent:s_u8_03',     text:"A sticker and a yo-yo.",        correct:true },
        { id:'u8q9_07', image:'sent:s_u8_07',     text:"A yellow bee!",                 correct:true },
        { id:'u8q9_08', image:'sent:s_u8_04',     text:"What's that?",                  correct:false },
      ]},
      { id:10, type:'scenario', title:'十、情景选择', hint:'', pickCount:4, pointsPerItem:1, bank:[
        { id:'u8q10_01', scene:'问同学包里有什么：', options:["What's in your bag?","Bye.","Me too."], correct:0 },
        { id:'u8q10_02', scene:'打开包看到一只蜜蜂,惊讶：', options:["Oh no!","Me too.","Bye."], correct:0 },
        { id:'u8q10_03', scene:'告诉别人这是我的包：', options:["Here's my bag.","What's that?","Bye."], correct:0 },
        { id:'u8q10_04', scene:'说明包里有一本书：', options:["A book is in my bag.","Me too.","Sorry."], correct:0 },
        { id:'u8q10_05', scene:'描述贴纸：', options:["A sticker and a yo-yo.","Me too.","Sorry."], correct:0 },
        { id:'u8q10_06', scene:'问朋友能不能看到蜜蜂：', options:["Can you see the bee?","Bye.","Hi."], correct:0 },
        { id:'u8q10_07', scene:'请别人看：', options:["Look!","Bye.","Me too."], correct:0 },
        { id:'u8q10_08', scene:'问朋友包里有多少贴纸：', options:["How many stickers?","Me too.","Hi."], correct:0 },
      ]},
      { id:11, type:'match-columns', title:'十一、从 II 栏中选出 I 栏相对应的答句', hint:'', pickCount:1, pointsPerItem:12, bank:[{
        id:'u8q11_01', pairs:[
          { q:"What's in your bag?", a:"A book and a pencil." },
          { q:"Is this a yo-yo?",    a:"Yes, it is." },
          { q:"How many yo-yos?",    a:"Two yo-yos." },
          { q:"What can you see?",   a:"A bee!" },
          { q:"Oh no!",              a:"What's wrong?" },
          { q:"Here's my bag.",      a:"Cool!" },
        ],
      }]},
      { id:12, type:'dialog-fill', title:'十二、从方框中选出正确的单词补全对话', hint:'', pickCount:1, pointsPerItem:10, bank:[{
        id:'u8q12_01', pool:['bag','book','and','yo-yo','bee'],
        dialog:[
          { speaker:'A', parts:[{t:"What's in your "}, {blank:'bag'}, {t:'?'}] },
          { speaker:'B', parts:[{t:'A '}, {blank:'book'}, {t:' '}, {blank:'and'}, {t:' a '}, {blank:'yo-yo'}, {t:'.'}] },
          { speaker:'A', parts:[{t:'Oh no! A yellow '}, {blank:'bee'}, {t:'!'}] },
        ],
      }]},
    ],
  },

  /* ============================================================
   * Unit 5 · What's this?
   * ============================================================ */
  5: {
    unit: 5,
    title: "Unit 5 · What's this?",
    totalPoints: 100,
    sections: [
      {
        id: 1, type: 'listen-choose', title: '一、听录音选出所听到的内容', titleEn: 'Listen and choose',
        hint: '播放录音，点击听到的那个单词', pickCount: 6, pointsPerItem: 1,
        bank: [
          { id:'u5q1_01', audio:'vocab:u5_ladybird',  options:['ladybird','butterfly','dragonfly'], correct:0 },
          { id:'u5q1_02', audio:'vocab:u5_butterfly', options:['butterfly','ladybird','dragonfly'], correct:0 },
          { id:'u5q1_03', audio:'vocab:u5_cicada',    options:['cicada','cider','circle'],         correct:0 },
          { id:'u5q1_04', audio:'vocab:u5_dragonfly', options:['dragonfly','dragon','butterfly'],  correct:0 },
          { id:'u5q1_05', audio:'vocab:u5_cute',      options:['cute','cat','cup'],                correct:0 },
          { id:'u5q1_06', audio:'vocab:u4_bird',      options:['bird','bed','big'],                correct:0 },
          { id:'u5q1_07', audio:'vocab:u3_carrot',    options:['carrot','cat','car'],              correct:0 },
          { id:'u5q1_08', audio:'vocab:u2_book',      options:['book','look','cook'],              correct:0 },
          { id:'u5q1_09', audio:'vocab:u1_five',     options:['five','fine','four'],               correct:0 },
          { id:'u5q1_10', audio:'vocab:u4_tree',     options:['tree','three','free'],              correct:0 },
          { id:'u5q1_11', audio:'vocab:u4_kite',     options:['kite','cat','kit'],                 correct:0 },
          { id:'u5q1_12', audio:'vocab:u4_flower',   options:['flower','flour','floor'],           correct:0 },
        ],
      },
      {
        id: 2, type: 'listen-judge', title: '二、听录音判断听到的内容与图片是否相符', titleEn: 'Listen and judge',
        hint: '听 → 看图 → 相符 ✓ 不符 ✗', pickCount: 6, pointsPerItem: 1,
        bank: [
          { id:'u5q2_01', audio:'vocab:u5_ladybird',  image:'vocab:u5_ladybird',  correct:true  },
          { id:'u5q2_02', audio:'vocab:u5_butterfly', image:'vocab:u5_butterfly', correct:true  },
          { id:'u5q2_03', audio:'vocab:u5_cicada',    image:'vocab:u5_cicada',    correct:true  },
          { id:'u5q2_04', audio:'vocab:u5_dragonfly', image:'vocab:u5_dragonfly', correct:true  },
          { id:'u5q2_05', audio:'vocab:u5_ladybird',  image:'vocab:u5_butterfly', correct:false },
          { id:'u5q2_06', audio:'vocab:u5_cicada',    image:'vocab:u5_dragonfly', correct:false },
          { id:'u5q2_07', audio:'sent:s_u5_01',       image:'sent:s_u5_01',       correct:true  },
          { id:'u5q2_08', audio:'sent:s_u5_02',       image:'sent:s_u5_02',       correct:true  },
          { id:'u5q2_09', audio:'sent:s_u5_03',       image:'sent:s_u5_03',       correct:true  },
          { id:'u5q2_10', audio:'sent:s_u5_04',       image:'sent:s_u5_04',       correct:true  },
          { id:'u5q2_11', audio:'sent:s_u5_01',       image:'sent:s_u5_04',       correct:false },
          { id:'u5q2_12', audio:'sent:s_u5_02',       image:'sent:s_u5_03',       correct:false },
        ],
      },
      {
        id: 3, type: 'listen-judge', title: '三、听录音判断所听到的句子与图片是否相符', titleEn: 'Listen and judge',
        hint: '听 → 看图 → 相符 ✓ 不符 ✗', pickCount: 6, pointsPerItem: 1,
        bank: [
          { id:'u5q3_01', audio:'sent:s_u5_05', image:'vocab:u5_butterfly', correct:true  },
          { id:'u5q3_02', audio:'sent:s_u5_01', image:'vocab:u5_ladybird',  correct:true  },
          { id:'u5q3_03', audio:'sent:s_u5_04', image:'vocab:u5_dragonfly', correct:true  },
          { id:'u5q3_04', audio:'sent:s_u5_02', image:'vocab:u5_cicada',    correct:true  },
          { id:'u5q3_05', audio:'sent:s_u5_01', image:'vocab:u5_butterfly', correct:false },
          { id:'u5q3_06', audio:'sent:s_u5_04', image:'vocab:u5_cicada',    correct:false },
          { id:'u5q3_07', audio:'sent:s_u5_03', image:'vocab:u5_butterfly', correct:true  },
          { id:'u5q3_08', audio:'sent:s_u5_05', image:'vocab:u5_dragonfly', correct:false },
          { id:'u5q3_09', audio:'vocab:u5_ladybird', image:'vocab:u5_ladybird', correct:true },
          { id:'u5q3_10', audio:'vocab:u5_dragonfly', image:'vocab:u5_butterfly', correct:false },
          { id:'u5q3_11', audio:'vocab:u5_cicada', image:'vocab:u5_cicada', correct:true },
          { id:'u5q3_12', audio:'vocab:u5_cute',   image:'vocab:u5_cute', correct:true },
        ],
      },
      {
        id: 4, type: 'listen-order', title: '四、听录音给下列图片排序', titleEn: 'Listen and order',
        hint: '按播放顺序给图片写 1–6', pickCount: 1, pointsPerItem: 12,
        bank: [{
          id: 'u5q4_01',
          sequence: ['sent:s_u5_03', 'sent:s_u5_01', 'sent:s_u5_04', 'sent:s_u5_02', 'sent:s_u5_05', 'sent:s_u5_07'],
          images:   ['sent:s_u5_01', 'sent:s_u5_02', 'sent:s_u5_03', 'sent:s_u5_04', 'sent:s_u5_05', 'sent:s_u5_07'],
        }],
      },
      {
        id: 5, type: 'listen-response', title: '五、听录音选出相应的答句', titleEn: 'Listen and choose response',
        hint: '听问句 → 选合适的英文答句', pickCount: 6, pointsPerItem: 2,
        bank: [
          { id:'u5q5_01', audio:'quiz:u5q5_01', audioText:"What's this?",              options:["It's a ladybird.","Yes, I do.","Me too."],       correct:0 },
          { id:'u5q5_02', audio:'quiz:u5q5_02', audioText:"It's a butterfly.",         options:["How cute!","Yes, please.","No, thanks."],       correct:0 },
          { id:'u5q5_03', audio:'quiz:u5q5_03', audioText:"Is it a dragonfly?",        options:["Yes, it is.","Me too.","I\'m sorry."],          correct:0 },
          { id:'u5q5_04', audio:'quiz:u5q5_04', audioText:"Look at the cicada!",       options:["How cute!","Yes, please.","No, I can\'t."],     correct:0 },
          { id:'u5q5_05', audio:'quiz:u5q5_05', audioText:"What colour is it?",        options:["It's red.","Me too.","Yes, I do."],             correct:0 },
          { id:'u5q5_06', audio:'quiz:u5q5_06', audioText:"Do you like ladybirds?",    options:["Yes, I do.","Me too.","Sorry."],                correct:0 },
          { id:'u5q5_07', audio:'quiz:u5q5_07', audioText:"How many butterflies?",    options:["Five butterflies.","A ladybird.","Me too."],    correct:0 },
          { id:'u5q5_08', audio:'quiz:u5q5_08', audioText:"Can you see the dragonfly?", options:["Yes, I can.","Me too.","Look!"],              correct:0 },
          { id:'u5q5_09', audio:'quiz:u5q5_09', audioText:"It's cute!",                options:["Me too.","No, thanks.","Hi."],                 correct:0 },
          { id:'u5q5_10', audio:'quiz:u5q5_10', audioText:"Hello.",                    options:["Hi!","No.","Me too."],                         correct:0 },
          { id:'u5q5_11', audio:'quiz:u5q5_11', audioText:"Thank you.",                options:["You\'re welcome.","Sorry.","Yes, please."],    correct:0 },
          { id:'u5q5_12', audio:'quiz:u5q5_12', audioText:"What's that?",              options:["It's a bird.","Yes, please.","Me too."],       correct:0 },
        ],
      },
      {
        id: 6, type: 'listen-fill', title: '六、听录音选出正确的单词填空', titleEn: 'Listen and fill',
        hint: '听 → 从词库挑合适的词填进空位', pickCount: 1, pointsPerItem: 10,
        bank: [{
          id: 'u5q6_01',
          audio: 'quiz:u5q6_01',
          audioText: "What's this? It's a ladybird. It's a butterfly. How cute! It's a dragonfly.",
          pool: ['ladybird','butterfly','cute','dragonfly','this'],
          dialog: [
            { speaker: 'A', parts: [{t:"What's "}, {blank:'this'}, {t:"?"}] },
            { speaker: 'B', parts: [{t:"It's a "}, {blank:'ladybird'}, {t:"."}] },
            { speaker: 'A', parts: [{t:"It's a "}, {blank:'butterfly'}, {t:". How "}, {blank:'cute'}, {t:"!"}] },
            { speaker: 'B', parts: [{t:"It's a "}, {blank:'dragonfly'}, {t:"."}] },
          ],
        }],
      },
      {
        id: 7, type: 'letter-neighbor', title: '七、写出下列字母的左邻右舍', titleEn: 'Letter neighbors',
        hint: '每个字母前后各有一个', pickCount: 4, pointsPerItem: 1,
        bank: 'SHARED_LETTERS',
      },
      {
        id: 8, type: 'odd-one-out', title: '八、选出每组中不同类的一项', titleEn: 'Find the odd one out',
        hint: '四个词里选出跟其他三个不是一类的', pickCount: 6, pointsPerItem: 1,
        bank: [
          { id:'u5q8_01', items:['ladybird','butterfly','dragonfly','book'],   correct:3, note:'三个昆虫,book不是' },
          { id:'u5q8_02', items:['cicada','butterfly','carrot','ladybird'],   correct:2, note:'carrot是蔬菜' },
          { id:'u5q8_03', items:['cute','big','small','book'],                correct:3, note:'三个形容词' },
          { id:'u5q8_04', items:['fly','dance','sing','dragonfly'],           correct:3, note:'三个动词' },
          { id:'u5q8_05', items:['red','blue','yellow','butterfly'],         correct:3, note:'三个颜色' },
          { id:'u5q8_06', items:['one','two','three','ladybird'],            correct:3, note:'三个数字' },
          { id:'u5q8_07', items:['pig','cow','duck','butterfly'],           correct:3, note:'三个农场动物/butterfly是昆虫' },
          { id:'u5q8_08', items:['butterfly','tree','flower','bird'],       correct:0, note:'butterfly是昆虫,其余春天物' },
          { id:'u5q8_09', items:['sky','summer','spring','dragonfly'],      correct:3, note:'dragonfly是动物' },
          { id:'u5q8_10', items:['up','down','round','cute'],               correct:3, note:'三个方位词' },
          { id:'u5q8_11', items:['ladybird','bee','cat','butterfly'],       correct:2, note:'cat是哺乳动物' },
          { id:'u5q8_12', items:['happy','sad','angry','cicada'],           correct:3, note:'cicada是昆虫' },
        ],
      },
      {
        id: 9, type: 'pic-judge', title: '九、判断下列句子与图片是否相符', titleEn: 'Picture vs sentence',
        hint: '看图 + 读英文 → 相符 ✓ 不符 ✗', pickCount: 4, pointsPerItem: 1,
        bank: [
          { id:'u5q9_01', image:'vocab:u5_ladybird',  text:"It's a ladybird.",  correct:true  },
          { id:'u5q9_02', image:'vocab:u5_butterfly', text:"It's a butterfly.", correct:true  },
          { id:'u5q9_03', image:'vocab:u5_cicada',    text:"It's a cicada.",    correct:true  },
          { id:'u5q9_04', image:'vocab:u5_dragonfly', text:"It's a dragonfly.", correct:true  },
          { id:'u5q9_05', image:'vocab:u5_ladybird',  text:"It's a butterfly.", correct:false },
          { id:'u5q9_06', image:'vocab:u5_butterfly', text:"It's a dragonfly.", correct:false },
          { id:'u5q9_07', image:'sent:s_u5_01',       text:"What's this? It's a ladybird.", correct:true },
          { id:'u5q9_08', image:'sent:s_u5_02',       text:"It's a cicada. How cute!",      correct:true },
          { id:'u5q9_09', image:'sent:s_u5_03',       text:"It's a butterfly.",             correct:true },
          { id:'u5q9_10', image:'sent:s_u5_04',       text:"It's a dragonfly.",             correct:true },
          { id:'u5q9_11', image:'sent:s_u5_01',       text:"It's a dragonfly.",             correct:false },
          { id:'u5q9_12', image:'sent:s_u5_03',       text:"It's a pig.",                   correct:false },
        ],
      },
      {
        id: 10, type: 'scenario', title: '十、情景选择', titleEn: 'Pick the right response',
        hint: '根据场景,选最合适的英文', pickCount: 4, pointsPerItem: 1,
        bank: [
          { id:'u5q10_01', scene:'你看到一只瓢虫，告诉朋友：',
            options:["It's a ladybird.","It's a book.","Me too."], correct:0 },
          { id:'u5q10_02', scene:'想问"这是什么"：',
            options:["What's this?","It's a kite.","Hello."], correct:0 },
          { id:'u5q10_03', scene:'夸蝴蝶可爱：',
            options:["How cute!","Hello!","No, thanks."], correct:0 },
          { id:'u5q10_04', scene:'说自己看到一只蜻蜓：',
            options:["It's a dragonfly.","Yes, please.","Me too."], correct:0 },
          { id:'u5q10_05', scene:'指着蝉问同学：',
            options:["What's this?","Where are you?","Hi."], correct:0 },
          { id:'u5q10_06', scene:'觉得蝴蝶很可爱，让妈妈看：',
            options:["Look at the butterfly. How cute!","I like carrots.","It's a bird."], correct:0 },
          { id:'u5q10_07', scene:'问朋友蝴蝶在飞吗：',
            options:["Is the butterfly flying?","Me too.","Look at the tree."], correct:0 },
          { id:'u5q10_08', scene:'看到两只瓢虫，数数：',
            options:["Two ladybirds!","One butterfly.","Three birds."], correct:0 },
          { id:'u5q10_09', scene:'想告诉别人喜欢蜻蜓：',
            options:["I like dragonflies.","No, thanks.","Yes, it is."], correct:0 },
          { id:'u5q10_10', scene:'同学说蝉好可爱，表示赞同：',
            options:["Me too.","Sorry.","Bye."], correct:0 },
          { id:'u5q10_11', scene:'说天空真美：',
            options:["Beautiful sky!","I like carrots.","Sorry."], correct:0 },
          { id:'u5q10_12', scene:'问有几只蝴蝶：',
            options:["How many butterflies?","It's a pea.","Me too."], correct:0 },
        ],
      },
      {
        id: 11, type: 'match-columns', title: '十一、从 II 栏中选出 I 栏相对应的答句', titleEn: 'Match columns',
        hint: '点左边的题 → 再点右边的答', pickCount: 1, pointsPerItem: 12,
        bank: [{
          id: 'u5q11_01',
          pairs: [
            { q: "What's this?",              a: "It's a ladybird." },
            { q: "It's a butterfly.",         a: "How cute!" },
            { q: "Do you like butterflies?",  a: "Yes, I do." },
            { q: "How many dragonflies?",     a: "Three dragonflies." },
            { q: "Hello!",                    a: "Hi!" },
            { q: "What colour is it?",        a: "It's red." },
          ],
        }],
      },
      {
        id: 12, type: 'dialog-fill', title: '十二、从方框中选出正确的单词补全对话', titleEn: 'Dialog fill',
        hint: '点空位 → 从词库挑合适的词', pickCount: 1, pointsPerItem: 10,
        bank: [{
          id: 'u5q12_01',
          pool: ['this','ladybird','cute','butterfly','cicada'],
          dialog: [
            { speaker: 'A', parts: [{t:"What's "}, {blank:'this'}, {t:"?"}] },
            { speaker: 'B', parts: [{t:"It's a "}, {blank:'ladybird'}, {t:"."}] },
            { speaker: 'A', parts: [{t:"And it's a "}, {blank:'butterfly'}, {t:"."}] },
            { speaker: 'B', parts: [{t:"It's a "}, {blank:'cicada'}, {t:". How "}, {blank:'cute'}, {t:"!"}] },
          ],
        }],
      },
    ],
  },

  /* ============================================================
   * Unit 3 · I like carrots
   * ============================================================ */
  3: {
    unit: 3,
    title: 'Unit 3 · I like carrots',
    totalPoints: 100,
    sections: [
      {
        id: 1, type: 'listen-choose', title: '一、听录音选出所听到的内容', titleEn: 'Listen and choose',
        hint: '播放录音，点击听到的那个单词', pickCount: 6, pointsPerItem: 1,
        bank: [
          { id:'q1_01', audio:'vocab:u3_like',    options:['like','lick','kite'],      correct:0 },
          { id:'q1_02', audio:'vocab:u3_carrot',  options:['carrot','cat','car'],      correct:0 },
          { id:'q1_03', audio:'vocab:u3_onion',   options:['onion','orange','open'],   correct:0 },
          { id:'q1_04', audio:'vocab:u3_pea',     options:['pea','pay','pig'],         correct:0 },
          { id:'q1_05', audio:'vocab:u3_pepper',  options:['pepper','paper','puppy'],  correct:0 },
          { id:'q1_06', audio:'vocab:u3_we',      options:['we','me','see'],           correct:0 },
          { id:'q1_07', audio:'vocab:u3_all',     options:['all','ball','apple'],      correct:0 },
          { id:'q1_08', audio:'vocab:u2_book',    options:['book','look','cook'],      correct:0 },
          { id:'q1_09', audio:'vocab:u2_ruler',   options:['ruler','rubber','river'],  correct:0 },
          { id:'q1_10', audio:'vocab:u1_yellow',  options:['yellow','yo-yo','yummy'],  correct:0 },
          { id:'q1_11', audio:'vocab:u1_five',    options:['five','four','fine'],      correct:0 },
          { id:'q1_12', audio:'vocab:u1_three',   options:['three','tree','free'],     correct:0 },
          { id:'q1_13', audio:'vocab:u4_green',   options:['green','grin','grey'],     correct:0 },
          { id:'q1_14', audio:'vocab:u4_bird',    options:['bird','bed','bag'],        correct:0 },
          { id:'q1_15', audio:'vocab:u4_tree',    options:['tree','three','free'],     correct:0 },
        ],
      },
      {
        id: 2, type: 'listen-judge', title: '二、听录音判断听到的内容与图片是否相符', titleEn: 'Listen and judge',
        hint: '听 → 看图 → 相符 ✓ 不符 ✗', pickCount: 6, pointsPerItem: 1,
        bank: [
          { id:'q2_01', audio:'sent:s_u3_01', image:'sent:s_u3_01', correct:true  },
          { id:'q2_02', audio:'sent:s_u3_02', image:'sent:s_u3_02', correct:true  },
          { id:'q2_03', audio:'sent:s_u3_03', image:'sent:s_u3_03', correct:true  },
          { id:'q2_04', audio:'sent:s_u3_04', image:'sent:s_u3_04', correct:true  },
          { id:'q2_05', audio:'sent:s_u3_01', image:'sent:s_u3_04', correct:false },
          { id:'q2_06', audio:'sent:s_u3_02', image:'sent:s_u3_03', correct:false },
          { id:'q2_07', audio:'vocab:u3_carrot', image:'vocab:u3_carrot', correct:true  },
          { id:'q2_08', audio:'vocab:u3_onion',  image:'vocab:u3_onion',  correct:true  },
          { id:'q2_09', audio:'vocab:u3_pea',    image:'vocab:u3_pepper', correct:false },
          { id:'q2_10', audio:'vocab:u3_pepper', image:'vocab:u3_pea',    correct:false },
          { id:'q2_11', audio:'vocab:u3_like',   image:'vocab:u3_like',   correct:true  },
          { id:'q2_12', audio:'vocab:u3_carrot', image:'vocab:u3_onion',  correct:false },
        ],
      },
      {
        id: 3, type: 'listen-judge', title: '三、听录音判断所听到的句子与图片是否相符', titleEn: 'Listen and judge',
        hint: '听 → 看图 → 相符 ✓ 不符 ✗', pickCount: 6, pointsPerItem: 1,
        bank: [
          { id:'q3_01', audio:'vocab:u3_carrot', image:'vocab:u3_carrot', correct:true  },
          { id:'q3_02', audio:'vocab:u3_pea',    image:'vocab:u3_pea',    correct:true  },
          { id:'q3_03', audio:'vocab:u3_onion',  image:'vocab:u3_onion',  correct:true  },
          { id:'q3_04', audio:'vocab:u3_pepper', image:'vocab:u3_pepper', correct:true  },
          { id:'q3_05', audio:'vocab:u3_like',   image:'vocab:u3_like',   correct:true  },
          { id:'q3_06', audio:'vocab:u3_carrot', image:'vocab:u3_pepper', correct:false },
          { id:'q3_07', audio:'vocab:u3_pea',    image:'vocab:u3_carrot', correct:false },
          { id:'q3_08', audio:'vocab:u3_onion',  image:'vocab:u3_pepper', correct:false },
          { id:'q3_09', audio:'vocab:u3_pepper', image:'vocab:u3_like',   correct:false },
          { id:'q3_10', audio:'vocab:u3_like',   image:'vocab:u3_onion',  correct:false },
          { id:'q3_11', audio:'sent:s_u3_05',    image:'sent:s_u3_05',    correct:true  },
          { id:'q3_12', audio:'sent:s_u3_07',    image:'sent:s_u3_07',    correct:true  },
        ],
      },
      {
        id: 4, type: 'listen-order', title: '四、听录音给下列图片排序', titleEn: 'Listen and order',
        hint: '按播放顺序给图片写 1–6', pickCount: 1, pointsPerItem: 12,
        bank: [
          {
            id: 'q4_01',
            sequence: ['sent:s_u3_02', 'sent:s_u3_04', 'sent:s_u3_01', 'sent:s_u3_03', 'sent:s_u3_05', 'sent:s_u3_08'],
            images: ['sent:s_u3_01', 'sent:s_u3_02', 'sent:s_u3_03', 'sent:s_u3_04', 'sent:s_u3_05', 'sent:s_u3_08'],
          },
        ],
      },
      {
        id: 5, type: 'listen-response', title: '五、听录音选出相应的答句', titleEn: 'Listen and choose response',
        hint: '听问句 → 选合适的英文答句', pickCount: 6, pointsPerItem: 2,
        bank: [
          { id:'u3q5_01', audio:'quiz:u3q5_01', audioText:"Do you like carrots?",    options:["Yes, I do.",         "Me too.",       "No, thanks."], correct:0 },
          { id:'u3q5_02', audio:'quiz:u3q5_02', audioText:"An onion?",              options:["No, thanks.",        "Yes, please.",  "Look!"],        correct:0 },
          { id:'u3q5_03', audio:'quiz:u3q5_03', audioText:"A pea?",                 options:["Yes, please.",       "No, I don't.",  "Hi."],          correct:0 },
          { id:'u3q5_04', audio:'quiz:u3q5_04', audioText:"I like peppers.",        options:["Me too.",            "No, thanks.",   "Yes, I do."],   correct:0 },
          { id:'u3q5_05', audio:'quiz:u3q5_05', audioText:"What colour are peas?",  options:["Green.",             "Red.",          "Yellow."],      correct:0 },
          { id:'u3q5_06', audio:'quiz:u3q5_06', audioText:"Are peas sweet?",        options:["Yes, they are.",     "No, thanks.",   "I like them."], correct:0 },
          { id:'u3q5_07', audio:'quiz:u3q5_07', audioText:"Do you like onions?",    options:["No, thanks.",        "Yes, please.",  "Me too."],      correct:0 },
          { id:'u3q5_08', audio:'quiz:u3q5_08', audioText:"Carrots, please.",       options:["Here you are.",      "No, thanks.",   "Look!"],        correct:0 },
          { id:'u3q5_09', audio:'quiz:u3q5_09', audioText:"Thank you.",             options:["You're welcome.",    "Me too.",       "Yes, please."], correct:0 },
          { id:'u3q5_10', audio:'quiz:u3q5_10', audioText:"How many peas?",         options:["Five peas.",         "Three books.",  "Me too."],      correct:0 },
          { id:'u3q5_11', audio:'quiz:u3q5_11', audioText:"Yummy!",                 options:["Me too!",            "No.",           "Bye."],         correct:0 },
          { id:'u3q5_12', audio:'quiz:u3q5_12', audioText:"I like it.",             options:["Me too.",            "Sorry.",        "Walk."],        correct:0 },
        ],
      },
      {
        id: 6, type: 'listen-fill', title: '六、听录音选出正确的单词填空', titleEn: 'Listen and fill',
        hint: '听 → 从词库挑合适的词填进空位', pickCount: 1, pointsPerItem: 10,
        bank: [
          {
            id: 'u3q6_01',
            audio: 'quiz:u3q6_01',
            audioText: "I like carrots. Me too! An onion? No, thanks. A pea? Yes, please. We all like peppers.",
            pool: ['carrots','onion','pea','peppers','too'],
            dialog: [
              { speaker: 'A', parts: [{t:'I like '}, {blank:'carrots'}, {t:'.'}] },
              { speaker: 'B', parts: [{t:'Me '}, {blank:'too'}, {t:'!'}] },
              { speaker: 'A', parts: [{t:'An '}, {blank:'onion'}, {t:'? No, thanks.'}] },
              { speaker: 'B', parts: [{t:'A '}, {blank:'pea'}, {t:'? Yes, please.'}] },
              { speaker: 'A', parts: [{t:'We all like '}, {blank:'peppers'}, {t:'.'}] },
            ],
          },
        ],
      },
      {
        id: 7, type: 'letter-neighbor', title: '七、写出下列字母的左邻右舍', titleEn: 'Letter neighbors',
        hint: '每个字母前后各有一个', pickCount: 4, pointsPerItem: 1,
        bank: 'SHARED_LETTERS',   // 见下方 letter bank 共用
      },
      {
        id: 8, type: 'odd-one-out', title: '八、选出每组中不同类的一项', titleEn: 'Find the odd one out',
        hint: '四个词里选出跟其他三个不是一类的', pickCount: 6, pointsPerItem: 1,
        bank: [
          { id:'u3q8_01', items:['carrot','pea','pepper','book'],       correct:3, note:'三个蔬菜,book不是' },
          { id:'u3q8_02', items:['like','eat','walk','carrot'],         correct:3, note:'三个动词,carrot不是' },
          { id:'u3q8_03', items:['onion','apple','pear','cake'],        correct:0, note:'onion是蔬菜,其余水果/甜食' },
          { id:'u3q8_04', items:['yes','no','please','pepper'],         correct:3, note:'pepper是蔬菜' },
          { id:'u3q8_05', items:['me','we','you','pea'],                correct:3, note:'三个代词' },
          { id:'u3q8_06', items:['sweet','yummy','green','book'],       correct:3, note:'三个形容词' },
          { id:'u3q8_07', items:['carrot','onion','pea','five'],        correct:3, note:'五是数字' },
          { id:'u3q8_08', items:['green','red','yellow','pea'],         correct:3, note:'三个颜色' },
          { id:'u3q8_09', items:['book','pencil','ruler','carrot'],     correct:3, note:'三个学习用品' },
          { id:'u3q8_10', items:['eat','like','love','pepper'],         correct:3, note:'三个动词' },
          { id:'u3q8_11', items:['pea','peas','pear','pepper'],         correct:2, note:'pear是水果' },
          { id:'u3q8_12', items:['yes','please','thanks','carrot'],     correct:3, note:'三个礼貌词' },
          { id:'u3q8_13', items:['me','we','all','carrot'],             correct:3, note:'三个代词/数量词' },
          { id:'u3q8_14', items:['tree','flower','bird','carrot'],      correct:3, note:'三个春天物' },
          { id:'u3q8_15', items:['one','two','three','like'],           correct:3, note:'三个数字' },
        ],
      },
      {
        id: 9, type: 'pic-judge', title: '九、判断下列句子与图片是否相符', titleEn: 'Picture vs sentence',
        hint: '看图 + 读英文 → 相符 ✓ 不符 ✗', pickCount: 4, pointsPerItem: 1,
        bank: [
          { id:'u3q9_01', image:'vocab:u3_carrot', text:"It's a carrot.",     correct:true  },
          { id:'u3q9_02', image:'vocab:u3_pea',    text:"It's a pea.",        correct:true  },
          { id:'u3q9_03', image:'vocab:u3_onion',  text:"It's an onion.",     correct:true  },
          { id:'u3q9_04', image:'vocab:u3_pepper', text:"It's a pepper.",     correct:true  },
          { id:'u3q9_05', image:'vocab:u3_carrot', text:"It's an onion.",     correct:false },
          { id:'u3q9_06', image:'vocab:u3_pea',    text:"It's a pepper.",     correct:false },
          { id:'u3q9_07', image:'sent:s_u3_01',    text:"I like carrots. Me too!", correct:true },
          { id:'u3q9_08', image:'sent:s_u3_02',    text:"An onion? No, thanks.",   correct:true },
          { id:'u3q9_09', image:'sent:s_u3_03',    text:"A pea? Yes, please.",     correct:true },
          { id:'u3q9_10', image:'sent:s_u3_04',    text:"We all like peppers.",    correct:true },
          { id:'u3q9_11', image:'sent:s_u3_01',    text:"We all like peppers.",    correct:false },
          { id:'u3q9_12', image:'sent:s_u3_03',    text:"An onion? No, thanks.",   correct:false },
        ],
      },
      {
        id: 10, type: 'scenario', title: '十、情景选择', titleEn: 'Pick the right response',
        hint: '根据场景,选最合适的英文', pickCount: 4, pointsPerItem: 1,
        bank: [
          { id:'u3q10_01', scene:'同学请你吃胡萝卜，你想吃，说：',
            options:["Yes, please.","No, thanks.","Me too."], correct:0 },
          { id:'u3q10_02', scene:'别人让你吃洋葱，你不想吃，说：',
            options:["No, thanks.","Yes, please.","Hi."], correct:0 },
          { id:'u3q10_03', scene:'你喜欢豌豆，朋友也喜欢，他说：',
            options:["Me too.","No.","Bye."], correct:0 },
          { id:'u3q10_04', scene:'夸豌豆好吃：',
            options:["They\'re yummy!","I\'m sorry.","Three peas."], correct:0 },
          { id:'u3q10_05', scene:'说自己最爱的蔬菜是胡萝卜：',
            options:["I like carrots.","A pea, please.","Hello."], correct:0 },
          { id:'u3q10_06', scene:'问朋友喜不喜欢甜椒：',
            options:["Do you like peppers?","What\'s this?","Bye!"], correct:0 },
          { id:'u3q10_07', scene:'朋友问你想吃豌豆吗，你想：',
            options:["Yes, please.","No, I don\'t.","Look!"], correct:0 },
          { id:'u3q10_08', scene:'想说大家都爱吃甜椒：',
            options:["We all like peppers.","I like onions.","How many?"], correct:0 },
          { id:'u3q10_09', scene:'描述豌豆颜色和味道：',
            options:["Peas are sweet and green.","Peas are red.","Peas are big."], correct:0 },
          { id:'u3q10_10', scene:'有人感谢你递了胡萝卜：',
            options:["You\'re welcome.","No, thanks.","Hi."], correct:0 },
          { id:'u3q10_11', scene:'不小心说错话，道歉：',
            options:["I\'m sorry.","Thank you.","Me too."], correct:0 },
          { id:'u3q10_12', scene:'问有几颗豌豆：',
            options:["How many peas?","It\'s a pea.","Me too."], correct:0 },
        ],
      },
      {
        id: 11, type: 'match-columns', title: '十一、从 II 栏中选出 I 栏相对应的答句', titleEn: 'Match columns',
        hint: '点左边的题 → 再点右边的答', pickCount: 1, pointsPerItem: 12,
        bank: [{
          id: 'u3q11_01',
          pairs: [
            { q: 'Do you like carrots?',    a: 'Yes, I do.' },
            { q: 'An onion?',               a: 'No, thanks.' },
            { q: 'A pea?',                  a: 'Yes, please.' },
            { q: 'I like peppers.',         a: 'Me too.' },
            { q: 'Are peas sweet?',         a: 'Yes, they are.' },
            { q: 'How many carrots?',       a: 'Three carrots.' },
          ],
        }],
      },
      {
        id: 12, type: 'dialog-fill', title: '十二、从方框中选出正确的单词补全对话', titleEn: 'Dialog fill',
        hint: '点空位 → 从词库挑合适的词', pickCount: 1, pointsPerItem: 10,
        bank: [{
          id: 'u3q12_01',
          pool: ['like','carrots','Me','please','No'],
          dialog: [
            { speaker: 'A', parts: [{t:'I '}, {blank:'like'}, {t:' '}, {blank:'carrots'}, {t:'.'}] },
            { speaker: 'B', parts: [{blank:'Me'}, {t:' too!'}] },
            { speaker: 'A', parts: [{t:'An onion? '}, {blank:'No'}, {t:', thanks.'}] },
            { speaker: 'B', parts: [{t:'A pea? Yes, '}, {blank:'please'}, {t:'.'}] },
          ],
        }],
      },
    ],
  },

  /* ============================================================
   * Unit 4 · Spring（孩子当前学的单元，先做完整再扩其他）
   * ============================================================ */
  4: {
    unit: 4,
    title: 'Unit 4 · Spring',
    totalPoints: 100,
    sections: [
      /* —— 一、听录音选词（15 题库 / 每卷抽 6 · 每题 1 分 · 共 6 分） —— */
      {
        id: 1,
        type: 'listen-choose',
        title: '一、听录音选出所听到的内容',
        titleEn: 'Listen and choose',
        hint: '播放录音，点击听到的那个单词',
        pickCount: 6,
        pointsPerItem: 1,
        bank: [
          { id: 'q1_01', audio: 'vocab:u4_tree',     options: ['tree',     'three',   'free'],        correct: 0 },
          { id: 'q1_02', audio: 'vocab:u4_flower',   options: ['flower',   'flour',   'floor'],       correct: 0 },
          { id: 'q1_03', audio: 'vocab:u4_bird',     options: ['bird',     'bed',     'bag'],         correct: 0 },
          { id: 'q1_04', audio: 'vocab:u4_kite',     options: ['kite',     'kit',     'cat'],         correct: 0 },
          { id: 'q1_05', audio: 'vocab:u4_green',    options: ['green',    'grin',    'grey'],        correct: 0 },
          { id: 'q1_06', audio: 'vocab:u4_happy',    options: ['happy',    'hi',      'how'],         correct: 0 },
          { id: 'q1_07', audio: 'vocab:u4_spring',   options: ['spring',   'string',  'sprint'],      correct: 0 },
          { id: 'q1_08', audio: 'vocab:u4_beautiful',options: ['beautiful','butter',  'but'],         correct: 0 },
          { id: 'q1_09', audio: 'vocab:u4_colourful',options: ['colourful','cold',    'come'],        correct: 0 },
          // 与低单元混用做干扰
          { id: 'q1_10', audio: 'vocab:u2_book',     options: ['book',     'look',    'cook'],        correct: 0 },
          { id: 'q1_11', audio: 'vocab:u2_ruler',    options: ['ruler',    'rubber',  'river'],       correct: 0 },
          { id: 'q1_12', audio: 'vocab:u3_carrot',   options: ['carrot',   'cat',     'car'],         correct: 0 },
          { id: 'q1_13', audio: 'vocab:u1_yellow',   options: ['yellow',   'yo-yo',   'yummy'],       correct: 0 },
          { id: 'q1_14', audio: 'vocab:u1_five',     options: ['five',     'four',    'fine'],        correct: 0 },
          { id: 'q1_15', audio: 'vocab:u3_pea',      options: ['pea',      'pay',     'pig'],         correct: 0 },
        ],
      },

      /* —— 二、听录音判断句子 ✓/✗（15 题库 / 每卷 6 · 1 分 · 共 6 分） —— */
      {
        id: 2,
        type: 'listen-judge',
        title: '二、听录音判断听到的内容与图片是否相符',
        titleEn: 'Listen and judge',
        hint: '听句子 → 看图 → 相符打 ✓ 不符打 ✗',
        pickCount: 6,
        pointsPerItem: 1,
        bank: [
          { id: 'q2_01', audio: 'sent:s_u4_01', image: 'sent:s_u4_01', correct: true  },  // trees + green → 图对
          { id: 'q2_02', audio: 'sent:s_u4_02', image: 'sent:s_u4_02', correct: true  },  // flowers + beautiful → 对
          { id: 'q2_03', audio: 'sent:s_u4_03', image: 'sent:s_u4_03', correct: true  },
          { id: 'q2_04', audio: 'sent:s_u4_04', image: 'sent:s_u4_04', correct: true  },
          { id: 'q2_05', audio: 'sent:s_u4_01', image: 'sent:s_u4_04', correct: false },  // 错配：听 trees 但图是 kites
          { id: 'q2_06', audio: 'sent:s_u4_02', image: 'sent:s_u4_03', correct: false },
          { id: 'q2_07', audio: 'sent:s_u4_03', image: 'sent:s_u4_01', correct: false },
          { id: 'q2_08', audio: 'sent:s_u4_04', image: 'sent:s_u4_02', correct: false },
          { id: 'q2_09', audio: 'vocab:u4_tree', image: 'vocab:u4_tree', correct: true },
          { id: 'q2_10', audio: 'vocab:u4_flower', image: 'vocab:u4_flower', correct: true },
          { id: 'q2_11', audio: 'vocab:u4_bird', image: 'vocab:u4_kite', correct: false },
          { id: 'q2_12', audio: 'vocab:u4_kite', image: 'vocab:u4_bird', correct: false },
          { id: 'q2_13', audio: 'vocab:u4_happy', image: 'vocab:u4_happy', correct: true },
          { id: 'q2_14', audio: 'vocab:u4_green', image: 'vocab:u4_colourful', correct: false },
          { id: 'q2_15', audio: 'vocab:u4_spring', image: 'vocab:u4_spring', correct: true },
        ],
      },

      /* —— 七、字母左邻右舍（26 题库 / 每卷 4 · 1 分 · 共 4 分） —— */
      {
        id: 7,
        type: 'letter-neighbor',
        title: '七、写出下列字母的左邻右舍',
        titleEn: 'Letter neighbors',
        hint: '每个字母前后各有一个：__ B __ → A, C',
        pickCount: 4,
        pointsPerItem: 1,
        bank: [
          // A 和 Z 特殊：只有一侧
          { id: 'q7_Bb', letter: 'Bb', before: 'Aa', after: 'Cc' },
          { id: 'q7_Cc', letter: 'Cc', before: 'Bb', after: 'Dd' },
          { id: 'q7_Dd', letter: 'Dd', before: 'Cc', after: 'Ee' },
          { id: 'q7_Ee', letter: 'Ee', before: 'Dd', after: 'Ff' },
          { id: 'q7_Ff', letter: 'Ff', before: 'Ee', after: 'Gg' },
          { id: 'q7_Gg', letter: 'Gg', before: 'Ff', after: 'Hh' },
          { id: 'q7_Hh', letter: 'Hh', before: 'Gg', after: 'Ii' },
          { id: 'q7_Ii', letter: 'Ii', before: 'Hh', after: 'Jj' },
          { id: 'q7_Jj', letter: 'Jj', before: 'Ii', after: 'Kk' },
          { id: 'q7_Kk', letter: 'Kk', before: 'Jj', after: 'Ll' },
          { id: 'q7_Ll', letter: 'Ll', before: 'Kk', after: 'Mm' },
          { id: 'q7_Mm', letter: 'Mm', before: 'Ll', after: 'Nn' },
          { id: 'q7_Nn', letter: 'Nn', before: 'Mm', after: 'Oo' },
          { id: 'q7_Oo', letter: 'Oo', before: 'Nn', after: 'Pp' },
          { id: 'q7_Pp', letter: 'Pp', before: 'Oo', after: 'Qq' },
          { id: 'q7_Qq', letter: 'Qq', before: 'Pp', after: 'Rr' },
          { id: 'q7_Rr', letter: 'Rr', before: 'Qq', after: 'Ss' },
          { id: 'q7_Ss', letter: 'Ss', before: 'Rr', after: 'Tt' },
          { id: 'q7_Tt', letter: 'Tt', before: 'Ss', after: 'Uu' },
          { id: 'q7_Uu', letter: 'Uu', before: 'Tt', after: 'Vv' },
          { id: 'q7_Vv', letter: 'Vv', before: 'Uu', after: 'Ww' },
          { id: 'q7_Ww', letter: 'Ww', before: 'Vv', after: 'Xx' },
          { id: 'q7_Xx', letter: 'Xx', before: 'Ww', after: 'Yy' },
          { id: 'q7_Yy', letter: 'Yy', before: 'Xx', after: 'Zz' },
        ],
      },

      /* —— 八、选出不同类（20 题库 / 每卷 6 · 1 分 · 共 6 分） —— */
      {
        id: 8,
        type: 'odd-one-out',
        title: '八、选出每组中不同类的一项',
        titleEn: 'Find the odd one out',
        hint: '四个词里，选出跟其他三个不是一类的',
        pickCount: 6,
        pointsPerItem: 1,
        bank: [
          { id: 'q8_01', items: ['tree', 'flower', 'bird', 'book'],        correct: 3, note: '三个春天物，book 不是' },
          { id: 'q8_02', items: ['green', 'happy', 'red', 'yellow'],       correct: 1, note: '三个颜色，happy 是心情' },
          { id: 'q8_03', items: ['bird', 'kite', 'tree', 'fly'],           correct: 3, note: '三个名词，fly 是动词' },
          { id: 'q8_04', items: ['one', 'two', 'three', 'tree'],           correct: 3, note: '三个数字，tree 是树' },
          { id: 'q8_05', items: ['book', 'pencil', 'ruler', 'pig'],        correct: 3, note: '三个学习用品，pig 是动物' },
          { id: 'q8_06', items: ['apple', 'carrot', 'pea', 'pepper'],      correct: 0, note: '三个蔬菜，apple 是水果' },
          { id: 'q8_07', items: ['run', 'jump', 'hop', 'book'],            correct: 3, note: '三个动作，book 是名词' },
          { id: 'q8_08', items: ['pig', 'duck', 'cow', 'bee'],             correct: 3, note: '三个农场动物，bee 是昆虫' },
          { id: 'q8_09', items: ['butterfly', 'ladybird', 'dragonfly', 'spring'], correct: 3, note: '三个昆虫，spring 是季节' },
          { id: 'q8_10', items: ['yellow', 'green', 'red', 'five'],        correct: 3, note: '三个颜色，five 是数字' },
          { id: 'q8_11', items: ['bag', 'book', 'ruler', 'bird'],          correct: 3, note: '三个学习用品/随身物品' },
          { id: 'q8_12', items: ['Hi', 'Hello', 'Bye', 'Book'],            correct: 3, note: '三个打招呼，Book 不是' },
          { id: 'q8_13', items: ['happy', 'beautiful', 'colourful', 'count'], correct: 3, note: '三个形容词' },
          { id: 'q8_14', items: ['tree', 'three', 'trees', 'tea'],         correct: 3, note: 'tree 相关 → tea 不是' },
          { id: 'q8_15', items: ['cat', 'pig', 'cow', 'carrot'],           correct: 3, note: '三个动物' },
        ],
      },

      /* —— 三、听句判断与图片是否相符（12 题库 / 每卷 6 · 1 分 · 共 6 分）
       *     复用 listen-judge 渲染器，不同的是用单词音频 + 对应/错配图 —— */
      {
        id: 3,
        type: 'listen-judge',
        title: '三、听录音判断听到的句子与图片是否相符',
        titleEn: 'Listen and judge',
        hint: '听 → 对比图片 → 相符 ✓，不符 ✗',
        pickCount: 6,
        pointsPerItem: 1,
        bank: [
          // 正确配对：听啥看啥
          { id: 'q3_01', audio: 'vocab:u4_spring',    image: 'vocab:u4_spring',    correct: true  },
          { id: 'q3_02', audio: 'vocab:u4_tree',      image: 'vocab:u4_tree',      correct: true  },
          { id: 'q3_03', audio: 'vocab:u4_flower',    image: 'vocab:u4_flower',    correct: true  },
          { id: 'q3_04', audio: 'vocab:u4_bird',      image: 'vocab:u4_bird',      correct: true  },
          { id: 'q3_05', audio: 'vocab:u4_kite',      image: 'vocab:u4_kite',      correct: true  },
          { id: 'q3_06', audio: 'vocab:u4_happy',     image: 'vocab:u4_happy',     correct: true  },
          // 错配
          { id: 'q3_07', audio: 'vocab:u4_tree',      image: 'vocab:u4_flower',    correct: false },
          { id: 'q3_08', audio: 'vocab:u4_bird',      image: 'vocab:u4_kite',      correct: false },
          { id: 'q3_09', audio: 'vocab:u4_spring',    image: 'vocab:u4_happy',     correct: false },
          { id: 'q3_10', audio: 'vocab:u4_green',     image: 'vocab:u4_colourful', correct: false },
          { id: 'q3_11', audio: 'vocab:u4_beautiful', image: 'vocab:u4_tree',      correct: false },
          { id: 'q3_12', audio: 'vocab:u4_colourful', image: 'vocab:u4_green',     correct: false },
        ],
      },

      /* —— 四、听录音给图片排序（每卷抽 1 组 · 共 12 分） —— */
      {
        id: 4,
        type: 'listen-order',
        title: '四、听录音给下列图片排序',
        titleEn: 'Listen and order',
        hint: '按播放顺序给图片写 1–6',
        pickCount: 1,
        pointsPerItem: 12,     // 一组 6 张 × 2 = 12 分
        bank: [
          {
            id: 'q4_01',
            // sequence = 音频播放次序（按这个顺序播）
            sequence: ['sent:s_u4_03', 'sent:s_u4_01', 'sent:s_u4_04', 'sent:s_u4_02', 'sent:s_u4_05', 'sent:s_u4_07'],
            // images = 用户看到的图片（打乱过的），每张对应 sequence 里的一个位置
            // 正确答案 = images[i] 在 sequence 里的 1-based 位置
            images: ['sent:s_u4_01', 'sent:s_u4_02', 'sent:s_u4_03', 'sent:s_u4_04', 'sent:s_u4_05', 'sent:s_u4_07'],
          },
          {
            id: 'q4_02',
            sequence: ['sent:s_u4_02', 'sent:s_u4_04', 'sent:s_u4_01', 'sent:s_u4_03', 'sent:s_u4_06', 'sent:s_u4_05'],
            images: ['sent:s_u4_01', 'sent:s_u4_02', 'sent:s_u4_03', 'sent:s_u4_04', 'sent:s_u4_05', 'sent:s_u4_06'],
          },
        ],
      },

      /* —— 五、听录音选出相应的答句（15 题库 / 每卷 6 · 2 分 · 共 12 分） —— */
      {
        id: 5,
        type: 'listen-response',
        title: '五、听录音选出相应的答句',
        titleEn: 'Listen and choose response',
        hint: '听问句 → 选合适的英文答句',
        pickCount: 6,
        pointsPerItem: 2,
        bank: [
          // audio: 'quiz:q5_xx' 指向 audio/quiz/q5_xx.mp3（用 MiniMax 生成）
          { id:'q5_01', audio:'quiz:q5_01', audioText:"How are you?",                    options:["I'm fine, thanks.", "Yes, I do.", "It's a kite."],  correct:0 },
          { id:'q5_02', audio:'quiz:q5_02', audioText:"What's this?",                    options:["It's a kite.",      "Three birds.","Me too."],      correct:0 },
          { id:'q5_03', audio:'quiz:q5_03', audioText:"Do you like carrots?",            options:["Yes, I do.",        "Look!",       "Hi."],          correct:0 },
          { id:'q5_04', audio:'quiz:q5_04', audioText:"How many trees?",                 options:["Three trees.",      "No, thanks.", "I'm sorry."],   correct:0 },
          { id:'q5_05', audio:'quiz:q5_05', audioText:"Is this your book?",              options:["Yes, it is.",       "Me too.",     "Spring is here."], correct:0 },
          { id:'q5_06', audio:'quiz:q5_06', audioText:"Are you ready?",                  options:["Yes, let's go!",    "It's a flower.","Hello!"],      correct:0 },
          { id:'q5_07', audio:'quiz:q5_07', audioText:"What colour is it?",              options:["It's green.",       "It's a tree.",  "No, thanks."], correct:0 },
          { id:'q5_08', audio:'quiz:q5_08', audioText:"Look at the birds!",              options:["They're happy.",    "I'm sorry.",   "How many?"],    correct:0 },
          { id:'q5_09', audio:'quiz:q5_09', audioText:"An onion?",                       options:["No, thanks.",       "Yes, please.", "Look!"],        correct:0 },
          { id:'q5_10', audio:'quiz:q5_10', audioText:"I'm sorry.",                      options:["That's OK.",        "Me too.",     "Bye."],         correct:0 },
          { id:'q5_11', audio:'quiz:q5_11', audioText:"What's in your bag?",             options:["A book and a pencil.", "Yes, I do.", "Walk!"],     correct:0 },
          { id:'q5_12', audio:'quiz:q5_12', audioText:"Hello! I'm Cory.",                options:["Hi, Cory!",         "Me too.",     "No, thanks."], correct:0 },
          { id:'q5_13', audio:'quiz:q5_13', audioText:"What's that?",                    options:["It's a pig.",       "Three birds.","I'm ready."],   correct:0 },
          { id:'q5_14', audio:'quiz:q5_14', audioText:"Thank you.",                      options:["You're welcome.",   "Me too.",     "Bye."],         correct:0 },
          { id:'q5_15', audio:'quiz:q5_15', audioText:"I like flowers.",                 options:["Me too.",           "No, thanks.", "Hi."],          correct:0 },
        ],
      },

      /* —— 六、听对话填单词（8 题库 / 每卷抽 1 组 5 空 · 2 分 · 共 10 分） —— */
      {
        id: 6,
        type: 'listen-fill',
        title: '六、听录音选出正确的单词填空',
        titleEn: 'Listen and fill',
        hint: '听 → 从词库挑合适的词填进空位',
        pickCount: 1,
        pointsPerItem: 10,
        bank: [
          {
            id: 'q6_01',
            audio: 'quiz:q6_01',
            audioText: "Look! It's spring. The trees are green. The birds are happy. The kites are colourful!",
            pool: ['spring', 'green', 'birds', 'kites', 'colourful', 'happy'],
            dialog: [
              { speaker: 'Cory', parts: [{t:"Look! It's "}, {blank:'spring'}, {t:'!'}] },
              { speaker: 'Mom',  parts: [{t:'The trees are '}, {blank:'green'}, {t:'.'}] },
              { speaker: 'Cory', parts: [{t:'The '}, {blank:'birds'}, {t:' are '}, {blank:'happy'}, {t:'.'}] },
              { speaker: 'Mom',  parts: [{t:'The kites are '}, {blank:'colourful'}, {t:'!'}] },
            ],
          },
          {
            id: 'q6_02',
            audio: 'quiz:q6_02',
            audioText: "This is my book. That is my pencil. This is my ruler. Is this your rubber? Yes, it is.",
            pool: ['book', 'pencil', 'ruler', 'rubber', 'Yes', 'my'],
            dialog: [
              { speaker: 'A', parts: [{t:'This is my '}, {blank:'book'}, {t:'.'}] },
              { speaker: 'A', parts: [{t:'That is my '}, {blank:'pencil'}, {t:'.'}] },
              { speaker: 'A', parts: [{t:'This is my '}, {blank:'ruler'}, {t:'.'}] },
              { speaker: 'B', parts: [{t:'Is this your '}, {blank:'rubber'}, {t:'?'}] },
              { speaker: 'A', parts: [{blank:'Yes'}, {t:', it is.'}] },
            ],
          },
        ],
      },

      /* —— 九、图片判断句子（12 题库 / 每卷 4 · 1 分 · 共 4 分）
       *     纯笔试：显示图 + 英文句子，判 ✓/✗，不放音频 —— */
      {
        id: 9,
        type: 'pic-judge',
        title: '九、判断下列句子与图片是否相符',
        titleEn: 'Picture vs sentence',
        hint: '看图 + 读英文 → 相符 ✓，不符 ✗',
        pickCount: 4,
        pointsPerItem: 1,
        bank: [
          { id: 'q9_01', image: 'sent:s_u4_01', text: "Look at the trees. They're green.",       correct: true  },
          { id: 'q9_02', image: 'sent:s_u4_02', text: "Look at the flowers. They're beautiful.", correct: true  },
          { id: 'q9_03', image: 'sent:s_u4_03', text: "Look at the birds. They're happy.",       correct: true  },
          { id: 'q9_04', image: 'sent:s_u4_04', text: "Look at the kites. They're colourful.",   correct: true  },
          { id: 'q9_05', image: 'sent:s_u4_01', text: "Look at the flowers. They're beautiful.", correct: false },
          { id: 'q9_06', image: 'sent:s_u4_03', text: "Look at the kites. They're colourful.",   correct: false },
          { id: 'q9_07', image: 'vocab:u4_tree',     text: "It's a bird.",           correct: false },
          { id: 'q9_08', image: 'vocab:u4_bird',     text: "It's a bird.",           correct: true  },
          { id: 'q9_09', image: 'vocab:u4_kite',     text: "It's a kite.",           correct: true  },
          { id: 'q9_10', image: 'vocab:u4_flower',   text: "It's a flower.",         correct: true  },
          { id: 'q9_11', image: 'vocab:u4_colourful',text: "It's green.",            correct: false },
          { id: 'q9_12', image: 'vocab:u4_green',    text: "They're colourful.",     correct: false },
        ],
      },

      /* —— 十一、从 II 栏选 I 栏的答句（10 题库 / 每卷抽 1 组 6 连 · 2 分 · 共 12 分） —— */
      {
        id: 11,
        type: 'match-columns',
        title: '十一、从 II 栏中选出 I 栏相对应的答句',
        titleEn: 'Match columns',
        hint: '点左边的题 → 再点右边的答 → 配成对',
        pickCount: 1,          // 一整组
        pointsPerItem: 12,     // 一组 6 连 × 2 = 12 分
        bank: [
          {
            id: 'q11_01',
            pairs: [
              { q: 'Is this your book?',       a: 'Yes, it is.' },
              { q: 'How are you?',             a: "I'm fine, thanks." },
              { q: "What's this?",             a: "It's a kite." },
              { q: 'Do you like carrots?',     a: 'Yes, I do.' },
              { q: 'How many birds?',          a: 'Three birds.' },
              { q: 'Are you ready?',           a: "Yes, let's go!" },
            ],
          },
          {
            id: 'q11_02',
            pairs: [
              { q: "What's that?",             a: "It's a pig." },
              { q: "What's in your bag?",      a: 'A book and a pencil.' },
              { q: "An onion?",                a: "No, thanks." },
              { q: 'Look at the flowers.',     a: "They're beautiful!" },
              { q: "I'm sorry.",               a: "That's OK." },
              { q: "Hello! I'm Cory.",         a: "Hi, Cory!" },
            ],
          },
        ],
      },

      /* —— 十二、从方框中选词补全对话（8 题库 / 每卷抽 1 组 5 空 · 2 分 · 共 10 分） —— */
      {
        id: 12,
        type: 'dialog-fill',
        title: '十二、从方框中选出正确的单词补全对话',
        titleEn: 'Dialog fill',
        hint: '点空位 → 从词库挑合适的词',
        pickCount: 1,
        pointsPerItem: 10,     // 一组 5 空 × 2 = 10 分
        bank: [
          {
            id: 'q12_01',
            // 词库（含干扰项）
            pool: ['green', 'happy', 'spring', 'trees', 'colourful'],
            // 对话行：每行是 lines 数组，lines 里 [{t:'text'}|{blank:'answer'}]
            dialog: [
              { speaker: 'Cory', parts: [{t:'Look! It\'s '}, {blank:'spring'}, {t:'!'}] },
              { speaker: 'Mom',  parts: [{t:'The '}, {blank:'trees'}, {t:' are '}, {blank:'green'}, {t:'.'}] },
              { speaker: 'Cory', parts: [{t:'And the birds are '}, {blank:'happy'}, {t:'.'}] },
              { speaker: 'Mom',  parts: [{t:'The kites are so '}, {blank:'colourful'}, {t:'!'}] },
            ],
          },
          {
            id: 'q12_02',
            pool: ['book', 'pencil', 'my', 'ruler', 'is'],
            dialog: [
              { speaker: 'A', parts: [{t:'This '}, {blank:'is'}, {t:' '}, {blank:'my'}, {t:' '}, {blank:'pencil'}, {t:'.'}] },
              { speaker: 'B', parts: [{t:'Is this your '}, {blank:'book'}, {t:'?'}] },
              { speaker: 'A', parts: [{t:'No. It\'s my '}, {blank:'ruler'}, {t:'.'}] },
            ],
          },
        ],
      },

      /* —— 十、情景选择（15 题库 / 每卷 4 · 1 分 · 共 4 分） —— */
      {
        id: 10,
        type: 'scenario',
        title: '十、情景选择',
        titleEn: 'Pick the right response',
        hint: '根据场景，选最合适的英文',
        pickCount: 4,
        pointsPerItem: 1,
        bank: [
          { id: 'q10_01', scene: '你看到一棵大树，想说"这是一棵绿色的树"时，说：',
            options: ['Look at the tree. It\'s green.', 'Look at the flower.', 'Run, run, run.'], correct: 0 },
          { id: 'q10_02', scene: '别人给你一朵花，夸它漂亮，你说：',
            options: ['They\'re beautiful.', 'No, thanks.', 'Me too.'], correct: 0 },
          { id: 'q10_03', scene: '看到许多小鸟在天上飞，很开心，你说：',
            options: ['Look at the birds. They\'re happy.', 'I\'m sorry.', 'How many rulers?'], correct: 0 },
          { id: 'q10_04', scene: '看到五颜六色的风筝，想告诉朋友：',
            options: ['Look at the kites. They\'re colourful.', 'I like peppers.', 'One, two, three.'], correct: 0 },
          { id: 'q10_05', scene: '不小心撞到同学，你说：',
            options: ['I\'m sorry.', 'Me too.', 'Look!'], correct: 0 },
          { id: 'q10_06', scene: '别人跟你说 sorry，你说没关系：',
            options: ['That\'s OK.', 'No, thanks.', 'Yes, please.'], correct: 0 },
          { id: 'q10_07', scene: '老师问你要不要饼干，你想要：',
            options: ['Yes, please.', 'No, thanks.', 'Me too.'], correct: 0 },
          { id: 'q10_08', scene: '你说你喜欢胡萝卜，同桌也喜欢，他会说：',
            options: ['Me too.', 'I\'m sorry.', 'Cool!'], correct: 0 },
          { id: 'q10_09', scene: '想让大家看你的铅笔，你说：',
            options: ['Look at my pencil.', 'How many pencils?', 'I\'m sorry.'], correct: 0 },
          { id: 'q10_10', scene: '数数有几本书，你问：',
            options: ['How many books?', 'Look at the book.', 'Me too.'], correct: 0 },
          { id: 'q10_11', scene: '见到新同学，你说：',
            options: ['Hi! I\'m Cory.', 'Bye.', 'No, thanks.'], correct: 0 },
          { id: 'q10_12', scene: '一起出发跑步时喊：',
            options: ['Are you ready? Let\'s go!', 'Spring is here.', 'Walk to the tree.'], correct: 0 },
          { id: 'q10_13', scene: '看到小猪在农场，你说：',
            options: ['It\'s a pig.', 'It\'s a cow.', 'It\'s a kite.'], correct: 0 },
          { id: 'q10_14', scene: '想问朋友这是什么：',
            options: ['What\'s this?', 'How many?', 'Are you ready?'], correct: 0 },
          { id: 'q10_15', scene: '觉得东西很酷，感叹一声：',
            options: ['Cool!', 'Ouch!', 'Sorry.'], correct: 0 },
        ],
      },
    ],
  },
};

/* ==================== 工具 ==================== */

// 高危词"替换版"清单(speech-2.6-hd 重生,发音正确)
// 对这里的词,resolveQuizAsset 优先返回 vocab_v2/ 路径
// 清空:改用 Edge TTS en-US-GuyNeural 重生所有 137 词(2026-04-21)
// Edge 按音素字典发音,不需要短语 workaround
// 旧 MiniMax 版本备份在 audio/vocab_minimax_backup/,旧短语版在 audio/vocab_v2/
const VOCAB_V2_OVERRIDES = new Set([]);

// 解析 audio/image 引用字符串（vocab:u4_tree / sent:s_u4_01 / quiz:q_xxx）
function resolveQuizAsset(ref, kind /* 'audio' | 'image' */) {
  if (!ref) return null;
  const [prefix, id] = String(ref).split(':');
  if (kind === 'audio') {
    if (prefix === 'vocab') {
      // 高危词优先用 v2 的正确版
      if (VOCAB_V2_OVERRIDES.has(id)) return `./audio/vocab_v2/${id}.mp3`;
      return `./audio/vocab/${id}.mp3`;
    }
    if (prefix === 'sent')  return `./audio/sentences/${id}.mp3`;
    if (prefix === 'coach') return `./audio/coach/${id}.mp3`;
    if (prefix === 'quiz')  return `./audio/quiz/${id}.mp3`;
  } else if (kind === 'image') {
    if (prefix === 'vocab') return `./audio/images/vocab/${id}.jpg`;
    if (prefix === 'sent')  return `./audio/images/sentences/${id}.jpg`;
    if (prefix === 'quiz')  return `./audio/images/quiz/${id}.jpg`;
  }
  return null;
}

// 从题库随机抽 N 道（保留原顺序中的 ID 稳定 seed，避免每次刷新全变）
function sampleQuizItems(bank, n) {
  if (bank.length <= n) return bank.slice();
  const shuffled = bank.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// 生成一套考卷（按 sections 配置抽题 · 按 id 排序）
function generateQuizPaper(unit) {
  const u = QUIZ_BANKS[unit];
  if (!u) return null;
  return {
    unit: u.unit,
    title: u.title,
    totalPoints: u.totalPoints,
    startedAt: Date.now(),
    sections: u.sections.slice().sort((a, b) => a.id - b.id).map(sec => ({
      id: sec.id,
      type: sec.type,
      title: sec.title,
      titleEn: sec.titleEn,
      hint: sec.hint,
      pointsPerItem: sec.pointsPerItem,
      items: sampleQuizItems(
        // 支持字符串引用（如 'SHARED_LETTERS'）
        typeof sec.bank === 'string'
          ? (sec.bank === 'SHARED_LETTERS' ? SHARED_LETTER_NEIGHBORS : [])
          : sec.bank,
        sec.pickCount
      ),
      userAnswers: {},  // { itemId: userAnswer }
      graded: false,
    })),
  };
}

/* ================================================================
 * U3 模拟卷 · 两套高质量定卷（不抽题，每套内容固定，与练习模式互不重复）
 * ----------------------------------------------------------------
 * 设计原则：
 *   1. 严格沿用真考卷 12 大题结构 + 总分 100
 *   2. 每套内容完全确定（pickCount === bank.length），刷新不变
 *   3. 两套之间无内容重复，覆盖全部 U3 核心词 + 句
 *   4. 难度阶梯：卷一偏基础，卷二略提分
 * ================================================================ */
const U3_MOCK_PAPERS = {
  /* ==================== 模拟卷 1 ==================== */
  1: {
    unit: 3, mockId: 1, title: 'Unit 3 · 模拟卷一 · I like carrots',
    totalPoints: 100,
    sections: [
      { id:1, type:'listen-choose', title:'一、听录音，选出所听到的内容', titleEn:'Listen and choose',
        hint:'听词 → 在 A/B/C 三个里选一个', pickCount:6, pointsPerItem:1, bank:[
          { id:'m1q1_01', audio:'vocab:u3_carrot', options:['carrot','cat','car'],     correct:0 },
          { id:'m1q1_02', audio:'vocab:u3_onion',  options:['onion','orange','open'],  correct:0 },
          { id:'m1q1_03', audio:'vocab:u3_pea',    options:['pea','pay','pig'],        correct:0 },
          { id:'m1q1_04', audio:'vocab:u3_pepper', options:['pepper','paper','puppy'], correct:0 },
          { id:'m1q1_05', audio:'vocab:u3_like',   options:['like','lick','kite'],     correct:0 },
          { id:'m1q1_06', audio:'vocab:u3_all',    options:['all','ball','apple'],     correct:0 },
        ],
      },
      { id:2, type:'listen-judge', title:'二、听句子，判断与图片是否相符', titleEn:'Listen and judge',
        hint:'听 → 看图 → 相符 ✓ 不符 ✗', pickCount:6, pointsPerItem:1, bank:[
          { id:'m1q2_01', audio:'sent:s_u3_01', image:'sent:s_u3_01', correct:true  },
          { id:'m1q2_02', audio:'sent:s_u3_02', image:'sent:s_u3_02', correct:true  },
          { id:'m1q2_03', audio:'sent:s_u3_03', image:'sent:s_u3_04', correct:false },
          { id:'m1q2_04', audio:'sent:s_u3_04', image:'sent:s_u3_03', correct:false },
          { id:'m1q2_05', audio:'sent:s_u3_05', image:'sent:s_u3_05', correct:true  },
          { id:'m1q2_06', audio:'sent:s_u3_07', image:'sent:s_u3_06', correct:false },
        ],
      },
      { id:3, type:'listen-judge', title:'三、听单词，判断与图片是否相符', titleEn:'Listen word and judge picture',
        hint:'听单词 → 看图 → 相符 ✓ 不符 ✗', pickCount:6, pointsPerItem:1, bank:[
          { id:'m1q3_01', audio:'vocab:u3_carrot',    image:'vocab:u3_carrot',    correct:true  },
          { id:'m1q3_02', audio:'vocab:u3_pea',       image:'vocab:u3_pea',       correct:true  },
          { id:'m1q3_03', audio:'vocab:u3_onion',     image:'vocab:u3_pepper',    correct:false },
          { id:'m1q3_04', audio:'vocab:u3_we',        image:'vocab:u3_we',        correct:true  },
          { id:'m1q3_05', audio:'vocab:u3_all',       image:'vocab:u3_all',       correct:true  },
          { id:'m1q3_06', audio:'vocab:u3_metoo',     image:'vocab:u3_yesplease', correct:false },
        ],
      },
      { id:4, type:'listen-order', title:'四、听录音，给下列图片排序', titleEn:'Listen and order',
        hint:'按播放顺序在每张图下写 1–6', pickCount:1, pointsPerItem:12, bank:[{
          id: 'm1q4_01',
          sequence: ['sent:s_u3_03', 'sent:s_u3_01', 'sent:s_u3_05', 'sent:s_u3_02', 'sent:s_u3_04', 'sent:s_u3_07'],
          images:   ['sent:s_u3_01', 'sent:s_u3_02', 'sent:s_u3_03', 'sent:s_u3_04', 'sent:s_u3_05', 'sent:s_u3_07'],
        }],
      },
      { id:5, type:'listen-response', title:'五、听问句，选出相应的答句', titleEn:'Listen and choose response',
        hint:'听问句 → 选合适的英文答句', pickCount:6, pointsPerItem:2, bank:[
          { id:'m1q5_01', audio:'quiz:u3q5_01', audioText:'Do you like carrots?',
            options:['Yes, I do.','Me too.','No, thanks.'], correct:0 },
          { id:'m1q5_02', audio:'quiz:u3q5_02', audioText:'An onion?',
            options:['No, thanks.','Yes, please.','Look!'], correct:0 },
          { id:'m1q5_03', audio:'quiz:u3q5_03', audioText:'A pea?',
            options:['Yes, please.',"No, I don't.",'Hi.'], correct:0 },
          { id:'m1q5_04', audio:'quiz:u3q5_04', audioText:'I like peppers.',
            options:['Me too.','No, thanks.','Yes, I do.'], correct:0 },
          { id:'m1q5_07', audio:'quiz:u3q5_07', audioText:'Do you like onions?',
            options:['No, thanks.','Yes, please.','Me too.'], correct:0 },
          { id:'m1q5_09', audio:'quiz:u3q5_09', audioText:'Thank you.',
            options:["You're welcome.",'Me too.','Yes, please.'], correct:0 },
        ],
      },
      { id:6, type:'listen-fill', title:'六、听对话，从方框中选出正确的单词补全对话', titleEn:'Listen and fill',
        hint:'点空位 → 从词库挑合适的词', pickCount:1, pointsPerItem:10, bank:[{
          id: 'm1q6_01',
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
        }],
      },
      { id:7, type:'letter-neighbor', title:'七、写出下列字母的左邻右舍', titleEn:'Letter neighbors',
        hint:'每个字母前后各有一个：__ B __ → A, C', pickCount:4, pointsPerItem:1, bank:[
          { id:'m1q7_01', letter:'Cc', before:'Bb', after:'Dd' },
          { id:'m1q7_02', letter:'Ff', before:'Ee', after:'Gg' },
          { id:'m1q7_03', letter:'Mm', before:'Ll', after:'Nn' },
          { id:'m1q7_04', letter:'Tt', before:'Ss', after:'Uu' },
        ],
      },
      { id:8, type:'odd-one-out', title:'八、选出每组中不同类的一项', titleEn:'Find the odd one out',
        hint:'四个里挑跟其他三个不是一类的', pickCount:6, pointsPerItem:1, bank:[
          { id:'m1q8_01', items:['carrot','pea','pepper','book'],   correct:3, note:'三个蔬菜 / book 文具' },
          { id:'m1q8_02', items:['onion','apple','pear','cake'],    correct:0, note:'onion 蔬菜 / 其余水果甜食' },
          { id:'m1q8_03', items:['yes','no','please','pepper'],     correct:3, note:'pepper 是蔬菜' },
          { id:'m1q8_04', items:['me','we','you','pea'],            correct:3, note:'三个代词 / pea 蔬菜' },
          { id:'m1q8_05', items:['green','red','yellow','pea'],     correct:3, note:'三个颜色 / pea 蔬菜' },
          { id:'m1q8_06', items:['eat','like','love','pepper'],     correct:3, note:'三个动词 / pepper 蔬菜' },
        ],
      },
      { id:9, type:'pic-judge', title:'九、判断下列句子与图片是否相符', titleEn:'Picture vs sentence',
        hint:'看图 + 读英文 → 相符 ✓ 不符 ✗', pickCount:4, pointsPerItem:1, bank:[
          { id:'m1q9_01', image:'vocab:u3_carrot', text:"It's a carrot.",          correct:true  },
          { id:'m1q9_02', image:'vocab:u3_pea',    text:"It's a pepper.",          correct:false },
          { id:'m1q9_03', image:'sent:s_u3_01',    text:'I like carrots. Me too!', correct:true  },
          { id:'m1q9_04', image:'sent:s_u3_03',    text:'An onion? No, thanks.',   correct:false },
        ],
      },
      { id:10, type:'scenario', title:'十、情景选择', titleEn:'Pick the right response',
        hint:'根据中文场景，挑最合适的英文', pickCount:4, pointsPerItem:1, bank:[
          { id:'m1q10_01', scene:'同学请你吃胡萝卜，你想吃，说：',
            options:['Yes, please.','No, thanks.','Me too.'], correct:0 },
          { id:'m1q10_02', scene:'别人让你吃洋葱，你不想吃，礼貌拒绝：',
            options:['No, thanks.','Yes, please.','Hi.'], correct:0 },
          { id:'m1q10_03', scene:'你说"我喜欢甜椒"，朋友也喜欢，他说：',
            options:['Me too.','No.','Bye.'], correct:0 },
          { id:'m1q10_04', scene:'想表达"我们都喜欢甜椒"：',
            options:['We all like peppers.','I like onions.','How many?'], correct:0 },
        ],
      },
      { id:11, type:'match-columns', title:'十一、从 II 栏中选出 I 栏相对应的答句', titleEn:'Match columns',
        hint:'点左边的题 → 再点右边的答', pickCount:1, pointsPerItem:12, bank:[{
          id:'m1q11_01',
          pairs:[
            { q:'Do you like carrots?',  a:'Yes, I do.' },
            { q:'An onion?',             a:'No, thanks.' },
            { q:'A pea?',                a:'Yes, please.' },
            { q:'I like peppers.',       a:'Me too.' },
            { q:'Thank you.',            a:"You're welcome." },
            { q:'How many carrots?',     a:'Three carrots.' },
          ],
        }],
      },
      { id:12, type:'dialog-fill', title:'十二、从方框中选出正确的单词补全对话', titleEn:'Dialog fill',
        hint:'点空位 → 从词库挑合适的词', pickCount:1, pointsPerItem:10, bank:[{
          id:'m1q12_01',
          pool:['like','carrots','Me','please','No'],
          dialog:[
            { speaker:'A', parts:[{t:'I '},{blank:'like'},{t:' '},{blank:'carrots'},{t:'.'}] },
            { speaker:'B', parts:[{blank:'Me'},{t:' too!'}] },
            { speaker:'A', parts:[{t:'An onion? '},{blank:'No'},{t:', thanks.'}] },
            { speaker:'B', parts:[{t:'A pea? Yes, '},{blank:'please'},{t:'.'}] },
          ],
        }],
      },
    ],
  },

  /* ==================== 模拟卷 2 ==================== */
  2: {
    unit: 3, mockId: 2, title: 'Unit 3 · 模拟卷二 · We all like peppers',
    totalPoints: 100,
    sections: [
      { id:1, type:'listen-choose', title:'一、听录音，选出所听到的内容', titleEn:'Listen and choose',
        hint:'听词 → 在 A/B/C 三个里选一个', pickCount:6, pointsPerItem:1, bank:[
          { id:'m2q1_01', audio:'vocab:u3_pea',    options:['pea','pay','pig'],        correct:0 },
          { id:'m2q1_02', audio:'vocab:u3_carrot', options:['carrot','cat','car'],     correct:0 },
          { id:'m2q1_03', audio:'vocab:u3_onion',  options:['onion','orange','open'],  correct:0 },
          { id:'m2q1_04', audio:'vocab:u3_pepper', options:['pepper','paper','puppy'], correct:0 },
          { id:'m2q1_05', audio:'vocab:u3_we',     options:['we','me','see'],          correct:0 },
          { id:'m2q1_06', audio:'vocab:u3_like',   options:['like','lick','kite'],     correct:0 },
        ],
      },
      { id:2, type:'listen-judge', title:'二、听句子，判断与图片是否相符', titleEn:'Listen and judge',
        hint:'听 → 看图 → 相符 ✓ 不符 ✗', pickCount:6, pointsPerItem:1, bank:[
          { id:'m2q2_01', audio:'sent:s_u3_03', image:'sent:s_u3_03', correct:true  },
          { id:'m2q2_02', audio:'sent:s_u3_04', image:'sent:s_u3_04', correct:true  },
          { id:'m2q2_03', audio:'sent:s_u3_01', image:'sent:s_u3_02', correct:false },
          { id:'m2q2_04', audio:'sent:s_u3_06', image:'sent:s_u3_06', correct:true  },
          { id:'m2q2_05', audio:'sent:s_u3_07', image:'sent:s_u3_07', correct:true  },
          { id:'m2q2_06', audio:'sent:s_u3_02', image:'sent:s_u3_05', correct:false },
        ],
      },
      { id:3, type:'listen-judge', title:'三、听单词，判断与图片是否相符', titleEn:'Listen word and judge picture',
        hint:'听单词 → 看图 → 相符 ✓ 不符 ✗', pickCount:6, pointsPerItem:1, bank:[
          { id:'m2q3_01', audio:'vocab:u3_pepper',    image:'vocab:u3_pepper',    correct:true  },
          { id:'m2q3_02', audio:'vocab:u3_like',      image:'vocab:u3_like',      correct:true  },
          { id:'m2q3_03', audio:'vocab:u3_pea',       image:'vocab:u3_carrot',    correct:false },
          { id:'m2q3_04', audio:'vocab:u3_yesplease', image:'vocab:u3_yesplease', correct:true  },
          { id:'m2q3_05', audio:'vocab:u3_nothanks',  image:'vocab:u3_metoo',     correct:false },
          { id:'m2q3_06', audio:'vocab:u3_we',        image:'vocab:u3_all',       correct:false },
        ],
      },
      { id:4, type:'listen-order', title:'四、听录音，给下列图片排序', titleEn:'Listen and order',
        hint:'按播放顺序在每张图下写 1–6', pickCount:1, pointsPerItem:12, bank:[{
          id: 'm2q4_01',
          sequence: ['sent:s_u3_04', 'sent:s_u3_02', 'sent:s_u3_06', 'sent:s_u3_05', 'sent:s_u3_01', 'sent:s_u3_03'],
          images:   ['sent:s_u3_01', 'sent:s_u3_02', 'sent:s_u3_03', 'sent:s_u3_04', 'sent:s_u3_05', 'sent:s_u3_06'],
        }],
      },
      { id:5, type:'listen-response', title:'五、听问句，选出相应的答句', titleEn:'Listen and choose response',
        hint:'听问句 → 选合适的英文答句', pickCount:6, pointsPerItem:2, bank:[
          { id:'m2q5_01', audio:'quiz:u3q5_05', audioText:'What colour are peas?',
            options:['Green.','Red.','Yellow.'], correct:0 },
          { id:'m2q5_02', audio:'quiz:u3q5_06', audioText:'Are peas sweet?',
            options:['Yes, they are.','No, thanks.','I like them.'], correct:0 },
          { id:'m2q5_03', audio:'quiz:u3q5_08', audioText:'Carrots, please.',
            options:['Here you are.','No, thanks.','Look!'], correct:0 },
          { id:'m2q5_04', audio:'quiz:u3q5_10', audioText:'How many peas?',
            options:['Five peas.','Three books.','Me too.'], correct:0 },
          { id:'m2q5_05', audio:'quiz:u3q5_11', audioText:'Yummy!',
            options:['Me too!','No.','Bye.'], correct:0 },
          { id:'m2q5_06', audio:'quiz:u3q5_12', audioText:'I like it.',
            options:['Me too.','Sorry.','Walk.'], correct:0 },
        ],
      },
      { id:6, type:'listen-fill', title:'六、听对话，从方框中选出正确的单词补全对话', titleEn:'Listen and fill',
        hint:'点空位 → 从词库挑合适的词', pickCount:1, pointsPerItem:10, bank:[{
          id: 'm2q6_01',
          audio: 'quiz:u3q6_01',
          audioText: 'I like carrots. Me too! An onion? No, thanks. A pea? Yes, please. We all like peppers.',
          pool: ['I','Me','onion','please','peppers'],
          dialog: [
            { speaker:'A', parts:[{blank:'I'},{t:' like carrots.'}] },
            { speaker:'B', parts:[{blank:'Me'},{t:' too!'}] },
            { speaker:'A', parts:[{t:'An '},{blank:'onion'},{t:'? No, thanks.'}] },
            { speaker:'B', parts:[{t:'A pea? Yes, '},{blank:'please'},{t:'.'}] },
            { speaker:'A', parts:[{t:'We all like '},{blank:'peppers'},{t:'.'}] },
          ],
        }],
      },
      { id:7, type:'letter-neighbor', title:'七、写出下列字母的左邻右舍', titleEn:'Letter neighbors',
        hint:'每个字母前后各有一个：__ B __ → A, C', pickCount:4, pointsPerItem:1, bank:[
          { id:'m2q7_01', letter:'Dd', before:'Cc', after:'Ee' },
          { id:'m2q7_02', letter:'Hh', before:'Gg', after:'Ii' },
          { id:'m2q7_03', letter:'Pp', before:'Oo', after:'Qq' },
          { id:'m2q7_04', letter:'Ww', before:'Vv', after:'Xx' },
        ],
      },
      { id:8, type:'odd-one-out', title:'八、选出每组中不同类的一项', titleEn:'Find the odd one out',
        hint:'四个里挑跟其他三个不是一类的', pickCount:6, pointsPerItem:1, bank:[
          { id:'m2q8_01', items:['carrot','onion','pea','five'],     correct:3, note:'三个蔬菜 / five 数字' },
          { id:'m2q8_02', items:['book','pencil','ruler','carrot'],  correct:3, note:'三个学习用品' },
          { id:'m2q8_03', items:['like','eat','walk','carrot'],      correct:3, note:'三个动词' },
          { id:'m2q8_04', items:['sweet','yummy','green','book'],    correct:3, note:'三个形容词' },
          { id:'m2q8_05', items:['one','two','three','like'],        correct:3, note:'三个数字' },
          { id:'m2q8_06', items:['tree','flower','bird','carrot'],   correct:3, note:'三个春天物' },
        ],
      },
      { id:9, type:'pic-judge', title:'九、判断下列句子与图片是否相符', titleEn:'Picture vs sentence',
        hint:'看图 + 读英文 → 相符 ✓ 不符 ✗', pickCount:4, pointsPerItem:1, bank:[
          { id:'m2q9_01', image:'vocab:u3_onion',  text:"It's an onion.",        correct:true  },
          { id:'m2q9_02', image:'vocab:u3_pepper', text:"It's a pea.",           correct:false },
          { id:'m2q9_03', image:'sent:s_u3_04',    text:'We all like peppers.',  correct:true  },
          { id:'m2q9_04', image:'sent:s_u3_02',    text:'A pea? Yes, please.',   correct:false },
        ],
      },
      { id:10, type:'scenario', title:'十、情景选择', titleEn:'Pick the right response',
        hint:'根据中文场景，挑最合适的英文', pickCount:4, pointsPerItem:1, bank:[
          { id:'m2q10_01', scene:'夸豌豆好吃：',
            options:["They're yummy!","I'm sorry.","Three peas."], correct:0 },
          { id:'m2q10_02', scene:'描述豌豆又甜又绿：',
            options:['Peas are sweet and green.','Peas are red.','Peas are big.'], correct:0 },
          { id:'m2q10_03', scene:'有人感谢你递了胡萝卜，你回答：',
            options:["You're welcome.",'No, thanks.','Hi.'], correct:0 },
          { id:'m2q10_04', scene:'问"有几颗豌豆"：',
            options:['How many peas?',"It's a pea.",'Me too.'], correct:0 },
        ],
      },
      { id:11, type:'match-columns', title:'十一、从 II 栏中选出 I 栏相对应的答句', titleEn:'Match columns',
        hint:'点左边的题 → 再点右边的答', pickCount:1, pointsPerItem:12, bank:[{
          id:'m2q11_01',
          pairs:[
            { q:'What colour are peas?',  a:'Green.' },
            { q:'Are peas sweet?',        a:'Yes, they are.' },
            { q:'Carrots, please.',       a:'Here you are.' },
            { q:'How many peas?',         a:'Five peas.' },
            { q:'Yummy!',                 a:'Me too!' },
            { q:'Do you like onions?',    a:'No, thanks.' },
          ],
        }],
      },
      { id:12, type:'dialog-fill', title:'十二、从方框中选出正确的单词补全对话', titleEn:'Dialog fill',
        hint:'点空位 → 从词库挑合适的词', pickCount:1, pointsPerItem:10, bank:[{
          id:'m2q12_01',
          pool:['We','peppers','too','onion','thanks'],
          dialog:[
            { speaker:'A', parts:[{blank:'We'},{t:' all like '},{blank:'peppers'},{t:'.'}] },
            { speaker:'B', parts:[{t:'Me '},{blank:'too'},{t:'!'}] },
            { speaker:'A', parts:[{t:'An '},{blank:'onion'},{t:'?'}] },
            { speaker:'B', parts:[{t:'No, '},{blank:'thanks'},{t:'.'}] },
          ],
        }],
      },
    ],
  },
};

// 生成模拟卷的 paper（与 generateQuizPaper 相同结构，但所有 items 都是固定的）
function generateMockPaper(unit, mockId) {
  if (unit !== 3) return null;          // 目前只 U3 有
  const u = U3_MOCK_PAPERS[mockId];
  if (!u) return null;
  return {
    unit: u.unit,
    mockId: u.mockId,
    title: u.title,
    totalPoints: u.totalPoints,
    startedAt: Date.now(),
    sections: u.sections.slice().sort((a, b) => a.id - b.id).map(sec => ({
      id: sec.id,
      type: sec.type,
      title: sec.title,
      titleEn: sec.titleEn,
      hint: sec.hint,
      pointsPerItem: sec.pointsPerItem,
      // 模拟卷不抽题，全用
      items: typeof sec.bank === 'string'
        ? (sec.bank === 'SHARED_LETTERS' ? SHARED_LETTER_NEIGHBORS.slice(0, sec.pickCount) : [])
        : sec.bank.slice(),
      userAnswers: {},
      graded: false,
    })),
  };
}

/* ==================== 暴露 ==================== */
if (typeof window !== 'undefined') {
  window.QUIZ_BANKS        = QUIZ_BANKS;
  window.U3_MOCK_PAPERS    = U3_MOCK_PAPERS;
  window.resolveQuizAsset  = resolveQuizAsset;
  window.sampleQuizItems   = sampleQuizItems;
  window.generateQuizPaper = generateQuizPaper;
  window.generateMockPaper = generateMockPaper;
}
