import React from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import Icon from './Icon.jsx';

const QUOTES = [
  { text: '时间不在于你拥有多少，而在于你怎样使用。', author: '艾克' },
  { text: '我们无法创造时间，但可以决定把时间花在什么上。', author: '格雷格·麦吉沃恩' },
  { text: '心流是当你完全沉浸于所做之事时，时间仿佛消失的状态。', author: '米哈里·契克森米哈赖' },
  { text: '意图决定注意力，注意力决定人生。', author: '威廉·詹姆斯' },
  { text: '把每一天当作生命的最后一天来过，终有一日你会是对的。', author: '史蒂夫·乔布斯' },
  { text: '专注是心流的前提；心流是专注的奖赏。', author: '米哈里·契克森米哈赖' },
  { text: '知道为什么而活的人，几乎可以承受任何境遇。', author: '维克多·弗兰克尔' },
  { text: '时间是最公平的，每人每天都是二十四小时。差别在于选择。', author: '佚名' },
  { text: '在你最专注的那一刻，你与所做之事合而为一。', author: '禅宗' },
  { text: '先有意图，再谈效率。没有方向的速度只是瞎忙。', author: '佚名' },
  { text: '当下是你唯一真正拥有的时间。', author: '一行禅师' },
  { text: '心流不是偶然发生，而是刻意创造的条件。', author: '米哈里·契克森米哈赖' },
  { text: '你的注意力在哪里，你的生命就在哪里。', author: '佚名' },
  { text: '意图清晰，行动才有力量。', author: '佚名' },
  { text: '时间会回答成长，成长会回答梦想。', author: '毛不易' },
];

const getDailyQuote = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  return QUOTES[dayOfYear % QUOTES.length];
};

const Sidebar = () => {
  const dailyQuote = getDailyQuote();
  const {
    leftWidth,
    activeTab,
    setActiveTab,
    domains,
    activeDomain,
    setActiveDomain,
    setIsManagingDomains,
    setShowReportModal,
    startResizingLeft,
    loadSeedData,
  } = useTaskContext();

  return (
    <aside
      style={{ width: `${leftWidth}px` }}
      className="border-r border-slate-100 flex flex-col h-full min-h-0 bg-slate-50/30 relative shrink-0 overflow-hidden"
    >
      <div className="p-8 flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="flex items-center gap-3 mb-12 shrink-0">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Icon name="sparkles" size={16} className="text-white" />
          </div>
          <span className="text-sm font-black tracking-widest uppercase italic">
            FluxFlow
          </span>
        </div>
        <nav className="flex-1 min-h-0 space-y-10 overflow-y-auto custom-scrollbar">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
              模式
            </p>
            <div className="space-y-1">
              {[
                { id: 'focus', icon: 'sun', label: '今日意图' },
                { id: 'matrix', icon: 'layout-grid', label: '秩序象限' },
                { id: 'flow', icon: 'clock', label: '时间之流' },
                { id: 'chain', icon: 'link', label: '意图链（Beta）' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-white shadow-sm border border-slate-100 text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon name={item.icon} size={16} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                领域
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsManagingDomains(true);
                }}
                className="text-slate-300 hover:text-slate-900 transition-colors"
              >
                <Icon name="settings-2" size={12} />
              </button>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveDomain('all')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                  activeDomain === 'all'
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon name="circle" size={14} />
                <span>全域</span>
              </button>
              {domains.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDomain(d.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                    activeDomain === d.id
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon name={d.icon} size={14} style={{ color: d.color }} />
                  <span className="truncate">{d.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
              自省
            </p>
            <div className="space-y-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReportModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
              >
                <Icon name="bar-chart-2" size={14} />
                <span>数据报告</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={loadSeedData}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
            >
              <Icon name="plus" size={14} />
              <span>加载 50 条测试数据</span>
            </button>
          </div>
        </nav>
        <div className="shrink-0 pt-4 mt-4 border-t border-slate-100">
          <blockquote className="text-xs text-slate-500 italic leading-relaxed">
            「{dailyQuote.text}」
          </blockquote>
          {dailyQuote.author && (
            <p className="text-[10px] text-slate-400 mt-1.5 text-right">
              — {dailyQuote.author}
            </p>
          )}
        </div>
      </div>
      <div
        onMouseDown={startResizingLeft}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-slate-200 transition-colors z-50"
      />
    </aside>
  );
};

export default Sidebar;

