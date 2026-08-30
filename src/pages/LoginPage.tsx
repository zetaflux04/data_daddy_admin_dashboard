import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const LoginPage: React.FC = () => {
  const { login, addToast } = useAdminAuth();
  const [email, setEmail] = useState('admin@datadaddy.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('error', 'Email and password are required');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      addToast('error', err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@datadaddy.com');
    setPassword('admin123');
    addToast('info', 'Demo credentials autofilled');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      backgroundImage: `
        radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.18) 0px, transparent 40%),
        radial-gradient(circle at 85% 75%, rgba(6, 182, 212, 0.14) 0px, transparent 45%)
      `,
      padding: '1.5rem',
    }}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo Badge */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--gradient-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
          marginBottom: '1.25rem',
        }}>
          <ShieldCheck size={32} color="#ffffff" />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.25rem' }}>
          Data<span style={{ color: 'var(--accent-primary)' }}>Daddy</span> Admin
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
          Cross-Tenant Super Admin & Control Portal
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Admin Email Address</label>
            <div className="search-wrapper">
              <Mail size={16} />
              <input
                type="email"
                className="input-field search-input"
                placeholder="admin@datadaddy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Password</label>
            <div className="search-wrapper">
              <Lock size={16} />
              <input
                type="password"
                className="input-field search-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Credentials Autofill Pill */}
        <div style={{ marginTop: '1.75rem', width: '100%', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}
          >
            <Sparkles size={13} />
            <span>Use Quick Demo Credentials (admin@datadaddy.com / admin123)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
