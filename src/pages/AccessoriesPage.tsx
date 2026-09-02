import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  IndianRupee,
  Phone,
  ShoppingBag,
  TrendingUp,
  Package,
  CreditCard,
} from 'lucide-react';
import type { OrderItem } from '../types/admin';
import { StatusBadge } from '../components/StatusBadge';
import { OrderInspectorModal } from '../components/OrderInspectorModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AccessoriesPage: React.FC = () => {
  const { selectedShopId, addToast } = useAdminAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [inspectOrder, setInspectOrder] = useState<OrderItem | null>(null);
  const [editOrder, setEditOrder] = useState<OrderItem | null>(null);

  const fetchAccessoryOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        shopId: selectedShopId,
        orderType: 'accessory',
        search,
      });
      setOrders(res.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessoryOrders();
  }, [selectedShopId, search]);

  const handleDelete = async (ord: OrderItem) => {
    const confirmed = window.confirm(
      `⚠️ Delete accessory sale "${ord.jobId}" (${ord.productName || 'Product'}) for customer ${ord.customerSnapshot.name}?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteOrder(ord._id);
      addToast('success', `Accessory sale ${ord.jobId} deleted successfully`);
      fetchAccessoryOrders();
    } catch (e: any) {
      addToast('error', e.message || 'Failed to delete accessory sale');
    }
  };

  // KPIs
  const totalSalesCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.productPrice || o.cost?.final || 0), 0);
  const avgSaleValue = totalSalesCount > 0 ? Math.round(totalRevenue / totalSalesCount) : 0;
  
  const today = new Date().toDateString();
  const todaySalesCount = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={24} color="#a855f7" />
          Accessory Sales & Direct Products
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Monitor all direct accessory product sales, screen guards, chargers, and cases sold across registered repair centers.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Total Sales */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Products Sold
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalSalesCount}
            </div>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IndianRupee size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Accessory Revenue
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Card 3: Avg Sale */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Avg Product Price
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{avgSaleValue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Card 4: Today's Sales */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Sold Today
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>
              {todaySalesCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '280px' }}>
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accessory product, customer name, phone, or Sale ID..."
              className="input-field search-input"
            />
          </div>
        </div>
      </div>

      {/* Accessory Sales Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sale ID & Center</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Product / Accessory</th>
                <th>Selling Price</th>
                <th>Payment Status</th>
                <th>Sale Date</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading accessory sales...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No accessory sales recorded yet.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const shopName = typeof ord.shopId === 'object' ? ord.shopId?.name : 'Center';
                  const shopCity = typeof ord.shopId === 'object' ? ord.shopId?.address?.city : '';
                  const customerAddress =
                    typeof ord.customerId === 'object' && ord.customerId && 'address' in (ord.customerId as any)
                      ? `${(ord.customerId as any).address?.street || ''} ${(ord.customerId as any).address?.city || ''}`.trim() || 'On-file'
                      : 'On-file';

                  const price = ord.productPrice || ord.cost?.final || 0;
                  const paymentMode = ord.payments?.[0]?.mode?.toUpperCase() || 'PAID';

                  return (
                    <tr key={ord._id}>
                      {/* 1. Sale ID & Center */}
                      <td>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {ord.jobId}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                          🏪 {shopName} {shopCity ? `(${shopCity})` : ''}
                        </div>
                      </td>

                      {/* 2. Customer Name & Address */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {ord.customerSnapshot.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            marginTop: '0.15rem',
                          }}
                        >
                          <MapPin size={11} />
                          <span>{customerAddress}</span>
                        </div>
                      </td>

                      {/* 3. Customer Phone */}
                      <td>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'var(--accent-cyan)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Phone size={12} />
                          <span>{ord.customerSnapshot.phone}</span>
                        </div>
                      </td>

                      {/* 4. Product Name */}
                      <td>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e9d5ff' }}>
                          <ShoppingBag size={14} color="#a855f7" />
                          <span>{ord.productName || 'Accessory Item'}</span>
                        </div>
                      </td>

                      {/* 5. Selling Price */}
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <IndianRupee size={13} color="#34d399" />
                          <span>{price.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          via {paymentMode}
                        </div>
                      </td>

                      {/* 6. Status */}
                      <td>
                        <StatusBadge status={ord.status || 'delivered'} />
                      </td>

                      {/* 7. Date */}
                      <td>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* 8. Action Buttons */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => setInspectOrder(ord)}
                            className="btn btn-secondary btn-sm"
                            title="View Accessory Sale Details"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => setEditOrder(ord)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Accessory Sale Specs"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(ord)}
                            className="btn btn-danger btn-sm"
                            title="Delete Accessory Sale"
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* View Order Inspector Modal */}
      {inspectOrder && (
        <OrderInspectorModal
          order={inspectOrder}
          onClose={() => setInspectOrder(null)}
          onOrderUpdated={() => fetchAccessoryOrders()}
        />
      )}

      {/* Edit Order Modal */}
      <EditOrderModal
        order={editOrder}
        isOpen={Boolean(editOrder)}
        onClose={() => setEditOrder(null)}
        onSaved={() => fetchAccessoryOrders()}
      />
    </div>
  );
};
