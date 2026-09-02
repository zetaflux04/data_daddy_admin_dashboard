import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  MapPin,
  IndianRupee,
  Phone,
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import type { OrderItem } from '../types/admin';
import { StatusBadge } from '../components/StatusBadge';
import { OrderInspectorModal } from '../components/OrderInspectorModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const OrdersPage: React.FC = () => {
  const { selectedShopId, addToast } = useAdminAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [inspectOrder, setInspectOrder] = useState<OrderItem | null>(null);
  const [editOrder, setEditOrder] = useState<OrderItem | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        shopId: selectedShopId,
        status: statusFilter,
        deviceType: deviceFilter,
        orderType: orderTypeFilter,
        search,
      });
      setOrders(res.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedShopId, statusFilter, deviceFilter, orderTypeFilter, search]);

  const handleDeleteOrder = async (ord: OrderItem) => {
    const typeLabel = (ord.orderType || 'repair') === 'accessory' ? 'accessory sale' : 'repair order';
    const confirmed = window.confirm(
      `⚠️ Delete ${typeLabel} "${ord.jobId}" for customer ${ord.customerSnapshot.name}?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteOrder(ord._id);
      addToast('success', `Order ${ord.jobId} deleted successfully`);
      fetchOrders();
    } catch (e: any) {
      addToast('error', e.message || 'Failed to delete order');
    }
  };

  const statusTabs: { id: string; label: string }[] = [
    { id: 'all', label: 'All Jobs' },
    { id: 'pending', label: 'Pending Intake' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'parts_delayed', label: 'Parts Delayed' },
    { id: 'repaired', label: 'Repaired / Ready' },
    { id: 'delivered', label: 'Delivered' },
  ];

  const getOrderTypeBadge = (orderType?: string) => {
    const isAccessory = orderType === 'accessory';
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.2rem',
          fontSize: '0.625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          padding: '0.15rem 0.45rem',
          borderRadius: '4px',
          backgroundColor: isAccessory ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
          color: isAccessory ? '#a855f7' : '#3b82f6',
          border: `1px solid ${isAccessory ? 'rgba(168, 85, 247, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
        }}
      >
        {isAccessory ? <ShoppingBag size={9} /> : <Wrench size={9} />}
        {isAccessory ? 'Accessory' : 'Repair'}
      </span>
    );
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Customer Orders & Repair Issues</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Review all repair orders and accessory sales across centers. Inspect reported customer issues, device model numbers, costs, customer addresses, and update or delete orders.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div className="search-wrapper" style={{ flex: 1, minWidth: '280px' }}>
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer issue, device model, product, customer name, phone, or Job ID..."
              className="input-field search-input"
            />
          </div>

          {/* Order Type Filter */}
          <select
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
            className="select-field"
            style={{ width: '160px' }}
          >
            <option value="all">All Types</option>
            <option value="repair">🔧 Repairs</option>
            <option value="accessory">🛒 Accessories</option>
          </select>

          {/* Device Type Filter */}
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="select-field"
            style={{ width: '160px' }}
          >
            <option value="all">All Devices</option>
            <option value="mobile">📱 Smartphone</option>
            <option value="laptop">💻 Laptop</option>
            <option value="tablet">📟 Tablet</option>
            <option value="watch">⌚ Smartwatch</option>
          </select>
        </div>

        {/* Pipeline Status Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingTop: '0.85rem',
            marginTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className="btn btn-sm"
              style={{
                backgroundColor: statusFilter === tab.id ? 'var(--accent-primary)' : 'transparent',
                color: statusFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                border: statusFilter === tab.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job ID & Center</th>
                <th>Customer & Address</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Device / Product</th>
                <th style={{ minWidth: '220px' }}>Details</th>
                <th>Status</th>
                <th>Cost & Due</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading customer orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const shopName = typeof ord.shopId === 'object' ? ord.shopId?.name : 'Center';
                  const shopCity = typeof ord.shopId === 'object' ? ord.shopId?.address?.city : '';
                  const customerAddress =
                    typeof ord.customerId === 'object' && ord.customerId && 'address' in (ord.customerId as any)
                      ? `${(ord.customerId as any).address?.street || ''} ${(ord.customerId as any).address?.city || ''}`.trim() || 'On-file with center'
                      : 'On-file with center';

                  const isAccessory = (ord.orderType || 'repair') === 'accessory';

                  return (
                    <tr key={ord._id}>
                      {/* 1. Job ID & Center */}
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

                      {/* 4. Order Type Badge */}
                      <td>
                        {getOrderTypeBadge(ord.orderType)}
                      </td>

                      {/* 5. Device / Product Info */}
                      <td>
                        {isAccessory ? (
                          <>
                            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <ShoppingBag size={13} color="var(--accent-primary)" />
                              {ord.productName || 'Accessory'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Price: ₹{(ord.productPrice || 0).toLocaleString('en-IN')}
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: 700 }}>
                              {ord.brand} {ord.model}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                              {ord.deviceType} {ord.serialOrImei ? `• IMEI: ${ord.serialOrImei.slice(-4)}` : ''}
                            </div>
                          </>
                        )}
                      </td>

                      {/* 6. Details — Issue for repair, sale info for accessory */}
                      <td>
                        {isAccessory ? (
                          <div style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic',
                          }}>
                            Accessory sale — no repair needed
                          </div>
                        ) : (
                          <div className="issue-callout" title={ord.problemDescription}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                marginBottom: '0.2rem',
                                color: 'var(--accent-amber)',
                                fontWeight: 700,
                                fontSize: '0.6875rem',
                              }}
                            >
                              <AlertTriangle size={11} />
                              <span>CUSTOMER ISSUE:</span>
                            </div>
                            "{ord.problemDescription}"
                          </div>
                        )}
                      </td>

                      {/* 7. Status */}
                      <td>
                        <StatusBadge status={ord.status} />
                      </td>

                      {/* 8. Cost & Due */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <IndianRupee size={12} />
                          <span>{(ord.cost?.final || ord.cost?.estimated || 0).toLocaleString('en-IN')}</span>
                        </div>
                        {(ord.cost?.due || 0) > 0 ? (
                          <div style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 600 }}>
                            Due: ₹{ord.cost.due.toLocaleString('en-IN')}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                            Paid in Full
                          </div>
                        )}
                      </td>

                      {/* 9. Action Buttons: View Order, Edit Order, Delete Order */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          {/* 1. View Order */}
                          <button
                            onClick={() => setInspectOrder(ord)}
                            className="btn btn-secondary btn-sm"
                            title="View Order Details, Status, and Payments"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {/* 2. Edit Order */}
                          <button
                            onClick={() => setEditOrder(ord)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Order Specs, Customer Issue, Cost"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          {/* 3. Delete Order */}
                          <button
                            onClick={() => handleDeleteOrder(ord)}
                            className="btn btn-danger btn-sm"
                            title="Delete Order"
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
          onOrderUpdated={() => fetchOrders()}
        />
      )}

      {/* Edit Order Modal */}
      <EditOrderModal
        order={editOrder}
        isOpen={Boolean(editOrder)}
        onClose={() => setEditOrder(null)}
        onSaved={() => fetchOrders()}
      />
    </div>
  );
};
