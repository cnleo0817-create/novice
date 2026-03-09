import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import Icon from './Icon.jsx';

const CoreIntentCompleteModal = () => {
  const { showCoreCompleteModal, closeCoreCompleteModal } = useTaskContext();
  const [reflection, setReflection] = useState('');

  if (!showCoreCompleteModal) return null;

  const handleConfirm = () => {
    closeCoreCompleteModal(reflection);
    setReflection('');
  };

  return (
    <div
      className="fixed inset-0 z-[105] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={() => handleConfirm()}
    >
      <div
        className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
            今日核心意图已完成
          </h2>
          <button
            onClick={handleConfirm}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-xs text-slate-500">
            设定下一个核心意图，继续专注。
          </p>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              一句话反思（可选）
            </label>
            <textarea
              className="w-full h-20 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 outline-none resize-none focus:border-slate-200 transition-colors"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="记录完成这一刻的收获或感受..."
            />
          </div>
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="target" size={14} />
            设定下一个
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoreIntentCompleteModal;
