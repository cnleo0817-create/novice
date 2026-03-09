import React, { useState, useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import Icon from './Icon.jsx';

function getWeekDays(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const monOffset = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(mon.getDate() + monOffset);
  const out = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(mon);
    x.setDate(x.getDate() + i);
    out.push(x.toISOString().split('T')[0]);
  }
  return out;
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return { short: `${m}/${day}`, weekday: weekdays[d.getDay()] };
}

const CalendarView = () => {
  const { tasks, activeDomain, coreTask, setEditingTask, toggleTask, editingTask } = useTaskContext();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const dayData = useMemo(() => {
    const map = {};
    weekDays.forEach((dayStr) => {
      const dayTasks = tasks.filter(
        (t) => t.date === dayStr && (activeDomain === 'all' || t.domain === activeDomain)
      );
      const domainIds = [...new Set(dayTasks.map((t) => t.domain))];
      map[dayStr] = { tasks: dayTasks, count: dayTasks.length, domainIds };
    });
    return map;
  }, [tasks, activeDomain, weekDays]);

  const selectedDayTasks = useMemo(() => {
    const list = (dayData[selectedDate]?.tasks || []).filter(Boolean);
    return list.sort((a, b) => (`${a.date} ${a.time}` > `${b.date} ${b.time}` ? 1 : -1));
  }, [dayData, selectedDate]);

  const getQuadrantDotClass = (task) => {
    if (task.isImportant && task.isUrgent) return 'bg-rose-500';
    if (task.isImportant && !task.isUrgent) return 'bg-amber-500';
    if (!task.isImportant && task.isUrgent) return 'bg-blue-500';
    return 'bg-slate-500';
  };

  const goPrevWeek = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() - 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };
  const goNextWeek = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevWeek}
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Icon name="play" size={16} className="rotate-180" />
        </button>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          本周
        </span>
        <button
          type="button"
          onClick={goNextWeek}
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Icon name="play" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((dayStr) => {
          const data = dayData[dayStr] || { tasks: [], count: 0, domainIds: [] };
          const isSelected = selectedDate === dayStr;
          const isCoreDay = coreTask?.date === dayStr;
          const isToday = dayStr === todayStr;
          const label = formatDayLabel(dayStr);
          return (
            <button
              key={dayStr}
              type="button"
              onClick={() => setSelectedDate(dayStr)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                  : 'border-slate-100 hover:bg-slate-50'
              } ${isCoreDay ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
            >
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {label.weekday}
              </div>
              <div className={`text-sm font-bold mt-0.5 ${isToday ? 'text-slate-900' : 'text-slate-600'}`}>
                {label.short}
              </div>
              {data.count === 0 ? (
                <div className="text-[9px] font-bold text-slate-300 mt-2">留白</div>
              ) : (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {data.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`w-1.5 h-1.5 rounded-full shrink-0 border border-white shadow-sm ${getQuadrantDotClass(task)}`}
                      title={task.title}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            {selectedDate}
          </div>
          <div className="h-[1px] flex-1 bg-slate-50" />
        </div>
        {selectedDayTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            当日无安排 · 留白
          </div>
        ) : (
          selectedDayTasks.map((task) => (
            <div
              key={task.id}
              onClick={(e) => {
                e.stopPropagation();
                setEditingTask(task);
              }}
              className={`flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer ${
                editingTask?.id === task.id ? 'border-slate-900 bg-slate-50' : 'border-slate-50 hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-black text-slate-200 w-10">{task.time}</div>
              <button onClick={(e) => toggleTask(task.id, e)} className="shrink-0">
                {task.completed ? (
                  <Icon name="check-circle-2" className="text-slate-900" size={20} />
                ) : (
                  <Icon name="circle" className="text-slate-200" size={20} />
                )}
              </button>
              <div className="flex-1 flex flex-col gap-1">
                <span
                  className={`text-sm font-bold ${
                    task.completed ? 'text-slate-300 line-through font-normal' : 'text-slate-800'
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
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarView;
