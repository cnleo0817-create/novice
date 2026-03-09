import React, { createContext, useContext, useRef, useCallback } from 'react';
import { useTasks } from '../hooks/useTasks.js';
import { useTimer } from '../hooks/useTimer.js';
import { useResize } from '../hooks/useResize.js';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const tasksState = useTasks();
  const tasksStateRef = useRef(tasksState);
  tasksStateRef.current = tasksState;

  const onSessionComplete = useCallback(() => {
    const s = tasksStateRef.current;
    if (!s.sessionForTaskId) return;
    const task = s.tasks.find((t) => t.id === s.sessionForTaskId);
    s.updateTask(s.sessionForTaskId, {
      pomodoros: (task?.pomodoros ?? 0) + 1,
    });
    if (s.coreTask?.id === s.sessionForTaskId) {
      s.setShowCoreCompleteModal(true);
      s.setCompletedCoreTaskId(s.sessionForTaskId);
    }
    s.setSessionForTaskId(null);
  }, []);

  const timerState = useTimer({ onSessionComplete });
  const resizeState = useResize();

  const value = {
    ...tasksState,
    ...timerState,
    ...resizeState,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return ctx;
};

