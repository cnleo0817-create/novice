import React from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import DomainModal from './components/DomainModal.jsx';
import CoreIntentCompleteModal from './components/CoreIntentCompleteModal.jsx';
import ReportModal from './components/ReportModal.jsx';
import MatrixView from './components/MatrixView.jsx';
import TaskListView from './components/TaskListView.jsx';
import CalendarView from './components/CalendarView.jsx';
import IntentChainView from './components/IntentChainView.jsx';
import TimerPanel from './components/TimerPanel.jsx';
import TaskEditPanel from './components/TaskEditPanel.jsx';

const AppLayout = () => {
  const { activeTab, flowViewMode, clearEditingTask, leftWidth, rightWidth, startResizingRight, coreTask } = useTaskContext();

  const focusLock = !!coreTask;

  return (
    <div
      className="flex h-full min-h-0 w-full min-w-0 max-w-full bg-white text-slate-800 select-none overflow-hidden"
      onClick={clearEditingTask}
    >
      <DomainModal />
      <CoreIntentCompleteModal />
      <ReportModal />
      <div
        style={{ width: `${leftWidth}px` }}
        className={`h-full min-h-0 shrink-0 flex flex-col overflow-hidden ${focusLock ? 'pointer-events-none select-none blur-md opacity-60 transition-all' : ''}`}
      >
        <Sidebar />
      </div>

      <section className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
        <Header />
        <main
          className={`flex-1 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto custom-scrollbar px-12 py-6 ${focusLock ? 'pointer-events-none select-none blur-md opacity-60 transition-all' : ''}`}
        >
          {activeTab === 'flow' ? (flowViewMode === 'calendar' ? <CalendarView /> : <TaskListView />) : activeTab === 'matrix' ? <MatrixView /> : activeTab === 'chain' ? <IntentChainView /> : <TaskListView />}
        </main>
      </section>

      <aside
        style={{ width: `${rightWidth}px` }}
        className="border-l border-slate-100 flex flex-col min-h-0 bg-slate-50/30 relative shrink-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          onMouseDown={startResizingRight}
          className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-slate-200 transition-colors z-50"
        />
        <TimerPanel />
        <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${focusLock ? 'pointer-events-none select-none blur-md opacity-60 transition-all' : ''}`}>
          <TaskEditPanel />
        </div>
      </aside>
    </div>
  );
};

const App = () => {
  return (
    <TaskProvider>
      <AppLayout />
    </TaskProvider>
  );
};

export default App;

