import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastInput {
  title: string;
  body?: string;
  tone?: 'success' | 'error' | 'info';
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (t: ToastInput) => {
      const id = Date.now() + Math.random();
      setItems((l) => [...l.slice(-2), { ...t, id }]);
      setTimeout(() => dismiss(id), t.tone === 'error' ? 7000 : 4500);
    },
    [dismiss],
  );
  return (
    <ToastContext.Provider value={push}>
      {children}
      {createPortal(
        <div className="toasts" aria-live="polite">
          {items.map((t) => {
            const Icon = t.tone === 'error' ? AlertCircle : t.tone === 'info' ? Info : CheckCircle2;
            return (
              <div key={t.id} className={`toast toast--${t.tone ?? 'success'}`} role="status">
                <Icon size={17} className="toast__icon" />
                <div className="toast__text">
                  <div className="toast__title">{t.title}</div>
                  {t.body && <div className="toast__body">{t.body}</div>}
                </div>
                {t.action && (
                  <button
                    className="toast__action"
                    onClick={() => {
                      t.action!.onClick();
                      dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                )}
                <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
