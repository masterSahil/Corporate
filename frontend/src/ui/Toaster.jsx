import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// --- 1. Event System (No Context Needed) ---
const listeners = new Set();

const emitToast = (type, message, duration = 3000) => {
  const id = Math.random().toString(36).substring(2, 9);
  listeners.forEach((listener) => listener({ id, type, message, duration }));
};

// Export this object to use anywhere in your app!
export const toast = {
  success: (message, duration) => emitToast('success', message, duration),
  error: (message, duration) => emitToast('error', message, duration),
  info: (message, duration) => emitToast('info', message, duration),
  warning: (message, duration) => emitToast('warning', message, duration),
};


// --- 2. The Toaster Container (Mount this once in App.jsx) ---
export const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Subscribe to toast events
    const handleNewToast = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
    };

    listeners.add(handleNewToast);
    return () => listeners.delete(handleNewToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 sm:bottom-6 sm:right-6 z-100 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
};


// --- 3. Individual Toast UI Component ---
const ToastItem = ({ id, type, message, duration, onRemove }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  // Handle auto-dismiss and exit animation
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        closeToast();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const closeToast = () => {
    setIsExiting(true);
    // Wait for the exit animation to finish before removing from DOM
    setTimeout(onRemove, 300);
  };

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={22} />,
    error: <XCircle className="text-rose-500" size={22} />,
    info: <Info className="text-blue-500" size={22} />,
    warning: <AlertTriangle className="text-amber-500" size={22} />,
  };

  return (
    <div
      className={`
        pointer-events-auto bg-white rounded-xl shadow-xl px-5 py-4 
        flex items-start gap-3 w-[calc(100vw-2rem)] sm:w-87.5
        border border-slate-100 transform transition-all duration-300 ease-out
        ${
          isMounted && !isExiting
            ? 'translate-y-0 opacity-100 sm:translate-x-0'
            : 'translate-y-4 opacity-0 sm:translate-y-0 sm:translate-x-8'
        }
      `}
    >
      <div className="shrink-0 mt-0.5">
        {icons[type] || icons.info}
      </div>

      <div className="flex-1 text-sm font-semibold text-slate-800 pt-0.5 leading-snug">
        {message}
      </div>

      <button
        onClick={closeToast}
        className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-0.5 p-0.5 rounded-md hover:bg-slate-100"
      >
        <X size={18} />
      </button>
    </div>
  );
};