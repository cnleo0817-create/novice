import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import Icon from './Icon.jsx';

const getQuadrantDotClass = (task) => {
  if (task.isImportant && task.isUrgent) return 'bg-rose-500';
  if (task.isImportant && !task.isUrgent) return 'bg-amber-500';
  if (!task.isImportant && task.isUrgent) return 'bg-blue-500';
  return 'bg-slate-500';
};

const IntentChainView = () => {
  const {
    tasks,
    intentChains,
    setChainNext,
    addTaskAsNext,
    setEditingTask,
    toggleTask,
    editingTask,
    activeDomain,
  } = useTaskContext();

  const [addingForTaskId, setAddingForTaskId] = useState(null);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [linkingTaskId, setLinkingTaskId] = useState(null);

  const chainTaskIds = (chain) => new Set(chain.flatMap((t) => [t.id, t.chainNextId].filter(Boolean)));
  const candidatesForChain = (chain) => {
    const ids = chainTaskIds(chain);
    return tasks.filter(
      (t) => !ids.has(t.id) && (activeDomain === 'all' || t.domain === activeDomain)
    );
  };

  const handleAddNewNext = (prevTaskId) => {
    if (!newLinkTitle.trim()) return;
    addTaskAsNext(prevTaskId, newLinkTitle.trim());
    setNewLinkTitle('');
    setAddingForTaskId(null);
  };

  const handleLinkExisting = (prevTaskId, nextTaskId) => {
    setChainNext(prevTaskId, nextTaskId);
    setLinkingTaskId(null);
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <p className="text-[11px] text-slate-400 tracking-wide mb-6">
        从意图到行动：将目标拆成因果链，一环扣一环
      </p>

      {intentChains.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          暂无意图 · 在顶部输入添加意图，或从下方「添加下一环」开始建链
        </div>
      ) : (
        <div className="space-y-10">
          {intentChains.map((chain, chainIndex) => {
            const candidates = candidatesForChain(chain);
            const lastTask = chain[chain.length - 1];
            const isAdding = addingForTaskId === lastTask.id;
            const isLinking = linkingTaskId === lastTask.id;

            return (
              <div key={chainIndex} className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    链 {chainIndex + 1}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {chain.length} 环
                  </span>
                </div>

                <div className="relative pl-8 border-l-2 border-slate-100 border-dashed space-y-0">
                  {chain.map((task, i) => {
                    const hasNext = !!(task.chainNextId ?? null);
                    const isLast = i === chain.length - 1;
                    return (
                      <div key={task.id} className="relative">
                        {i > 0 && (
                          <div className="absolute left-0 top-0 -translate-x-[9px] w-px h-4 bg-slate-200" />
                        )}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask(task);
                          }}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer min-w-0 ${
                            editingTask?.id === task.id
                              ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/20'
                              : 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <div
                            className={`absolute left-0 top-5 -translate-x-[11px] w-2.5 h-2.5 rounded-full border-2 border-white shrink-0 ${getQuadrantDotClass(task)}`}
                          />
                          <button
                            onClick={(e) => toggleTask(task.id, e)}
                            className="shrink-0"
                          >
                            {task.completed ? (
                              <Icon name="check-circle-2" className="text-slate-400" size={18} />
                            ) : (
                              <Icon name="circle" className="text-slate-200" size={18} />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-sm font-medium block truncate ${
                                task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {task.date} {task.time}
                            </span>
                          </div>
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${getQuadrantDotClass(task)}`}
                            title={
                              task.isImportant && task.isUrgent
                                ? '重要且紧急'
                                : task.isImportant
                                ? '重要不紧急'
                                : task.isUrgent
                                ? '紧急不重要'
                                : '不重要不紧急'
                            }
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-2 ml-6 flex-wrap">
                          {hasNext && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setChainNext(task.id, null);
                              }}
                              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide"
                            >
                              断开下一环
                            </button>
                          )}
                          {isLast && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddingForTaskId(isAdding ? null : task.id);
                                  setLinkingTaskId(null);
                                  setNewLinkTitle('');
                                }}
                                className="text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wide flex items-center gap-1"
                              >
                                <Icon name="plus" size={10} />
                                新建下一环
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLinkingTaskId(isLinking ? null : task.id);
                                  setAddingForTaskId(null);
                                }}
                                className="text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wide flex items-center gap-1"
                              >
                                <Icon name="link" size={10} />
                                链接已有意图
                              </button>
                            </>
                          )}
                        </div>

                        {isLast && isAdding && (
                          <div
                            className="mt-3 ml-6 flex gap-2 items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={newLinkTitle}
                              onChange={(e) => setNewLinkTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddNewNext(task.id);
                                if (e.key === 'Escape') setAddingForTaskId(null);
                              }}
                              placeholder="新意图标题..."
                              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-400"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleAddNewNext(task.id)}
                              disabled={!newLinkTitle.trim()}
                              className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold disabled:opacity-40"
                            >
                              添加
                            </button>
                          </div>
                        )}

                        {isLast && isLinking && candidates.length > 0 && (
                          <div
                            className="mt-3 ml-6 space-y-1 max-h-40 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {candidates.slice(0, 8).map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => handleLinkExisting(task.id, t.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm text-slate-700 hover:bg-slate-100 border border-slate-100"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full shrink-0 ${getQuadrantDotClass(t)}`}
                                />
                                <span className="truncate">{t.title}</span>
                              </button>
                            ))}
                            {candidates.length > 8 && (
                              <p className="text-[10px] text-slate-400 px-2">
                                仅显示前 8 条，可先链接以上或新建下一环
                              </p>
                            )}
                          </div>
                        )}

                        {isLast && isLinking && candidates.length === 0 && (
                          <p
                            className="mt-2 ml-6 text-[11px] text-slate-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            暂无可链接的其它意图（或切换领域）
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IntentChainView;
