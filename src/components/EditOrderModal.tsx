import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Check, ShoppingBag } from 'lucide-react';
import type { OrderItem, JobStatus, DeviceType, TechnicianItem } from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface EditOrderModalProps {
  order: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (saved: OrderItem) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { addToast } = useAdminAuth();
  // Repair fields
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');
  const [problemDescription, setProblemDescription] = useState('');
  // Accessory fields
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState<number>(0);
  // Common fields
  const [status, setStatus] = useState<JobStatus>('pending');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [finalCost, setFinalCost] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>('');
  const [technicians, setTechnicians] = useState<TechnicianItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setBrand(order.brand || '');
      setModel(order.model || '');
      setDeviceType(order.deviceType || 'mobile');
      setProblemDescription(order.problemDescription || '');
      setProductName(order.productName || '');
      setProductPrice(order.productPrice || 0);
      setStatus(order.status);
      setEstimatedCost(order.cost?.estimated || 0);
      setFinalCost(order.cost?.final || 0);
      setAdvancePaid(order.cost?.advancePaid || 0);
      const techId = typeof order.assignedTechnicianId === 'object' ? order.assignedTechnicianId?._id : order.assignedTechnicianId;
      setAssignedTechnicianId(techId || '');

      const sId = typeof order.shopId === 'object' ? order.shopId?._id : order.shopId;
      if (sId) {
        adminApi
          .getTechnicians({ shopId: sId })
          .then((res) => setTechnicians(res.technicians || []))
          .catch(() => setTechnicians([]));
      }
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const isAccessory = (order.orderType || 'repair') === 'accessory';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAccessory) {
      if (!productName.trim()) {
        addToast('error', 'Product name is required for accessory orders');
        return;
      }
    } else {
      if (!brand || !model || !problemDescription) {
        addToast('error', 'Brand, model, and customer issue description are required');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        status,
        cost: {
          estimated: Number(estimatedCost),
          final: Number(finalCost),
          advancePaid: Number(advancePaid),
        },
      };

      if (isAccessory) {
        payload.productName = productName;
        payload.productPrice = Number(productPrice);
      } else {
        payload.brand = brand;
        payload.model = model;
        payload.deviceType = deviceType;
        payload.problemDescription = problemDescription;
        payload.assignedTechnicianId = assignedTechnicianId || undefined;
      }

      const updated = await adminApi.editOrder(order._id, payload);
      addToast('success', `Order ${order.jobId} updated successfully`);
      onSaved(updated || { ...order, ...payload });
      onClose();
    } catch (e: any) {
      addToast('error', e.message || 'Failed to update order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedDue = Math.max(0, finalCost - advancePaid);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isAccessory ? '#f3e8ff' : '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isAccessory ? '#7c3aed' : '#4338ca',
              }}
            >
              {isAccessory ? <ShoppingBag size={20} /> : <ClipboardList size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Edit {isAccessory ? 'Accessory' : 'Order'}: {order.jobId}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Customer: {order.customerSnapshot.name} ({order.customerSnapshot.phone})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.35rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Repair-specific fields */}
            {!isAccessory && (
              <>
                {/* Device Spec Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Device Type</label>
                    <select
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                      className="select-field"
                    >
                      <option value="mobile">Smartphone</option>
                      <option value="laptop">Laptop</option>
                      <option value="tablet">Tablet</option>
                      <option value="watch">Smartwatch</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Brand</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Apple, Samsung"
                      required
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Model Number</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="input-field"
                      placeholder="e.g. iPhone 14 Pro"
                      required
                    />
                  </div>
                </div>

                {/* Customer Problem Description / Issue */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ color: '#b45309', fontWeight: 700 }}>
                    ⚠️ Customer Reported Issue / Problem
                  </label>
                  <textarea
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    className="textarea-field"
                    rows={3}
                    style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}
                    placeholder="Describe the exact fault reported by customer..."
                    required
                  />
                </div>
              </>
            )}

            {/* Accessory-specific fields */}
            {isAccessory && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ color: '#7c3aed', fontWeight: 700 }}>
                    🛒 Product / Accessory Name
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Tempered Glass, Phone Cover"
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(Number(e.target.value))}
                    className="input-field"
                    min={0}
                  />
                </div>
              </div>
            )}

            {/* Status & Technician */}
            <div style={{ display: 'grid', gridTemplateColumns: isAccessory ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as JobStatus)}
                  className="select-field"
                >
                  <option value="pending">🟡 Pending Diagnosis</option>
                  <option value="in_progress">🔵 In Progress</option>
                  <option value="parts_delayed">🔴 Parts Delayed</option>
                  <option value="repaired">🟢 Repaired / Ready</option>
                  <option value="delivered">✅ Delivered & Closed</option>
                  <option value="canceled">⚪ Canceled</option>
                </select>
              </div>

              {!isAccessory && (
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Assigned Technician</label>
                  <select
                    value={assignedTechnicianId}
                    onChange={(e) => setAssignedTechnicianId(e.target.value)}
                    className="select-field"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((t) => (
                      <option key={t._id} value={t._id}>
                        👨‍🔧 {t.name} ({t.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Cost & Payment Details */}
            <div
              style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Financial Breakdown (₹)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Estimated (₹)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="input-field"
                    min={0}
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Final Cost (₹)</label>
                  <input
                    type="number"
                    value={finalCost}
                    onChange={(e) => setFinalCost(Number(e.target.value))}
                    className="input-field"
                    min={0}
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(Number(e.target.value))}
                    className="input-field"
                    min={0}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '0.75rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px dashed var(--border-medium)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: calculatedDue > 0 ? '#b91c1c' : '#15803d',
                }}
              >
                Remaining Due Balance: ₹{calculatedDue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Check size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
