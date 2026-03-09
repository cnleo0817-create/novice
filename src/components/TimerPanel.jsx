import React, { useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import { formatTime } from '../utils/format.js';
import Icon from './Icon.jsx';

const TimerPanel = () => {
  const {
    timeLeft,
    isActive,
    isImmersive,
    toggleActive,
    resetTimer,
    enterImmersive,
    exitImmersive,
    coreTask,
    sessionForTaskId,
    setSessionForTaskId,
    showSetCoreIntentHint,
    setShowSetCoreIntentHint,
  } = useTaskContext();

  const isBoundToCore = isActive && sessionForTaskId && coreTask?.id === sessionForTaskId;

  const handleStartFocus = () => {
    if (!coreTask) {
      setShowSetCoreIntentHint(true);
      return;
    }
    if (!isActive) setSessionForTaskId(coreTask.id);
    toggleActive();
  };

  const handleEnterImmersive = () => {
    if (!coreTask) {
      setShowSetCoreIntentHint(true);
      return;
    }
    enterImmersive();
    if (!isActive) {
      setSessionForTaskId(coreTask.id);
      toggleActive();
    }
  };

  useEffect(() => {
    if (coreTask && showSetCoreIntentHint) setShowSetCoreIntentHint(false);
  }, [coreTask]);

  return (
    <>
      {isImmersive && (
        <div
          className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center animate-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[12rem] font-black text-white mb-12 tabular-nums">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleStartFocus}
              className="px-10 py-4 rounded-full bg-white text-slate-900 font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
            >
              {isActive ? '暂停' : '继续'}
            </button>
            <button
              onClick={exitImmersive}
              className="px-10 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
            >
              退出沉浸
            </button>
          </div>
        </div>
      )}

      <div className="p-8 border-b border-slate-100 bg-white shrink-0 text-center">
        <div className="text-4xl font-black mb-6 tabular-nums tracking-tighter text-slate-900">
          {formatTime(timeLeft)}
        </div>
        {isBoundToCore && (
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3">
            正在为当前核心意图专注
          </p>
        )}
        {showSetCoreIntentHint && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-100 animate-in">
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              先设定当前核心意图，再开始专注，心流更清晰。
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleEnterImmersive}
            className="flex-1 h-12 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
          >
            <Icon name="maximize-2" size={14} /> 沉浸
          </button>
          <button
            onClick={handleStartFocus}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isActive
                ? 'bg-rose-50 text-rose-500'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {isActive ? (
              <Icon name="pause" size={16} />
            ) : (
              <Icon name="play" size={16} />
            )}
          </button>
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:text-slate-900 transition-all"
          >
            <Icon name="rotate-ccw" size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default TimerPanel;

