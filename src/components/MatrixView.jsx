import React from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import Icon from './Icon.jsx';

const quadrants = [
  { label: '重要且紧急', important: true, urgent: true, textClass: 'text-rose-500', dotClass: 'bg-rose-500' },
  { label: '重要不紧急', important: true, urgent: false, textClass: 'text-amber-500', dotClass: 'bg-amber-500' },
  { label: '紧急不重要', important: false, urgent: true, textClass: 'text-blue-500', dotClass: 'bg-blue-500' },
  { label: '不重要不紧急', important: false, urgent: false, textClass: 'text-slate-500', dotClass: 'bg-slate-500' },
];

const MatrixView = () => {
  const { displayTasks, setEditingTask, toggleTask } = useTaskContext();

  return (
    <div className="matrix-grid max-w-5xl mx-auto">
      {quadrants.map((quadrant) => (
        <div
          key={quadrant.label}
          className="bg-slate-50/50 border border-slate-100 rounded-[32px] p-6 flex flex-col min-h-[300px]"
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] font-black uppercase tracking-widest ${quadrant.textClass}`}>
              {quadrant.label}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${quadrant.dotClass}`} />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {displayTasks
              .filter(
                (t) =>
                  t.isImportant === quadrant.important &&
                  t.isUrgent === quadrant.urgent &&
                  !t.completed
              )
              .map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTask(task);
                  }}
                  className="p-4 bg-white border border-slate-50 rounded-2xl shadow-sm hover:border-slate-900 transition-all cursor-pointer flex items-center gap-3"
                >
                  <button
                    onClick={(e) => toggleTask(task.id, e)}
                    className="shrink-0"
                  >
                    <Icon
                      name="circle"
                      className="text-slate-200 hover:text-slate-400"
                      size={16}
                    />
                  </button>
                  <div className="text-xs font-bold text-slate-700 truncate flex-1">
                    {task.title}
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${quadrant.dotClass}`} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatrixView;

