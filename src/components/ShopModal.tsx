import React, { useState, useEffect, useRef } from 'react';
import { X, Store, Check, UploadCloud, Loader2 } from 'lucide-react';
import type { ShopItem } from '../types/admin';
import { adminApi, resolveImageUrl } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface ShopModalProps {
  shop: ShopItem | null; // null for Create, object for Edit
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedShop: ShopItem) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ shop, isOpen, onClose, onSaved }) => {
  const { addToast, refreshShops } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [status, setStatus] = useState<'active' | 'expired' | 'canceled'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setOwnerName(shop.ownerName);
      setPhone(shop.phone);
      setLogoUrl(shop.logoUrl || '');
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
      setLogoUrl('');
      setStreet('');
      setCity('');
      setState('');
      setPincode('');
      setPlan('free');
      setStatus('active');
    }
  }, [shop, isOpen]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const res = await adminApi.uploadImage(file, 'shops');
      if (res.url) {
        setLogoUrl(res.url);
        addToast('success', 'Shop logo uploaded to AWS S3!');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to upload logo to AWS S3');
    } finally {
      setIsUploadingLogo(false);
    }
  };

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
          logoUrl,
          address: { street, city, state, pincode },
        });
        await adminApi.updateShopSubscription(shop._id, { plan, status });
        addToast('success', `Shop "${name}" updated successfully`);
        if (updated) onSaved({ ...shop, ...updated, logoUrl, subscription: { ...shop.subscription, plan, status } });
      } else {
        // Create
        const created = await adminApi.createShop({
          name,
          ownerName,
          phone,
          logoUrl,
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
            {/* Shop Logo & S3 Cloud Upload */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem',
                backgroundColor: 'rgba(79, 70, 229, 0.04)',
                border: '1px dashed rgba(79, 70, 229, 0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {logoUrl ? (
                  <img
                    src={resolveImageUrl(logoUrl)}
                    alt="Shop Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Store size={26} color="var(--accent-primary)" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Shop Logo / Profile Photo (AWS S3)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Stored securely in Amazon S3 storage
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={isUploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    {isUploadingLogo ? (
                      <Loader2 size={13} className="spin" />
                    ) : (
                      <UploadCloud size={13} />
                    )}
                    <span>{isUploadingLogo ? 'Uploading to S3...' : 'Upload Logo'}</span>
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setLogoUrl('')}
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', color: 'var(--accent-rose)' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

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
