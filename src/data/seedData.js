/**
 * 50 条测试任务数据，用于一键填充
 */
const today = new Date();
const pad = (n) => String(n).padStart(2, '0');
const dateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeStr = (h, m) => `${pad(h)}:${pad(m)}`;

const titles = [
  '完成季度汇报PPT', '晨间阅读30分钟', '回复客户邮件', '整理桌面与文档', '跑步5公里',
  '学习React Hooks', '与团队同步进度', '写周报', '冥想10分钟', '预约牙科检查',
  '采购办公用品', '复习英语单词', '整理会议纪要', '更新项目看板', '午休散步',
  '撰写技术方案', '复盘昨日任务', '回复Slack消息', '阅读产品文档', '陪家人晚餐',
  '准备面试题', '写日记', '核对发票', '代码Code Review', '拉伸运动',
  '跟进合作方合同', '听播客一集', '整理周计划', '修复线上Bug', '早睡不熬夜',
  '设计新功能原型', '背单词50个', '参加站会', '更新依赖版本', '泡茶休息',
  '撰写需求文档', '练字一页', '与产品对需求', '部署测试环境', '周末大扫除',
  '学习Tailwind', '复盘项目', '回复知乎评论', '写单元测试', '看电影放松',
  '准备分享内容', '整理书单', '与导师1on1', '优化首屏加载', '睡前阅读',
];

export const seedTasks = (() => {
  const list = [];
  const domains = ['work', 'growth', 'life'];
  for (let i = 0; i < 50; i++) {
    const dayOffset = -3 + Math.floor(i / 8);
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    const hour = 8 + (i % 10);
    const minute = (i % 4) * 15;
    const domain = domains[i % 3];
    const completed = i % 4 === 0;
    const isImportant = i % 3 === 0 || i % 5 === 0;
    const isUrgent = i % 4 === 1 || i % 5 === 1;
    const isCore = i === 5 && !completed;
    list.push({
      id: 1700000000000 + i * 10000,
      title: titles[i],
      completed,
      domain,
      isImportant,
      isUrgent,
      isCore,
      date: dateStr(d),
      time: timeStr(hour, minute),
      note: i % 5 === 0 ? '这是一条备注，可用于记录心流或补充说明。' : '',
    });
  }
  return list.sort((a, b) => `${a.date} ${a.time}` > `${b.date} ${b.time}` ? 1 : -1);
})();
