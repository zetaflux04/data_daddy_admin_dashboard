import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { adminApi, API_BASE_URL } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const SystemHealthPage: React.FC = () => {
  const { addToast, refreshShops } = useAdminAuth();
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendHealth(data);
      } else {
        setBackendHealth({ status: 'error', service: 'Unavailable' });
      }
    } catch {
      setBackendHealth({ status: 'offline', service: 'Live Server Not Reachable' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSeed = async (force: boolean) => {
    setSeeding(true);
    try {
      const res = await adminApi.triggerSeed(force);
      addToast('success', res.message || 'Seeded realistic multi-tenant data!');
      await refreshShops();
    } catch (e: any) {
      addToast('error', e.message || 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Platform System Diagnostics & Seeder</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Monitor microservices, Fast2SMS gateway status, database connectivity, and seed multi-tenant test data.
        </p>
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* Backend API Box */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} color="var(--accent-primary)" />
              <h4 style={{ fontSize: '0.9375rem' }}>Common Express API</h4>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: backendHealth?.status === 'ok' ? '#34d399' : '#f87171',
              }}
            >
              {backendHealth?.status === 'ok' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              {backendHealth?.status === 'ok' ? 'Online (Render Cloud Live)' : 'Offline / Standalone'}
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Serves both the Expo mobile app and this React admin dashboard seamlessly.
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Timestamp: {backendHealth?.timestamp || new Date().toISOString()}
          </div>
        </div>

        {/* Fast2SMS Gateway Box */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={18} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: '0.9375rem' }}>Fast2SMS Telephony</h4>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
              Console Simulation Mode
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            DLT and quick OTP dispatch simulated in server logs (No credit depletion during testing).
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Sender ID: TXTIND • Route: Quick (Q)
          </div>
        </div>

        {/* Multi-Tenant Database */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '0.9375rem' }}>Multi-Tenant Store</h4>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>
              MongoDB / In-Memory Resilient
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Tenant isolation per shopId with cross-tenant Super Admin master view.
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Multi-Tenant Collections: shops, users, customers, orders, expenses
          </div>
        </div>

      </div>

      {/* Database Seeder Control Panel */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Zap size={22} color="var(--accent-amber)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>One-Click Multi-Tenant Data Seeder</h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: '750px', lineHeight: 1.6 }}>
          Instantly populate realistic repair shops located in Mumbai, Surat, Bengaluru, and New Delhi. Includes technicians with assigned repair workloads, active clients with verified phone numbers, and job cards featuring realistic customer-reported issues (e.g. shattered OLED screens, water damage, motherboard power faults, and fast battery drains).
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleSeed(false)}
            disabled={seeding}
            className="btn btn-secondary"
          >
            <Database size={15} />
            <span>{seeding ? 'Seeding...' : 'Seed Data (If Empty)'}</span>
          </button>

          <button
            onClick={() => handleSeed(true)}
            disabled={seeding}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <RefreshCw size={15} className={seeding ? 'spin-anim' : ''} />
            <span>{seeding ? 'Resetting & Seeding...' : 'Force Reset & Re-Seed All'}</span>
          </button>

          <button onClick={checkHealth} className="btn btn-ghost">
            <RefreshCw size={15} className={loading ? 'spin-anim' : ''} />
            <span>Ping Backend API</span>
          </button>
        </div>
      </div>

    </div>
  );
};
