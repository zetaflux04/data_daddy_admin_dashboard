import React, { useState, useEffect } from 'react';
import { IndianRupee, Download, TrendingUp, AlertCircle, Store } from 'lucide-react';
import type { RevenueAnalytics } from '../types/admin';
import { StatCard } from '../components/StatCard';
import { RevenueChart } from '../components/RevenueChart';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const RevenuePage: React.FC = () => {
  const { selectedShopId, addToast } = useAdminAuth();
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRevenueAnalytics(selectedShopId);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [selectedShopId]);

  const handleExportCSV = () => {
    if (!data) return;

    const headers = ['Shop Name,Owner,Plan,Revenue Collected (INR),Pending Dues (INR),Total Jobs'];
    const rows = data.revenueByShop.map(
      (s) => `"${s.shopName}","${s.ownerName}","${s.plan}",${s.revenue},${s.dues},${s.ordersCount}`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `datadaddy_revenue_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Revenue report CSV exported successfully!');
  };

  const summary = data?.summary;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Revenue & Financial Intelligence</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time cash flow, pending dues collection rate, and revenue breakdown per shop.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-primary">
          <Download size={16} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Top Financial Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="TOTAL REVENUE COLLECTED"
          value={`₹${(summary?.totalRevenue || 0).toLocaleString()}`}
          subtitle="Net advance & paid amounts"
          trend={{ value: '100% Verified', isPositive: true }}
          icon={IndianRupee}
          gradient="emerald"
        />

        <StatCard
          title="PENDING CUSTOMER DUES"
          value={`₹${(summary?.totalDues || 0).toLocaleString()}`}
          subtitle="Awaiting pickup payment"
          trend={{ value: 'Outstanding', isPositive: false }}
          icon={AlertCircle}
          gradient="amber"
        />

        <StatCard
          title="TOTAL GROSS REPAIRS"
          value={`₹${(summary?.totalGrossValue || 0).toLocaleString()}`}
          subtitle={`Across ${summary?.ordersCount || 0} job cards`}
          trend={{ value: '+18% growth', isPositive: true }}
          icon={TrendingUp}
          gradient="brand"
        />
      </div>

      {/* Visual Analytics Chart */}
      <RevenueChart data={data} />

      {/* Multi-Shop Revenue Breakdown Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Shop-by-Shop Financial Breakdown</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Detailed turnover, uncollected balance, and job count per tenant
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Owner</th>
                <th>Subscription Plan</th>
                <th>Total Jobs</th>
                <th>Revenue Collected</th>
                <th>Pending Customer Dues</th>
                <th>Collection Rate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading financial data...
                  </td>
                </tr>
              ) : !data || data.revenueByShop.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No revenue records available.
                  </td>
                </tr>
              ) : (
                data.revenueByShop.map((item) => {
                  const total = item.revenue + item.dues;
                  const collectionRate = total > 0 ? Math.round((item.revenue / total) * 100) : 100;

                  return (
                    <tr key={item.shopId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Store size={16} color="var(--accent-primary)" />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.shopName}
                          </span>
                        </div>
                      </td>

                      <td>{item.ownerName}</td>

                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: item.plan === 'pro' ? '#c084fc' : 'var(--text-muted)',
                        }}>
                          {item.plan} Tier
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600 }}>{item.ordersCount}</span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 800, color: '#34d399' }}>
                          ₹{item.revenue.toLocaleString()}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, color: item.dues > 0 ? '#f43f5e' : 'var(--text-muted)' }}>
                          {item.dues > 0 ? `₹${item.dues.toLocaleString()}` : '₹0'}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            flex: 1,
                            height: '6px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden',
                            maxWidth: '100px',
                          }}>
                            <div
                              style={{
                                width: `${collectionRate}%`,
                                backgroundColor: collectionRate > 80 ? '#10b981' : '#f59e0b',
                                height: '100%',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            {collectionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
