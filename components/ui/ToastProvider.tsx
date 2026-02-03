'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer, ToastProps, ToastType } from './Toast';

interface ToastContextValue {
  toast: (options: Omit<ToastProps, 'id' | 'onDismiss'>) => string;
  success: (message: string, description?: string) => string;
  error: (message: string, description?: string) => string;
  warning: (message: string, description?: string) => string;
  info: (message: string, description?: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;
const generateId = () => `toast-${++toastId}`;

interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = 'bottom-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (options: Omit<ToastProps, 'id' | 'onDismiss'>): string => {
      const id = generateId();
      const newToast: ToastProps = {
        ...options,
        id,
        onDismiss: dismiss,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Keep only the most recent toasts if we exceed maxToasts
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });

      return id;
    },
    [dismiss, maxToasts]
  );

  const toast = useCallback(
    (options: Omit<ToastProps, 'id' | 'onDismiss'>) => addToast(options),
    [addToast]
  );

  const success = useCallback(
    (message: string, description?: string) =>
      addToast({ type: 'success', message, description }),
    [addToast]
  );

  const error = useCallback(
    (message: string, description?: string) =>
      addToast({ type: 'error', message, description }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, description?: string) =>
      addToast({ type: 'warning', message, description }),
    [addToast]
  );

  const info = useCallback(
    (message: string, description?: string) =>
      addToast({ type: 'info', message, description }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toast, success, error, warning, info, dismiss, dismissAll }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
