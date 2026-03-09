import React, { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import Icon from './Icon.jsx';

const ReportModal = () => {
  const { showReportModal, setShowReportModal, tasks, domains } = useTaskContext();

  const report = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const totalPomodoros = tasks.reduce((sum, t) => sum + (t.pomodoros ?? 0), 0);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.date === todayStr);
    const todayCompleted = todayTasks.filter((t) => t.completed).length;
    const byDomain = {};
    domains.forEach((d) => {
      byDomain[d.id] = {
        name: d.name,
        color: d.color,
        tasks: tasks.filter((t) => t.domain === d.id).length,
        completed: tasks.filter((t) => t.domain === d.id && t.completed).length,
        pomodoros: tasks
          .filter((t) => t.domain === d.id)
          .reduce((s, t) => s + (t.pomodoros ?? 0), 0),
      };
    });
    const completionReflections = [];
    tasks
      .filter((t) => t.completed && (t.completionReflections || []).length > 0)
      .forEach((t) => {
        (t.completionReflections || []).forEach((text) => {
          completionReflections.push({ title: t.title, text });
        });
      });
    completionReflections.reverse();
    const recentReflections = completionReflections.slice(0, 10);
    return {
      total,
      completed,
      incomplete: total - completed,
      totalPomodoros,
      todayTasks: todayTasks.length,
      todayCompleted,
      byDomain,
      recentReflections,
    };
  }, [tasks, domains]);

  if (!showReportModal) return null;

  return (
    <div
      className="fixed inset-0 z-[108] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={() => setShowReportModal(false)}
    >
      <div
        className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
            自省 · 数据报告
          </h2>
          <button
            onClick={() => setShowReportModal(false)}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-8">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              任务概览
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  {report.total}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  总任务
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-black text-emerald-600 tabular-nums">
                  {report.completed}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  已完成
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-black text-slate-600 tabular-nums">
                  {report.incomplete}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  未完成
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              心流时间
            </h3>
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
              <div className="flex items-center gap-3">
                <Icon name="zap" size={20} className="text-amber-500 shrink-0" />
                <div>
                  <div className="text-2xl font-black text-slate-900 tabular-nums">
                    {report.totalPomodoros}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    总心流时间 · 约 {Math.floor((report.totalPomodoros * 25) / 60)} 小时
                  </div>
                </div>
              </div>
            </div>
            {domains.length > 0 && (
              <div className="mt-4 space-y-2">
                {domains.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between py-2.5 px-4 rounded-xl border border-slate-100 bg-white"
                  >
                    <span
                      className="text-sm font-bold text-slate-700 flex items-center gap-2"
                      style={{ color: d.color }}
                    >
                      <Icon name={d.icon} size={14} />
                      {d.name}
                    </span>
                    <span className="text-sm font-black text-slate-900 tabular-nums">
                      {report.byDomain[d.id]?.pomodoros ?? 0} 段心流
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              今日
            </h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-xl font-black text-slate-900 tabular-nums">
                {report.todayCompleted} / {report.todayTasks}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                今日任务已完成
              </div>
            </div>
          </section>

          {report.recentReflections.length > 0 && (
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                完成反思
              </h3>
              <div className="space-y-3">
                {report.recentReflections.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100"
                  >
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
