import React from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';
import Icon from './Icon.jsx';

const DomainModal = () => {
  const {
    isManagingDomains,
    setIsManagingDomains,
    domains,
    iconOptions,
    colorOptions,
    updateDomain,
    addDomain,
    deleteDomain,
  } = useTaskContext();

  if (!isManagingDomains) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={() => setIsManagingDomains(false)}
    >
      <div
        className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
            领域定义面板
          </h2>
          <button
            onClick={() => setIsManagingDomains(false)}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="p-5 rounded-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${domain.color}10`,
                    color: domain.color,
                  }}
                >
                  <Icon name={domain.icon} size={20} />
                </div>
                <input
                  className="flex-1 text-sm font-bold bg-transparent border-none outline-none focus:ring-0 p-0 text-slate-900"
                  value={domain.name}
                  onChange={(e) =>
                    updateDomain(domain.id, { name: e.target.value })
                  }
                />
                <button
                  onClick={() => deleteDomain(domain.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Icon name="trash-2" size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => updateDomain(domain.id, { icon: iconName })}
                    className={`p-2 rounded-lg transition-all ${
                      domain.icon === iconName
                        ? 'bg-slate-900 text-white'
                        : 'hover:bg-slate-50 text-slate-400'
                    }`}
                  >
                    <Icon name={iconName} size={14} />
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateDomain(domain.id, { color })}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-125 ${
                      domain.color === color
                        ? 'ring-2 ring-slate-900 ring-offset-2'
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-8 bg-slate-50">
          <button
            onClick={addDomain}
            className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-slate-900 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="plus" size={16} /> 新增领域
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainModal;

