import React, { useState } from 'react';
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

const AuthGate = () => {
  const { appUser, loginAppUser, authError, loading } = useTaskContext();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await loginAppUser(name, password);
  };

  if (loading) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
        <p className="text-xs text-slate-400 tracking-wide">正在连接云端…</p>
      </div>
    );
  }

  if (appUser === 'A' || appUser === 'B') {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs bg-slate-900 text-white rounded-3xl px-6 py-5 shadow-xl shadow-slate-300/70"
      >
        <h2 className="text-sm font-bold tracking-tight mb-3">选择使用者</h2>
        <p className="text-[11px] text-slate-300 mb-4">
          为了区分你和另一位使用者，本应用内置了两个账号：
        </p>
        <div className="mb-3">
          <label className="block text-[11px] font-semibold mb-1">用户名（A 或 B）</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-8 rounded-xl px-3 text-xs bg-slate-800 border border-slate-700 focus:outline-none focus:border-slate-400"
            placeholder="输入 A 或 B"
          />
        </div>
        <div className="mb-3">
          <label className="block text-[11px] font-semibold mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-8 rounded-xl px-3 text-xs bg-slate-800 border border-slate-700 focus:outline-none focus:border-slate-400"
            placeholder="默认密码 123"
          />
        </div>
        {authError && (
          <p className="text-[11px] text-rose-400 mb-2">{authError}</p>
        )}
        <button
          type="submit"
          className="w-full h-8 mt-1 rounded-xl bg-white text-slate-900 text-xs font-bold tracking-wide hover:bg-slate-100 transition-colors"
        >
          进入 FluxFlow
        </button>
      </form>
    </div>
  );
};

const AppLayout = () => {
  const { activeTab, flowViewMode, clearEditingTask, leftWidth, rightWidth, startResizingRight, coreTask } = useTaskContext();

  const focusLock = !!coreTask;

  return (
    <div
      className="flex h-full min-h-0 w-full min-w-0 max-w-full bg-white text-slate-800 select-none overflow-hidden relative"
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

      {/* 登录遮罩：未选择 A/B 时覆盖整个应用 */}
      <AuthGate />
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

