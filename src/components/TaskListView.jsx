import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import Icon from './Icon.jsx';

const todayStr = () => new Date().toISOString().split('T')[0];
const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatDateLabel = (dateStr) => {
  const today = todayStr();
  if (dateStr === today) return '今天';
  const d = new Date(dateStr);
  const t = new Date(today);
  const diff = Math.round((d - t) / (24 * 60 * 60 * 1000));
  if (diff === -1) return '昨天';
  if (diff === 1) return '明天';
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
  return `周${week} ${d.getMonth() + 1}月${d.getDate()}日`;
};

const getQuadrantDotClass = (task) => {
  if (task.isImportant && task.isUrgent) return 'bg-rose-500';
  if (task.isImportant && !task.isUrgent) return 'bg-amber-500';
  if (!task.isImportant && task.isUrgent) return 'bg-blue-500';
  return 'bg-slate-500';
};

const TaskListView = () => {
  const {
    activeTab,
    flowGroups,
    displayTasks,
    editingTask,
    setEditingTask,
    toggleTask,
  } = useTaskContext();

  const [flowScope, setFlowScope] = useState('today');
  const nowBlockRef = useRef(null);

  const flowGroupsForScope = useMemo(() => {
    if (flowScope === 'today') {
      const today = todayStr();
      return flowGroups.filter(([date]) => date === today);
    }
    return flowGroups;
  }, [flowGroups, flowScope]);

  const todayFlowTasks = useMemo(() => {
    const today = todayStr();
    const found = flowGroups.find(([date]) => date === today);
    return found ? found[1] : [];
  }, [flowGroups]);

  const currentIntention = useMemo(() => {
    const now = nowTime();
    const incomplete = todayFlowTasks.filter((t) => !t.completed);
    const atOrAfter = incomplete.find((t) => t.time >= now);
    return atOrAfter ?? incomplete[0] ?? null;
  }, [todayFlowTasks]);

  useEffect(() => {
    if (activeTab === 'flow' && nowBlockRef.current) {
      nowBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeTab, flowScope]);

  if (activeTab === 'flow') {
    return (
      <div className="max-w-3xl mx-auto pb-24 bg-gradient-to-b from-slate-50/50 to-white rounded-3xl px-6 py-8">
        {/* 理念句 + 此刻时间（非置顶，与 Header 当前核心意图 唯一置顶） */}
        <div className="mb-6">
          <p className="text-[11px] text-slate-400 tracking-wide">
            专注此刻，意图在时间中展开
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            此刻 <span className="tabular-nums text-slate-600 font-black">{nowTime()}</span>
          </p>
        </div>

        {/* 今日 / 本周 */}
        <div className="flex gap-1 mb-6">
          {(['today', 'week']).map((scope) => (
            <button
              key={scope}
              onClick={() => setFlowScope(scope)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all ${
                flowScope === scope
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {scope === 'today' ? '今日' : '本周'}
            </button>
          ))}
        </div>

        {/* 时间轴 */}
        <div className="space-y-10">
          {flowGroupsForScope.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-400 text-sm">
                暂无安排 · 这段属于你，可休息或添加意图
              </p>
            </div>
          ) : (
            flowGroupsForScope.map(([date, groupTasks]) => {
              const isToday = date === todayStr();
              const now = nowTime();
              const sorted = [...groupTasks].sort((a, b) => (a.time > b.time ? 1 : -1));
              return (
                <div key={date} className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {formatDateLabel(date)}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                  </div>

                  <div className="relative pl-8">
                    {/* 时间轴：一根竖线贯穿，无节点圆点 */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-px bg-slate-200/90"
                      aria-hidden
                    />
                    {sorted.map((task) => {
                      const isPast = date < todayStr();
                      const isNow =
                        isToday &&
                        !task.completed &&
                        currentIntention?.id === task.id;

                      return (
                        <div
                          key={task.id}
                          ref={isNow ? nowBlockRef : null}
                          className="relative flex gap-4 pb-6 last:pb-0"
                        >
                          {/* 此刻：仅保留文字标签，不再在轴线上加粗，避免任务间的深色竖条 */}
                          {isNow && (
                            <div className="absolute left-8 top-0 flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                                此刻
                              </span>
                            </div>
                          )}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                            className={`flex-1 flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer min-w-0 relative overflow-hidden ${
                              isNow
                                ? 'border-slate-200 bg-slate-50 shadow-sm ring-1 ring-slate-900/5'
                                : isPast
                                  ? 'border-slate-200/50 bg-slate-100/60 backdrop-blur-xl'
                                  : 'border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95),inset_0_12px_24px_-8px_rgba(255,255,255,0.5)] hover:bg-white hover:shadow-md hover:shadow-slate-200/40 hover:border-slate-200 hover:from-white hover:to-white'
                            } ${editingTask?.id === task.id ? 'ring-2 ring-slate-900/20' : ''}`}
                          >
                            {/* 过去：毛玻璃上的冷灰蒙层，不反光 */}
                            {isPast && (
                              <div
                                className="absolute inset-0 pointer-events-none rounded-2xl bg-slate-400/10"
                                aria-hidden
                              />
                            )}
                            {/* 未来：从希望中走来的微光（顶部一抹暖光） */}
                            {!isPast && !isNow && (
                              <div
                                className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-b from-amber-50/50 via-amber-50/10 to-transparent"
                                aria-hidden
                              />
                            )}
                            <div
                              className={`text-[10px] font-semibold tabular-nums shrink-0 w-10 relative z-10 ${
                                isPast ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {task.time}
                            </div>
                            <button
                              onClick={(e) => toggleTask(task.id, e)}
                              className="shrink-0 relative z-10"
                            >
                              {task.completed ? (
                                <Icon name="check-circle-2" className="text-slate-400" size={18} />
                              ) : (
                                <Icon name="circle" className="text-slate-200" size={18} />
                              )}
                            </button>
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5 relative z-10">
                              <span
                                className={`text-sm truncate ${
                                  task.completed
                                    ? 'text-slate-400 line-through font-normal'
                                    : 'text-slate-800 font-medium'
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.isCore && (
                                <span className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1">
                                  <Icon name="zap" size={8} /> 核心意图
                                </span>
                              )}
                            </div>
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 relative z-10 ${getQuadrantDotClass(task)}`}
                              title={task.isImportant && task.isUrgent ? '重要且紧急' : task.isImportant ? '重要不紧急' : task.isUrgent ? '紧急不重要' : '不重要不紧急'}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // focus 列表
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {displayTasks.map((task) => (
        <div
          key={task.id}
          onClick={(e) => {
            e.stopPropagation();
            setEditingTask(task);
          }}
          className={`flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer ${
            editingTask?.id === task.id
              ? 'border-slate-900 bg-slate-50'
              : 'border-slate-50 hover:bg-slate-50'
          }`}
        >
          <button
            onClick={(e) => toggleTask(task.id, e)}
            className="shrink-0"
          >
            {task.completed ? (
              <Icon name="check-circle-2" className="text-slate-900" size={20} />
            ) : (
              <Icon name="circle" className="text-slate-200" size={20} />
            )}
          </button>
          <div className="flex-1 flex flex-col gap-1">
            <span
              className={`text-sm font-bold ${
                task.completed
                  ? 'text-slate-300 line-through font-normal'
                  : 'text-slate-800'
              }`}
            >
              {task.title}
            </span>
            {task.isCore && (
              <span className="text-[9px] font-black text-amber-500 uppercase flex items-center gap-1">
                <Icon name="zap" size={8} /> CORE INTENT
              </span>
            )}
          </div>
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${getQuadrantDotClass(task)}`}
            title={task.isImportant && task.isUrgent ? '重要且紧急' : task.isImportant ? '重要不紧急' : task.isUrgent ? '紧急不重要' : '不重要不紧急'}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskListView;

