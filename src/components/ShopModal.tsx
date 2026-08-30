import React, { useState, useEffect } from 'react';
import { X, Store, Check } from 'lucide-react';
import type { ShopItem } from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface ShopModalProps {
  shop: ShopItem | null; // null for Create, object for Edit
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedShop: ShopItem) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ shop, isOpen, onClose, onSaved }) => {
  const { addToast, refreshShops } = useAdminAuth();
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [status, setStatus] = useState<'active' | 'expired' | 'canceled'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setOwnerName(shop.ownerName);
      setPhone(shop.phone);
      setStreet(shop.address?.street || '');
      setCity(shop.address?.city || '');
      setState(shop.address?.state || '');
      setPincode(shop.address?.pincode || '');
      setPlan(shop.subscription.plan);
      setStatus(shop.subscription.status);
    } else {
      setName('');
      setOwnerName('');
      setPhone('');
      setStreet('');
      setCity('');
      setState('');
      setPincode('');
      setPlan('free');
      setStatus('active');
    }
  }, [shop, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ownerName || !phone) {
      addToast('error', 'Shop name, owner name, and phone are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (shop) {
        // Update
        const updated = await adminApi.updateShop(shop._id, {
          name,
          ownerName,
          phone,
          address: { street, city, state, pincode },
        });
        await adminApi.updateShopSubscription(shop._id, { plan, status });
        addToast('success', `Shop "${name}" updated successfully`);
        if (updated) onSaved({ ...shop, ...updated, subscription: { ...shop.subscription, plan, status } });
      } else {
        // Create
        const created = await adminApi.createShop({
          name,
          ownerName,
          phone,
          address: { street, city, state, pincode },
          plan,
        });
        addToast('success', `Shop "${name}" onboarded successfully!`);
        if (created) onSaved(created);
      }
      await refreshShops();
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
            <Store size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>{shop ? 'Edit Shop Profile' : 'Onboard New Repair Shop'}</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Shop Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Metro Mobile Care"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Owner Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Patel"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Mobile Number *</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">City *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Street Address</label>
              <input
                type="text"
                className="input-field"
                placeholder="Shop number, market, road..."
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">State</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Pincode</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 400001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </div>

            {/* Subscription Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Subscription Tier</label>
                <select
                  className="select-field"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                >
                  <option value="free">Free Tier</option>
                  <option value="pro">Pro Subscription (₹999/mo)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Shop Status</label>
                <select
                  className="select-field"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="canceled">Suspended / Canceled</option>
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
              <span>{isSubmitting ? 'Saving...' : shop ? 'Save Changes' : 'Create Shop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
