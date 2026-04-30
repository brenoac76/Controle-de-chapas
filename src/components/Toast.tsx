import React, { useState, useEffect } from 'react';

type ToastType = 'success' | 'error';
interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let listeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

const notify = () => listeners.forEach((l) => l(toasts));

export const toast = {
  success: (message: string) => addToast(message, 'success'),
  error: (message: string) => addToast(message, 'error'),
};

function addToast(message: string, type: ToastType) {
  const id = ++toastId;
  toasts = [...toasts, { id, message, type }];
  notify();
  setTimeout(() => removeToast(id), 4000);
}

function removeToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export const ToastContainer = () => {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>(toasts);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {currentToasts.map((t) => (
        <div 
          key={t.id} 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold pointer-events-auto transition-all animate-in slide-in-from-right-8 fade-in 
            ${t.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-700 border-red-200'
            }`}
        >
          {t.type === 'success' ? (
            <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
          ) : (
            <div className="bg-red-100 text-red-600 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            </div>
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
};
