import { useState, useEffect, useMemo } from 'react';
import { seedTasks } from '../data/seedData.js';

export const defaultDomains = [
  { id: 'work', name: '职业', icon: 'briefcase', color: '#0F172A' },
  { id: 'growth', name: '内在', icon: 'book-open', color: '#6366F1' },
  { id: 'life', name: '留白', icon: 'coffee', color: '#10B981' },
];

export const iconOptions = ['briefcase', 'book-open', 'coffee', 'tag', 'target', 'zap', 'anchor', 'wind'];

export const colorOptions = ['#0F172A', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#64748B'];

export const useTasks = () => {
  const [domains, setDomains] = useState(() => {
    const saved = localStorage.getItem('fluxflow_v6_domains');
    return saved ? JSON.parse(saved) : defaultDomains;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('fluxflow_v6_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('flow');
  /** 时间之流下的视图：'flow' 原汁原味时间之流，'calendar' 时间版图 */
  const [flowViewMode, setFlowViewMode] = useState('flow');
  const [activeDomain, setActiveDomain] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [isManagingDomains, setIsManagingDomains] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sessionForTaskId, setSessionForTaskId] = useState(null);
  const [showCoreCompleteModal, setShowCoreCompleteModal] = useState(false);
  const [completedCoreTaskId, setCompletedCoreTaskId] = useState(null);
  const [showSetCoreIntentHint, setShowSetCoreIntentHint] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('fluxflow_v6_domains', JSON.stringify(domains));
    localStorage.setItem('fluxflow_v6_tasks', JSON.stringify(tasks));
  }, [domains, tasks]);

  useEffect(() => {
    if (activeTab !== 'flow') setFlowViewMode('flow');
  }, [activeTab]);

  const coreTask = useMemo(
    () => tasks.find((t) => t.isCore && !t.completed),
    [tasks]
  );

  const displayTasks = useMemo(() => {
    let filtered = tasks.filter((t) => activeDomain === 'all' || t.domain === activeDomain);

    if (activeTab === 'focus') {
      const todayStr = new Date().toISOString().split('T')[0];
      return filtered.filter(
        (t) => !t.completed && t.date === todayStr
      );
    }

    if (activeTab === 'matrix') {
      return filtered
        .filter((t) => !t.completed)
        .sort((a, b) => (`${a.date} ${a.time}` > `${b.date} ${b.time}` ? 1 : -1));
    }

    return [...filtered].sort((a, b) => (`${a.date} ${a.time}` > `${b.date} ${b.time}` ? 1 : -1));
  }, [tasks, activeTab, activeDomain]);

  const flowGroups = useMemo(() => {
    if (activeTab !== 'flow') return [];
    const groups = {};
    displayTasks.forEach((task) => {
      if (!groups[task.date]) groups[task.date] = [];
      groups[task.date].push(task);
    });
    return Object.entries(groups).sort((a, b) => (a[0] > b[0] ? 1 : -1));
  }, [displayTasks, activeTab]);

  /** 意图链：从「无人指向」的节点出发，沿 chainNextId 走到底，得到若干条链 */
  const intentChains = useMemo(() => {
    const idToTask = new Map();
    const pointedTo = new Set();
    tasks.forEach((t) => {
      idToTask.set(t.id, t);
      const nextId = t.chainNextId ?? null;
      if (nextId) pointedTo.add(nextId);
    });
    const heads = tasks.filter((t) => !pointedTo.has(t.id));
    const chains = [];
    const seen = new Set();
    heads.forEach((head) => {
      const chain = [];
      let cur = head;
      while (cur && !seen.has(cur.id)) {
        seen.add(cur.id);
        chain.push(cur);
        const nextId = cur.chainNextId ?? null;
        cur = nextId ? idToTask.get(nextId) ?? null : null;
      }
      chains.push(chain);
    });
    return chains;
  }, [tasks]);

  const addTask = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const now = new Date();
      const isFocusMode = activeTab === 'focus';

      const newTask = {
        id: Date.now(),
        title: inputValue.trim(),
        completed: false,
        domain: activeDomain === 'all' ? domains[0]?.id ?? 'work' : activeDomain,
        isImportant: isFocusMode ? true : false,
        isUrgent: isFocusMode ? true : false,
        isCore: false,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        note: '',
        pomodoros: 0,
        chainNextId: null,
      };

      setTasks((prev) => [newTask, ...prev]);
      setInputValue('');
      setEditingTask(newTask);
    }
  };

  const updateTask = (id, updates) => {
    if (updates.isCore === true) {
      const now = new Date();
      const execDate = now.toISOString().split('T')[0];
      const execTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      updates = { ...updates, date: execDate, time: execTime };
    }
    setTasks((prev) => {
      let newTasks = prev;
      if (updates.isCore === true) {
        newTasks = prev.map((t) => ({ ...t, isCore: false }));
      }
      return newTasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
    });
    if (editingTask?.id === id) {
      setEditingTask((prev) => (prev ? { ...prev, ...updates } : prev));
    }
  };

  const toggleTask = (id, e) => {
    e?.stopPropagation();
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      const toggled = next.find((t) => t.id === id);
      if (toggled?.isCore && toggled?.completed) {
        setTimeout(() => {
          setShowCoreCompleteModal(true);
          setCompletedCoreTaskId(id);
        }, 0);
      }
      return next;
    });
  };

  const deleteTask = (id) => {
    setTasks((prev) =>
      prev
        .filter((t) => t.id !== id)
        .map((t) => (t.chainNextId === id ? { ...t, chainNextId: null } : t))
    );
    if (editingTask?.id === id) {
      setEditingTask(null);
    }
  };

  /** 设置某任务的「下一环」；传 null 表示断开。避免成环。 */
  const setChainNext = (taskId, nextTaskId) => {
    if (nextTaskId === null || nextTaskId === undefined) {
      updateTask(taskId, { chainNextId: null });
      return;
    }
    setTasks((prev) => {
      const taskById = new Map(prev.map((t) => [t.id, t]));
      const getChainFrom = (id) => {
        const out = [];
        let cur = taskById.get(id);
        const visited = new Set();
        while (cur && !visited.has(cur.id)) {
          visited.add(cur.id);
          out.push(cur.id);
          cur = cur.chainNextId ? taskById.get(cur.chainNextId) : null;
        }
        return out;
      };
      const chainFromTask = getChainFrom(taskId);
      if (chainFromTask.includes(nextTaskId)) return prev;
      const next = prev.map((t) => {
        if (t.id === taskId) return { ...t, chainNextId: nextTaskId };
        if (t.chainNextId === nextTaskId && t.id !== taskId) return { ...t, chainNextId: null };
        return t;
      });
      return next;
    });
  };

  /** 新建一个任务并设为指定任务的下一环 */
  const addTaskAsNext = (prevTaskId, title) => {
    if (!title?.trim()) return;
    const now = new Date();
    const prev = tasks.find((t) => t.id === prevTaskId);
    const domain = prev ? prev.domain : activeDomain === 'all' ? domains[0]?.id ?? 'work' : activeDomain;
    const newTask = {
      id: Date.now(),
      title: title.trim(),
      completed: false,
      domain,
      isImportant: false,
      isUrgent: false,
      isCore: false,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      note: '',
      pomodoros: 0,
      chainNextId: null,
    };
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    setChainNext(prevTaskId, newTask.id);
    setEditingTask(newTask);
  };

  const updateDomain = (id, updates) => {
    setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const addDomain = () => {
    setDomains((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '新领域', icon: 'tag', color: '#64748B' },
    ]);
  };

  const deleteDomain = (id) => {
    setDomains((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((d) => d.id !== id);
    });
  };

  const clearEditingTask = () => {
    setEditingTask(null);
  };

  const loadSeedData = () => {
    setTasks([...seedTasks]);
    setEditingTask(null);
  };

  const closeCoreCompleteModal = (reflection) => {
    if (completedCoreTaskId && reflection?.trim()) {
      const task = tasks.find((t) => t.id === completedCoreTaskId);
      const prev = task?.completionReflections || [];
      updateTask(completedCoreTaskId, {
        completionReflections: [...prev, reflection.trim()],
      });
    }
    setShowCoreCompleteModal(false);
    setCompletedCoreTaskId(null);
  };

  return {
    domains,
    tasks,
    activeTab,
    activeDomain,
    editingTask,
    isManagingDomains,
    inputValue,
    coreTask,
    displayTasks,
    flowGroups,
    flowViewMode,
    setFlowViewMode,
    iconOptions,
    colorOptions,
    setActiveTab,
    setActiveDomain,
    setEditingTask,
    setIsManagingDomains,
    setInputValue,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    updateDomain,
    addDomain,
    deleteDomain,
    clearEditingTask,
    loadSeedData,
    sessionForTaskId,
    setSessionForTaskId,
    showCoreCompleteModal,
    setShowCoreCompleteModal,
    completedCoreTaskId,
    setCompletedCoreTaskId,
    closeCoreCompleteModal,
    showSetCoreIntentHint,
    setShowSetCoreIntentHint,
    showReportModal,
    setShowReportModal,
    intentChains,
    setChainNext,
    addTaskAsNext,
  };
};

