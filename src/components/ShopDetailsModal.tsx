import React, { useState, useEffect } from 'react';
import { X, Store, User, Phone, MapPin, Wrench, IndianRupee, ClipboardList, Users } from 'lucide-react';
import type { ShopItem, TechnicianItem } from '../types/admin';
import { StatusBadge } from './StatusBadge';
import { adminApi } from '../services/adminApi';

interface ShopDetailsModalProps {
  shop: ShopItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (shop: ShopItem) => void;
  onAddTechnician: (shopId: string) => void;
}

export const ShopDetailsModal: React.FC<ShopDetailsModalProps> = ({
  shop,
  isOpen,
  onClose,
  onEdit,
  onAddTechnician,
}) => {
  const [techs, setTechs] = useState<TechnicianItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && shop) {
      setLoading(true);
      adminApi
        .getTechnicians({ shopId: shop._id })
        .then((res) => setTechs(res.technicians || []))
        .catch(() => setTechs([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen, shop]);

  if (!isOpen || !shop) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4338ca',
              }}
            >
              <Store size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{shop.name}</h3>
                <StatusBadge status={shop.subscription.plan} type="plan" />
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: shop.subscription.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: shop.subscription.status === 'active' ? '#15803d' : '#b91c1c',
                  }}
                >
                  {shop.subscription.status}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Registered Service Center • Code ID: {shop._id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.35rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Key Financial & Operational Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <IndianRupee size={12} /> Total Revenue
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                ₹{(shop.stats?.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ClipboardList size={12} /> Total Orders
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {shop.stats?.totalOrders || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Wrench size={12} /> Technicians
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
                {shop.stats?.totalStaff || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Users size={12} /> Customers
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {shop.stats?.totalCustomers || 0}
              </div>
            </div>
          </div>

          {/* Center & Owner Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Owner & Contact
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={15} color="var(--text-muted)" />
                  <span style={{ fontWeight: 600 }}>{shop.ownerName || 'Center Manager'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={15} color="var(--text-muted)" />
                  <span>{shop.phone}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Location & Address
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem' }}>
                <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{shop.address?.city || 'India'}, {shop.address?.state || 'MH'}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {shop.address?.street ? `${shop.address.street}, ` : ''}
                    {shop.address?.pincode ? `PIN: ${shop.address.pincode}` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technicians Working in this Center */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                Technicians Associated With Center ({techs.length})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onAddTechnician(shop._id);
                }}
                className="btn btn-secondary btn-sm"
              >
                + Add Technician
              </button>
            </div>

            {loading ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Loading staff...</p>
            ) : techs.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-medium)',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                }}
              >
                No technicians assigned to this center yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {techs.map((t) => (
                  <div
                    key={t._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          background: '#e0e7ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#4338ca',
                          fontSize: '0.75rem',
                        }}
                      >
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.phone}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StatusBadge status={t.role} type="role" />
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: t.isActive ? '#dcfce7' : '#fee2e2',
                          color: t.isActive ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(shop);
            }}
            className="btn btn-primary"
          >
            Edit Center Profile
          </button>
        </div>
      </div>
    </div>
  );
};
