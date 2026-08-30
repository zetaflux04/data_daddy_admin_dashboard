import React, { useState, useEffect } from 'react';
import { X, Users2, Check } from 'lucide-react';
import type { TechnicianItem, UserRole } from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface TechnicianModalProps {
  technician: TechnicianItem | null;
  defaultShopId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (saved: TechnicianItem) => void;
}

export const TechnicianModal: React.FC<TechnicianModalProps> = ({
  technician,
  defaultShopId,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { shops, addToast } = useAdminAuth();
  const [shopId, setShopId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('technician');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (technician) {
      const sid = typeof technician.shopId === 'object' ? technician.shopId?._id : technician.shopId;
      setShopId(sid || '');
      setName(technician.name);
      setPhone(technician.phone);
      setRole(technician.role);
      setIsActive(technician.isActive);
    } else {
      setShopId(defaultShopId || shops[0]?._id || '');
      setName('');
      setPhone('');
      setRole('technician');
      setIsActive(true);
    }
  }, [technician, defaultShopId, isOpen, shops]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !shopId) {
      addToast('error', 'Shop, name, and phone number are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (technician) {
        const updated = await adminApi.updateTechnician(technician._id, {
          name,
          phone,
          role,
          isActive,
        });
        if (updated) onSaved(updated);
        addToast('success', `Staff member ${name} updated successfully`);
      } else {
        const created = await adminApi.createTechnician({
          shopId,
          name,
          phone,
          role,
        });
        if (created) onSaved(created);
        addToast('success', `Technician ${name} assigned to shop!`);
      }
      onClose();
    } catch (e: any) {
      addToast('error', e.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users2 size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>
              {technician ? 'Edit Technician / Staff' : 'Add Technician to Shop'}
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Associated Shop *</label>
              <select
                className="select-field"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                disabled={!!technician}
                required
              >
                <option value="">Select Shop</option>
                {shops.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.address?.city || 'India'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Deshmukh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number *</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Role</label>
                <select
                  className="select-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="technician">Technician (Repairs & Hardware)</option>
                  <option value="staff">Front Desk Staff (Intake & Billing)</option>
                  <option value="owner">Shop Owner / Manager</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Account Status</label>
                <select
                  className="select-field"
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                >
                  <option value="active">Active (Can accept jobs)</option>
                  <option value="inactive">Inactive / On Leave</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <Check size={16} />
              <span>{isSubmitting ? 'Saving...' : technician ? 'Save Changes' : 'Add Technician'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
