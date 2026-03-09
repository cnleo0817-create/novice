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
    <header className="px-12 pt-12 pb-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className={`mb-6 ${coreTask ? 'pointer-events-none select-none blur-sm opacity-70' : ''}`}>
          {activeTab === 'focus' ? (
            <div className="flex items-baseline justify-between gap-4">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 capitalize">
                {title}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                {dateLabel}
              </p>
            </div>
          ) : activeTab === 'flow' ? (
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 capitalize">
                {title}
              </h1>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlowViewMode((m) => (m === 'flow' ? 'calendar' : 'flow'));
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title={flowViewMode === 'flow' ? '切换到日历视图' : '切换到时间之流'}
              >
                <Icon
                  name="hourglass"
                  size={20}
                  className="transition-transform duration-300 ease-out"
                  style={{ transform: flowViewMode === 'calendar' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
            </div>
          ) : (
            <h1 className="text-3xl font-black tracking-tight text-slate-900 capitalize">
              {title}
            </h1>
          )}
        </div>

        <div className="mb-6">
          {coreTask ? (
            <div className="w-full flex items-center gap-6 bg-slate-900 text-white px-8 py-7 rounded-[32px] shadow-xl shadow-slate-200 text-left">
              <Icon name="zap" size={26} className="text-amber-400 shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-black uppercase tracking-widest opacity-60 mb-1.5">
                  当前核心意图
                </span>
                <span className="text-xl font-bold truncate mb-4">
                  {coreTask.title}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePlay}
                    className="h-9 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    title="开始心流时间"
                  >
                    <Icon name="play" size={14} />
                    开始心流
                  </button>
                  <button
                    type="button"
                    onClick={handlePause}
                    disabled={!isActive}
                    className="h-9 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    title="暂停"
                  >
                    <Icon name="pause" size={14} />
                    暂停
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="h-9 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 transition-colors"
                    title="完成本次心流并勾选该意图"
                  >
                    <Icon name="check-circle-2" size={14} />
                    完成
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCore}
                    className="h-9 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 transition-colors"
                    title="取消当前任务的核心意图"
                  >
                    <Icon name="x" size={14} />
                    取消核心意图
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center gap-6 bg-slate-50 border border-slate-200 px-8 py-7 rounded-[32px] text-slate-400">
              <Icon name="zap" size={26} className="shrink-0 opacity-50" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">
                  当前核心意图
                </span>
                <span className="text-base font-medium">
                  暂无 · 选择任务后可设为核心意图
                </span>
              </div>
            </div>
          )}
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
            size={20}
          />
          <input
            type="text"
            placeholder="输入并捕捉意图..."
            className="w-full h-14 pl-12 pr-6 bg-slate-50 border-transparent focus:bg-white border focus:border-slate-200 rounded-2xl text-sm font-medium outline-none transition-all"
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

