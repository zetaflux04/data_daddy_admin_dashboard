import React from 'react';
import {
  LayoutDashboard,
  Store,
  ClipboardList,
  IndianRupee,
  Bell,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export type NavTab =
  | 'dashboard'
  | 'shops'
  | 'orders'
  | 'revenue'
  | 'notifications';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAdminAuth();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Overview/Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'shops' as NavTab, label: 'Shops/Center', icon: Store, badge: null },
    { id: 'orders' as NavTab, label: 'Orders', icon: ClipboardList, badge: 'Live' },
    { id: 'revenue' as NavTab, label: 'Revenue', icon: IndianRupee, badge: null },
    { id: 'notifications' as NavTab, label: 'Notification', icon: Bell, badge: 'New' },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--sidebar-border)',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={22} color="#ffffff" />
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Data<span style={{ color: '#818cf8' }}>Daddy</span>
          </div>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#38bdf8',
            }}
          >
            Super Admin
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--sidebar-text-muted)',
            padding: '0.5rem 0.75rem 0.25rem',
          }}
        >
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
                color: isActive ? '#ffffff' : '#cbd5e1',
                border: isActive ? '1px solid #6366f1' : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-display)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
            >
              <Icon size={18} color={isActive ? '#818cf8' : 'currentColor'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    backgroundColor: item.badge === 'Live' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                    color: item.badge === 'Live' ? '#6ee7b7' : '#fda4af',
                    border: item.badge === 'Live' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.1rem 0.45rem',
                  }}
                >
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={14} color="#818cf8" />}
            </button>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--sidebar-border)',
          backgroundColor: '#0f172a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #4f46e5, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#fff',
              fontSize: '0.8125rem',
            }}
          >
            SA
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Master Admin'}
            </div>
            <div
              style={{
                fontSize: '0.6875rem',
                color: '#94a3b8',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email || 'admin@datadaddy.com'}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'center', color: '#fca5a5' }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
