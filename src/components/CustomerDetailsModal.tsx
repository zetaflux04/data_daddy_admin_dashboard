import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Eye } from 'lucide-react';
import type { CustomerItem, OrderItem } from '../types/admin';
import { StatusBadge } from './StatusBadge';
import { adminApi } from '../services/adminApi';

interface CustomerDetailsModalProps {
  customer: CustomerItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: OrderItem) => void;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      setLoading(true);
      adminApi.getCustomerById(customer._id).then((res) => {
        if (res?.orders) setOrders(res.orders);
        setLoading(false);
      });
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const shopName = typeof customer.shopId === 'object' ? customer.shopId?.name : 'Repair Shop';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
            }}>
              {customer.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{customer.name}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Registered Customer at {shopName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Customer Metadata Card */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.8125rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>PHONE NUMBER</span>
              <a href={`tel:${customer.phone}`} style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
                📞 {customer.phone}
              </a>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>TOTAL ORDERS</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {customer.totalOrdersCount} Repair Job(s)
              </span>
            </div>
            {customer.email && (
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>EMAIL ADDRESS</span>
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.6875rem' }}>POSTAL ADDRESS</span>
                <span>{customer.address}</span>
              </div>
            )}
          </div>

          {/* Repair History */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShoppingBag size={16} color="var(--accent-primary)" />
              <h4 style={{ fontSize: '0.9375rem' }}>Repair Orders History</h4>
            </div>

            {loading ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No orders found for this customer.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {orders.map((ord) => (
                  <div
                    key={ord._id}
                    className="glass-panel"
                    style={{
                      padding: '0.875rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      onClose();
                      onSelectOrder(ord);
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {ord.jobId}
                        </span>
                        <StatusBadge status={ord.status} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ord.brand} {ord.model} • <span style={{ color: '#fef3c7' }}>"{ord.problemDescription.slice(0, 50)}..."</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>₹{ord.cost.final}</div>
                        <div style={{ fontSize: '0.6875rem', color: ord.cost.due > 0 ? '#f43f5e' : '#10b981' }}>
                          {ord.cost.due > 0 ? `Due: ₹${ord.cost.due}` : 'Fully Paid'}
                        </div>
                      </div>
                      <Eye size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
