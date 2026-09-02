import React, { useState, useEffect } from 'react';
import { Store, RefreshCw, Database } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi, API_BASE_URL } from '../services/adminApi';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle, onRefresh, isRefreshing }) => {
  const { selectedShopId, setSelectedShopId, shops, addToast, refreshShops } = useAdminAuth();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Check health of live backend API once on mount
  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await adminApi.triggerSeed(true);
      addToast('success', res.message || 'Seeded realistic multi-tenant data!');
      await refreshShops();
      if (onRefresh) onRefresh();
    } catch (e: any) {
      addToast('error', e.message || 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Backend Connectivity Status */}
        <div
          title={backendOnline ? 'Render Backend Connected (Live Cloud)' : 'Backend offline - Using local fallback'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: backendOnline ? '#ecfdf5' : '#fef3c7',
            border: `1px solid ${backendOnline ? '#a7f3d0' : '#fde68a'}`,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: backendOnline ? '#065f46' : '#92400e',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendOnline ? '#10b981' : '#f59e0b',
            }}
          />
          <span>{backendOnline ? 'Render Backend Live' : 'Offline / Standalone Mode'}</span>
        </div>

        {/* Global Shop Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Store size={16} color="var(--text-muted)" />
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="select-field"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              minWidth: '220px',
              backgroundColor: '#ffffff',
              borderColor: selectedShopId !== 'all' ? 'var(--accent-primary)' : 'var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">🌐 All Shops (Global Platform)</option>
            {shops.map((shop) => (
              <option key={shop._id} value={shop._id}>
                🏪 {shop.name} ({shop.address?.city || 'India'})
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Data Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn btn-secondary btn-sm"
            title="Refresh All Data"
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
            <span>Refresh</span>
          </button>
        )}

        {/* Instant Multi-Tenant Seeder */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="btn btn-primary btn-sm"
          title="Seed realistic multi-tenant demo shops, technicians, and repair issues"
        >
          <Database size={14} />
          <span>{seeding ? 'Seeding...' : 'Seed Demo Data'}</span>
        </button>
      </div>

      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
