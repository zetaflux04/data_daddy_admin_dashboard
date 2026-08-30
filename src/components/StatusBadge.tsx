import React from 'react';
import type { JobStatus } from '../types/admin';
import { Clock, Wrench, AlertCircle, CheckCircle2, Truck, XCircle, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: JobStatus | string;
  type?: 'status' | 'plan' | 'role';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status' }) => {
  if (type === 'plan') {
    return (
      <span className={`badge ${status === 'pro' ? 'badge-pro' : 'badge-free'}`}>
        {status === 'pro' && <Sparkles size={11} />}
        {status.toUpperCase()} PLAN
      </span>
    );
  }

  if (type === 'role') {
    const roleColors: Record<string, { bg: string; border: string; text: string }> = {
      owner: { bg: 'rgba(217, 70, 239, 0.15)', border: 'rgba(217, 70, 239, 0.3)', text: '#f0abfc' },
      technician: { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.35)', text: '#c7d2fe' },
      staff: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.35)', text: '#a5f3fc' },
    };
    const c = roleColors[status] || roleColors.staff;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.55rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'capitalize',
          backgroundColor: c.bg,
          border: `1px solid ${c.border}`,
          color: c.text,
        }}
      >
        {status}
      </span>
    );
  }

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock size={12} />,
    in_progress: <Wrench size={12} />,
    parts_delayed: <AlertCircle size={12} />,
    repaired: <CheckCircle2 size={12} />,
    delivered: <Truck size={12} />,
    canceled: <XCircle size={12} />,
  };

  const statusLabels: Record<string, string> = {
    pending: 'Intake / Pending',
    in_progress: 'In Progress',
    parts_delayed: 'Parts Delayed',
    repaired: 'Ready for Pickup',
    delivered: 'Delivered',
    canceled: 'Canceled',
  };

  return (
    <span className={`badge badge-${status}`}>
      {statusIcons[status] || <Clock size={12} />}
      <span>{statusLabels[status] || status}</span>
    </span>
  );
};
