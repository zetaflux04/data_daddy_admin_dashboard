import React from 'react';
import type { RevenueAnalytics } from '../types/admin';
import { PieChart, BarChart3 } from 'lucide-react';

interface RevenueChartProps {
  data: RevenueAnalytics | null;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  if (!data) return null;

  const maxRevenue = Math.max(...data.revenueByShop.map((s) => s.revenue + s.dues), 1);
  const totalModeAmount = data.paymentsByMode.reduce((sum, m) => sum + m.totalAmount, 0) || 1;

  const modeColors: Record<string, string> = {
    upi: '#8b5cf6',
    cash: '#10b981',
    card: '#06b6d4',
    online: '#f59e0b',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
      
      {/* Revenue Leaderboard per Shop */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Shop Revenue & Dues Comparison</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top Performing Shops</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.revenueByShop.map((item) => {
            const revPct = Math.round((item.revenue / maxRevenue) * 100);
            const duePct = Math.round((item.dues / maxRevenue) * 100);

            return (
              <div key={item.shopId} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.shopName}</span>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>₹{item.revenue.toLocaleString()}</span>
                    {item.dues > 0 && <span style={{ color: '#f87171', fontWeight: 600 }}>Due: ₹{item.dues.toLocaleString()}</span>}
                  </div>
                </div>

                {/* Stacked Progress Bar */}
                <div style={{
                  height: '10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#f1f5f9',
                  overflow: 'hidden',
                  display: 'flex',
                }}>
                  <div
                    title={`Collected: ₹${item.revenue}`}
                    style={{
                      width: `${revPct}%`,
                      background: 'linear-gradient(90deg, #6366f1, #10b981)',
                      borderRadius: 'var(--radius-full) 0 0 var(--radius-full)',
                      transition: 'width 0.5s ease-out',
                    }}
                  />
                  {item.dues > 0 && (
                    <div
                      title={`Pending Due: ₹${item.dues}`}
                      style={{
                        width: `${duePct}%`,
                        backgroundColor: '#f43f5e',
                        transition: 'width 0.5s ease-out',
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Revenue Collected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f43f5e' }} />
            <span>Uncollected Dues</span>
          </div>
        </div>
      </div>

      {/* Payment Modes Distribution */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Payment Method Distribution</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ₹{totalModeAmount.toLocaleString()} Total
          </span>
        </div>

        {/* Horizontal Stacked Bar */}
        <div style={{
          height: '14px',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          display: 'flex',
          marginBottom: '1.5rem',
          backgroundColor: '#f1f5f9',
        }}>
          {data.paymentsByMode.map((mode) => {
            const pct = (mode.totalAmount / totalModeAmount) * 100;
            return (
              <div
                key={mode._id}
                title={`${mode._id.toUpperCase()}: ₹${mode.totalAmount} (${Math.round(pct)}%)`}
                style={{
                  width: `${pct}%`,
                  backgroundColor: modeColors[mode._id] || '#6366f1',
                  transition: 'width 0.5s ease-out',
                }}
              />
            );
          })}
        </div>

        {/* Detailed Breakdown Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {data.paymentsByMode.map((mode) => {
            const pct = Math.round((mode.totalAmount / totalModeAmount) * 100);
            return (
              <div
                key={mode._id}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  backgroundColor: modeColors[mode._id] || '#6366f1',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {mode._id}
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{mode.totalAmount.toLocaleString()}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
