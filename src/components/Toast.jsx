import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isDanger = toast.type === 'danger';

        return (
          <div 
            key={toast.id} 
            className={`toast ${isSuccess ? 'toast-success' : isDanger ? 'toast-danger' : 'toast-info'}`}
          >
            {isSuccess && <CheckCircle2 size={18} color="var(--teal-400)" />}
            {isDanger && <AlertCircle size={18} color="var(--red-500)" />}
            {!isSuccess && !isDanger && <Info size={18} color="var(--sky-400)" />}
            
            <span style={{ flex: 1 }}>{toast.message}</span>

            <button 
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
