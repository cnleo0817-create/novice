import React from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import Icon from './Icon.jsx';

const Header = () => {
  const {
    activeTab,
    flowViewMode,
    setFlowViewMode,
    coreTask,
    inputValue,
    setInputValue,
    addTask,
    updateTask,
    toggleTask,
    toggleActive,
    resetTimer,
    setSessionForTaskId,
    isActive,
    sessionForTaskId,
  } = useTaskContext();

  const handlePlay = (e) => {
    e.stopPropagation();
    if (!coreTask) return;
    if (!isActive) setSessionForTaskId(coreTask.id);
    toggleActive();
  };

  const handlePause = (e) => {
    e.stopPropagation();
    if (isActive) toggleActive();
  };

  /** 完成：结束计时并把当前核心意图标为已完成，会弹出完成反思 */
  const handleComplete = (e) => {
    e.stopPropagation();
    if (coreTask) toggleTask(coreTask.id, e);
    setSessionForTaskId(null);
    resetTimer();
  };

  const handleCancelCore = (e) => {
    e.stopPropagation();
    if (!coreTask) return;
    updateTask(coreTask.id, { isCore: false });
    if (sessionForTaskId === coreTask.id) {
      setSessionForTaskId(null);
      resetTimer();
    }
  };

  const title =
    activeTab === 'focus'
      ? '今日意图'
      : activeTab === 'matrix'
      ? '秩序象限'
      : activeTab === 'chain'
      ? '意图链（Beta）'
      : '时间之流';

  const dateLabel = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <header className="px-8 pt-6 pb-3">
      <div className="max-w-5xl mx-auto w-full">
        {/* 顶部一行：左侧栏目名 + 日期 / 视图切换；右侧精简版核心意图卡片 */}
        <div className="mb-3 flex items-stretch justify-between gap-4">
          <div className={`flex flex-col justify-center ${coreTask ? 'pointer-events-none select-none blur-sm opacity-70' : ''}`}>
            {activeTab === 'focus' ? (
              <div className="flex items-baseline justify-between gap-3">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 capitalize">
                  {title}
                </h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                  {dateLabel}
                </p>
              </div>
            ) : activeTab === 'flow' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 capitalize">
                  {title}
                </h1>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFlowViewMode((m) => (m === 'flow' ? 'calendar' : 'flow'));
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title={flowViewMode === 'flow' ? '切换到日历视图' : '切换到时间之流'}
                >
                  <Icon
                    name="hourglass"
                    size={18}
                    className="transition-transform duration-300 ease-out"
                    style={{ transform: flowViewMode === 'calendar' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
              </div>
            ) : (
              <h1 className="text-2xl font-black tracking-tight text-slate-900 capitalize">
                {title}
              </h1>
            )}
          </div>

          <div className="flex-1 flex justify-end min-w-[240px]">
            {coreTask ? (
              <div className="inline-flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-md shadow-slate-200/80 max-w-md w-full">
                <Icon name="zap" size={18} className="text-amber-400 shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">
                    当前核心意图
                  </span>
                  <span className="text-sm font-semibold truncate">
                    {coreTask.title}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handlePlay}
                      className="h-7 px-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      title="开始心流时间"
                    >
                      <Icon name="play" size={12} />
                      开始
                    </button>
                    <button
                      type="button"
                      onClick={handlePause}
                      disabled={!isActive}
                      className="h-7 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      title="暂停"
                    >
                      <Icon name="pause" size={12} />
                      暂停
                    </button>
                    <button
                      type="button"
                      onClick={handleComplete}
                      className="h-7 px-2.5 rounded-lg bg-emerald-400/90 hover:bg-emerald-400 text-slate-900 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors"
                      title="完成本次心流并勾选该意图"
                    >
                      <Icon name="check-circle-2" size={12} />
                      完成
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCore}
                      className="h-7 px-2.5 rounded-lg bg-white/0 hover:bg-white/15 text-white text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors"
                      title="取消当前任务的核心意图"
                    >
                      <Icon name="x" size={12} />
                      取消
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-slate-400 max-w-md w-full">
                <Icon name="zap" size={18} className="shrink-0 opacity-60" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">
                    当前核心意图
                  </span>
                  <span className="text-xs font-medium truncate">
                    暂无 · 选择任务后可设为核心意图
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`relative group ${coreTask ? 'pointer-events-none select-none blur-sm opacity-70' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Icon
            name="plus"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
            size={18}
          />
          <input
            type="text"
            placeholder="输入并捕捉意图..."
            className="w-full h-12 pl-11 pr-5 bg-slate-50 border-transparent focus:bg-white border focus:border-slate-200 rounded-2xl text-sm font-medium outline-none transition-all"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={addTask}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

