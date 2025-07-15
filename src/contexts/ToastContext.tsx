import React, { createContext, useContext, ReactNode } from 'react';
import toast, { Toaster, Toast } from 'react-hot-toast';

interface ToastContextType {
  showSuccess: (message: string, options?: any) => void;
  showError: (message: string, options?: any) => void;
  showInfo: (message: string, options?: any) => void;
  showWarning: (message: string, options?: any) => void;
  dismiss: (toastId?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const showSuccess = (message: string, options?: any) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  };

  const showError = (message: string, options?: any) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options,
    });
  };

  const showInfo = (message: string, options?: any) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      ...options,
    });
  };

  const showWarning = (message: string, options?: any) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
      ...options,
    });
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const contextValue: ToastContextType = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismiss,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName="toast-container"
        containerStyle={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          left: 'auto',
          zIndex: 9999, // Ensure toasts appear above modals
        }}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            padding: '16px',
            minWidth: '300px',
            zIndex: 9999, // Ensure individual toasts have high z-index
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#10b981',
              color: '#fff',
              zIndex: 9999,
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#ef4444',
              color: '#fff',
              zIndex: 9999,
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
}; 