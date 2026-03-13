import { useState, useEffect, useMemo } from 'react';
import { seedTasks } from '../data/seedData.js';
import { db, ensureLogin } from '../cloudbase.js';

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
  // 云端匿名用户 ID（CloudBase 提供）
  const [cloudUid, setCloudUid] = useState(null);
  // 应用内“账号”：A / B，用于区分你和你老婆
  const [appUser, setAppUser] = useState(() => {
    const saved = localStorage.getItem('fluxflow_app_user');
    return saved === 'A' || saved === 'B' ? saved : '';
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [backendToken, setBackendToken] = useState(
    () => localStorage.getItem('fluxflow_backend_token') || ''
  );

  // 组合出真正用于区分数据的 userId（云端 uid + 应用内账号）
  const userId = cloudUid && appUser ? `${cloudUid}-${appUser}` : null;

  useEffect(() => {
    localStorage.setItem('fluxflow_v6_domains', JSON.stringify(domains));
    localStorage.setItem('fluxflow_v6_tasks', JSON.stringify(tasks));
  }, [domains, tasks]);

  // 1）确保 CloudBase 匿名登录，拿到 cloudUid
  useEffect(() => {
    let cancelled = false;

    const doLogin = async () => {
      try {
        setLoading(true);
        const loginState = await ensureLogin();
        if (cancelled) return;
        const uid = loginState?.user?.uid || loginState?.user?.openid || null;
        setCloudUid(uid);
      } catch (err) {
        console.error('CloudBase 登录失败', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    doLogin();

    return () => {
      cancelled = true;
    };
  }, []);

  // 2）当 userId（云 uid + 应用账号）确定后，从 CloudBase 加载对应用户的数据
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const loadFromCloud = async () => {
      try {
        setLoading(true);
        const taskRes = await db.collection('tasks').where({ userId }).get();
        const domainRes = await db.collection('domains').where({ userId }).get();

        if (cancelled) return;

        if (taskRes?.data?.length) {
          setTasks(taskRes.data);
        }
        if (domainRes?.data?.length) {
          setDomains(domainRes.data);
        }
      } catch (err) {
        console.error('加载 CloudBase 数据失败', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFromCloud();

    return () => {
      cancelled = true;
    };
  }, [userId]);

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

      if (userId) {
        db.collection('tasks')
          .add({ ...newTask, userId })
          .catch((err) => {
            console.error('保存任务到 CloudBase 失败', err);
          });
      }
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

    if (userId) {
      const payload = { ...updates };
      db.collection('tasks')
        .where({ userId, id })
        .update(payload)
        .catch((err) => {
          console.error('更新 CloudBase 任务失败', err);
        });
    }
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

      if (userId && toggled) {
        db.collection('tasks')
          .where({ userId, id })
          .update({ completed: toggled.completed })
          .catch((err) => {
            console.error('切换 CloudBase 任务完成状态失败', err);
          });
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

    if (userId) {
      db.collection('tasks')
        .where({ userId, id })
        .remove()
        .catch((err) => {
          console.error('删除 CloudBase 任务失败', err);
        });
    }
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

    if (userId) {
      db.collection('tasks')
        .add({ ...newTask, userId })
        .catch((err) => {
          console.error('保存下一环任务到 CloudBase 失败', err);
        });
    }
  };

  const updateDomain = (id, updates) => {
    setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));

    if (userId) {
      db.collection('domains')
        .where({ userId, id })
        .update({ ...updates })
        .catch((err) => {
          console.error('更新 CloudBase 领域失败', err);
        });
    }
  };

  const addDomain = () => {
    const newDomain = { id: Date.now().toString(), name: '新领域', icon: 'tag', color: '#64748B' };
    setDomains((prev) => [
      ...prev,
      newDomain,
    ]);

    if (userId) {
      db.collection('domains')
        .add({ ...newDomain, userId })
        .catch((err) => {
          console.error('新增 CloudBase 领域失败', err);
        });
    }
  };

  const deleteDomain = (id) => {
    setDomains((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((d) => d.id !== id);
    });

    if (userId) {
      db.collection('domains')
        .where({ userId, id })
        .remove()
        .catch((err) => {
          console.error('删除 CloudBase 领域失败', err);
        });
    }
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

  // 应用内登录：只允许 A / B，密码固定 123
  const loginAppUser = async (name, password) => {
    const trimmed = (name || '').trim().toUpperCase();
    try {
      setAuthError('');
      const resp = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: trimmed, password }),
      });

      if (!resp.ok) {
        setAuthError('用户名或密码错误');
        return false;
      }

      const data = await resp.json();
      const userKey = data.userKey;
      const token = data.token;

      if (userKey !== 'A' && userKey !== 'B') {
        setAuthError('服务器返回的用户无效');
        return false;
      }

      setAppUser(userKey);
      setBackendToken(token);
      localStorage.setItem('fluxflow_app_user', userKey);
      localStorage.setItem('fluxflow_backend_token', token);
      setAuthError('');
      return true;
    } catch (err) {
      console.error('调用后端登录失败', err);
      setAuthError('无法连接后端服务，请稍后重试');
      return false;
    }
  };

  const logoutAppUser = () => {
    setAppUser('');
    setBackendToken('');
    localStorage.removeItem('fluxflow_app_user');
    localStorage.removeItem('fluxflow_backend_token');
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
    loading,
    // 用户管理相关
    appUser,
    loginAppUser,
    logoutAppUser,
    authError,
    backendToken,
  };
};

