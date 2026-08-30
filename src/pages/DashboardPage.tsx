import React, { useState, useEffect } from 'react';
import {
  Store,
  Users2,
  ClipboardList,
  IndianRupee,
  ArrowUpRight,
  Eye,
  Plus,
} from 'lucide-react';
import type { PlatformOverview, OrderItem, RevenueAnalytics } from '../types/admin';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { RevenueChart } from '../components/RevenueChart';
import { OrderInspectorModal } from '../components/OrderInspectorModal';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface DashboardPageProps {
  onNavigateTab: (tab: any) => void;
  onOpenShopModal: () => void;
  onOpenTechModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenShopModal,
  onOpenTechModal,
}) => {
  const { selectedShopId, shops } = useAdminAuth();
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, rev] = await Promise.all([
        adminApi.getOverview(selectedShopId),
        adminApi.getRevenueAnalytics(selectedShopId),
      ]);
      setOverview(ov);
      setRevenueData(rev);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedShopId]);

  const activeShop = shops.find((s) => s._id === selectedShopId);
  const kpis = overview?.kpis;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {selectedShopId === 'all'
              ? 'Platform Overview'
              : `${activeShop?.name || 'Shop'} Dashboard`}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {selectedShopId === 'all'
              ? 'Real-time multi-shop aggregation, job status pipeline, and revenue metrics.'
              : `Operating in ${activeShop?.address?.city || 'India'} • Managed by ${activeShop?.ownerName}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onOpenTechModal} className="btn btn-secondary btn-sm">
            <Users2 size={15} />
            <span>+ Add Technician</span>
          </button>
          <button onClick={onOpenShopModal} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>+ Onboard Shop</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="TOTAL REVENUE"
          value={`₹${(kpis?.totalRevenue || 0).toLocaleString()}`}
          subtitle={`${selectedShopId === 'all' ? 'All Shops Collected' : 'Total Collected'}`}
          trend={{ value: '+14% this month', isPositive: true }}
          icon={IndianRupee}
          gradient="emerald"
        />

        <StatCard
          title="ACTIVE SHOPS"
          value={kpis?.totalShops || 0}
          subtitle={`${kpis?.proShops || 0} on Pro Tier`}
          trend={{ value: `${kpis?.activeShops || 0} active`, isPositive: true }}
          icon={Store}
          gradient="brand"
        />

        <StatCard
          title="TOTAL TECHNICIANS"
          value={kpis?.totalTechnicians || 0}
          subtitle="Hardware & Board Engineers"
          trend={{ value: 'Multi-shop staff', isPositive: true }}
          icon={Users2}
          gradient="cyan"
        />

        <StatCard
          title="PENDING REPAIRS"
          value={(overview?.statusCounts?.pending || 0) + (overview?.statusCounts?.in_progress || 0)}
          subtitle={`₹${(kpis?.totalDues || 0).toLocaleString()} uncollected dues`}
          trend={{ value: `${overview?.statusCounts?.in_progress || 0} in progress`, isPositive: true }}
          icon={ClipboardList}
          gradient="amber"
        />
      </div>

      {/* Revenue Charts & Leaderboard */}
      <RevenueChart data={revenueData} />

      {/* Live Recent Orders & Customer Issues Feed */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Live Orders & Customer Issues Feed</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Inspect customer-reported problems and device status across repair shops
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--accent-primary)' }}
          >
            <span>View All Orders</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Shop</th>
                <th>Customer Details</th>
                <th>Device</th>
                <th>Customer Issue / Fault</th>
                <th>Status</th>
                <th>Amount / Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading overview...
                  </td>
                </tr>
              ) : overview?.recentOrders && overview.recentOrders.length > 0 ? (
                overview.recentOrders.map((ord) => {
                  const shopName = typeof ord.shopId === 'object' ? ord.shopId?.name : 'Shop';
                  return (
                    <tr key={ord._id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {ord.jobId}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {shopName}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.customerSnapshot.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ord.customerSnapshot.phone}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.brand} {ord.model}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {ord.deviceType}
                        </div>
                      </td>
                      <td>
                        {/* Prominent customer issue */}
                        <div className="issue-callout">
                          "{ord.problemDescription}"
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={ord.status} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>₹{ord.cost.final}</div>
                        <div style={{ fontSize: '0.75rem', color: ord.cost.due > 0 ? '#f43f5e' : '#10b981' }}>
                          {ord.cost.due > 0 ? `Due: ₹${ord.cost.due}` : 'Paid'}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="btn btn-secondary btn-sm"
                          title="Open Full Job Card Inspector"
                        >
                          <Eye size={14} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No repair orders found. Click "Seed Demo Data" on top to populate realistic records!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspector Modal */}
      {selectedOrder && (
        <OrderInspectorModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={(updated) => {
            setSelectedOrder(updated);
            loadData();
          }}
        />
      )}

    </div>
  );
};
