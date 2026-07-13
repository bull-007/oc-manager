// Curated OC questions — one per day per OC
export const QUESTION_BANK = [
  "TA最不可能原谅的事是什么？",
  "TA的手机壁纸现在是什么？",
  "如果TA穿越到现实世界，第一件事会做什么？",
  "TA最害怕失去的东西是什么？",
  "TA一个人的时候会做什么？",
  "TA最擅长的家务是什么？或者说TA会做家务吗？",
  "TA收到过的最珍贵的礼物是什么？",
  "TA会因为什么哭？上一次哭是什么时候？",
  "TA的理想型是什么样的？",
  "TA最喜欢的季节是哪个？为什么？",
  "TA有没有什么改不掉的小毛病？",
  "TA的幸运物是什么？",
  "TA最想对谁说一声对不起？",
  "如果TA可以变成一种动物，想变成什么？",
  "TA的房间里最乱的是什么？",
  "TA失眠的时候在想什么？",
  "TA有没有从小带到大的东西？",
  "TA的社交账号头像是什么样的？",
  "TA最讨厌的食物是什么？为什么？",
  "TA有没有偷偷喜欢过谁？",
  "TA觉得自己十年后会在做什么？",
  "TA的绝活/特技是什么？",
  "如果TA只能带三样东西去荒岛，会带什么？",
  "TA被别人说过最多的一句评价是什么？",
  "TA最引以为傲的一件事是什么？",
  "TA有没有暗地里在练习什么技能？",
  "如果TA能复活一个人，会是谁？",
  "TA的衣柜里最多的是什么颜色的衣服？",
  "TA给别人起过外号吗？",
  "TA小时候的梦想是什么？现在变了吗？",
  "TA有写日记的习惯吗？",
  "TA的手机里最多的APP类型是什么？",
  "TA会被什么样的人吸引？",
  "TA有没有什么奇怪的收集癖？",
  "TA第一次独自出门是几岁？去哪儿了？",
  "如果TA能改变过去的一件事，会是什么？",
  "TA对「家」的定义是什么？",
  "TA有没有什么迷信或者小仪式？",
  "TA最常做的梦是什么？",
  "TA的签名是什么样的？",
  "如果有天TA成名了，因为什么？",
  "TA在朋友中扮演什么样的角色？",
  "TA有没有想要却一直没勇气去做的事？",
  "TA觉得自己最大的成长是什么？",
  "TA有没有什么奇怪的笑点？",
  "TA的专属放松方式是什么？",
  "TA会为了在乎的人做到什么地步？",
  "TA最喜欢的天气是什么？",
  "TA有没有被背叛过的经历？",
  "TA如果中了彩票，第一件事做什么？",
];

export function getDailyQuestion(ocId: string, dayOffset: number = 0): string {
  // Deterministic daily question based on OC id + date
  const today = new Date();
  today.setDate(today.getDate() + dayOffset);
  const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const seed = hashCode(ocId + dateStr);
  return QUESTION_BANK[seed % QUESTION_BANK.length];
}

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
