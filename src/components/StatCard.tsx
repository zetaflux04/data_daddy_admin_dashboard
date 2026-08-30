import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon: LucideIcon;
  gradient?: 'brand' | 'emerald' | 'amber' | 'cyan';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  gradient = 'brand',
}) => {
  const gradientMap = {
    brand: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    emerald: 'linear-gradient(135deg, #10b981, #059669)',
    amber: 'linear-gradient(135deg, #f59e0b, #d97706)',
    cyan: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  };

  const glowMap = {
    brand: 'rgba(99, 102, 241, 0.25)',
    emerald: 'rgba(16, 185, 129, 0.25)',
    amber: 'rgba(245, 158, 11, 0.25)',
    cyan: 'rgba(6, 182, 212, 0.25)',
  };

  return (
    <div
      className="glass-panel interactive-card"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: gradientMap[gradient],
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: gradientMap[gradient],
            boxShadow: `0 4px 12px ${glowMap[gradient]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={20} color="#ffffff" />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
        {trend && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 700,
              color: trend.isPositive ? '#34d399' : '#f87171',
            }}
          >
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </span>
        )}
        {subtitle && <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>}
      </div>
    </div>
  );
};
