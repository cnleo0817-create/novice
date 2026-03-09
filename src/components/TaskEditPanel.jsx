import React from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import Icon from './Icon.jsx';

const TaskEditPanel = () => {
  const { editingTask, updateTask, domains, deleteTask } = useTaskContext();

  if (!editingTask) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-8 custom-scrollbar">
      <div className="min-h-full flex flex-col items-center justify-center text-slate-300 opacity-40">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
            <Icon name="edit-3" size={24} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest">
            选择任务以编辑详情
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-8 custom-scrollbar">
      <div className="space-y-8 animate-in">
        <textarea
          className="w-full text-xl font-black text-slate-900 bg-transparent border-none outline-none resize-none p-0 focus:ring-0"
          value={editingTask.title}
          onChange={(e) => updateTask(editingTask.id, { title: e.target.value })}
          rows={2}
        />
        {(editingTask.pomodoros ?? 0) > 0 && (
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            已投入 {editingTask.pomodoros} 段心流时间
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Icon name="calendar-days" size={11} /> 执行日期
            </label>
            <input
              type="date"
              className="w-full p-3 bg-white border border-slate-100 rounded-xl text-[13px] font-bold outline-none shadow-sm"
              value={editingTask.date}
              onChange={(e) =>
                updateTask(editingTask.id, { date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Icon name="watch" size={11} /> 执行时间
            </label>
            <input
              type="time"
              className="w-full p-3 bg-white border border-slate-100 rounded-xl text-[13px] font-bold outline-none shadow-sm"
              value={editingTask.time}
              onChange={(e) =>
                updateTask(editingTask.id, { time: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
            维度标记
          </label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateTask(editingTask.id, {
                  isImportant: !editingTask.isImportant,
                })
              }
              className={`flex-1 py-3 rounded-xl text-[13px] font-bold border transition-all ${
                editingTask.isImportant
                  ? 'bg-amber-50 border-amber-500 text-amber-600'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              重要
            </button>
            <button
              onClick={() =>
                updateTask(editingTask.id, {
                  isUrgent: !editingTask.isUrgent,
                })
              }
              className={`flex-1 py-3 rounded-xl text-[13px] font-bold border transition-all ${
                editingTask.isUrgent
                  ? 'bg-rose-50 border-rose-500 text-rose-600'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              紧急
            </button>
          </div>
          <button
            onClick={() =>
              updateTask(editingTask.id, { isCore: !editingTask.isCore })
            }
            className={`w-full py-4 rounded-xl text-[13px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
              editingTask.isCore
                ? 'bg-slate-900 border-slate-900 text-amber-400'
                : 'bg-white border-slate-100 text-slate-400'
            }`}
          >
            <Icon
              name="zap"
              size={14}
              className={editingTask.isCore ? 'fill-current' : ''}
            />{' '}
            设为核心意图
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
            领域分配
          </label>
          <div className="grid grid-cols-2 gap-2">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => updateTask(editingTask.id, { domain: d.id })}
                className={`px-4 py-3 rounded-xl text-[13px] font-bold border transition-all ${
                  editingTask.domain === d.id
                    ? 'bg-white border-slate-900 text-slate-900 ring-1 ring-slate-900'
                    : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {((editingTask.completionReflections || []).length > 0) && (
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
              完成反思
            </label>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
              {(editingTask.completionReflections || []).map((text, i) => (
                <p key={i} className="text-sm text-amber-900/90 leading-relaxed">
                  {text}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
            详情备注
          </label>
          <textarea
            className="w-full h-32 p-4 bg-white border border-slate-100 rounded-2xl text-[13px] text-slate-600 outline-none resize-none shadow-sm"
            value={editingTask.note || ''}
            onChange={(e) =>
              updateTask(editingTask.id, { note: e.target.value })
            }
            placeholder="这是一条备注，可用于补充说明。"
          />
        </div>

        <button
          onClick={() => deleteTask(editingTask.id)}
          className="w-full h-12 bg-rose-50 text-rose-500 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Icon name="trash-2" size={14} /> 彻底删除
        </button>
      </div>
    </div>
  );
};

export default TaskEditPanel;

