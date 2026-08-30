import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdminUser, ShopItem } from '../types/admin';
import { adminApi } from '../services/adminApi';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  selectedShopId: string;
  setSelectedShopId: (id: string) => void;
  shops: ShopItem[];
  refreshShops: () => Promise<void>;
  toasts: Toast[];
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const token = localStorage.getItem('datadaddy_admin_token');
    return token
      ? { id: 'admin_root', email: 'admin@datadaddy.com', name: 'Master Platform Admin', role: 'superadmin' }
      : null;
  });
  const [selectedShopId, setSelectedShopId] = useState<string>('all');
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshShops = async () => {
    try {
      const res = await adminApi.getShops();
      setShops(res.shops);
    } catch (e) {
      // fallback handled in service
    }
  };

  useEffect(() => {
    if (user) {
      refreshShops();
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    const res = await adminApi.login(email, pass);
    if (res.token) {
      localStorage.setItem('datadaddy_admin_token', res.token);
      setUser(res.admin || { id: 'admin_root', email, name: 'Master Admin', role: 'superadmin' });
      addToast('success', 'Logged in as Master Administrator');
    }
  };

  const logout = () => {
    localStorage.removeItem('datadaddy_admin_token');
    setUser(null);
    addToast('info', 'Logged out successfully');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        selectedShopId,
        setSelectedShopId,
        shops,
        refreshShops,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
      {/* Global Toast Render */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
};
