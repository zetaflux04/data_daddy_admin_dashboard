import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  User,
  Phone,
  IndianRupee,
  Wrench,
  AlertTriangle,
  Send,
  CreditCard,
  Store,
  ShoppingBag,
  Camera,
  Maximize2,
} from 'lucide-react';
import type { OrderItem, JobStatus, DeviceType } from '../types/admin';
import { StatusBadge } from './StatusBadge';
import { adminApi, resolveImageUrl } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface OrderInspectorModalProps {
  order: OrderItem | null;
  onClose: () => void;
  onOrderUpdated: (updated: OrderItem) => void;
}

export const OrderInspectorModal: React.FC<OrderInspectorModalProps> = ({
  order,
  onClose,
  onOrderUpdated,
}) => {
  const { addToast } = useAdminAuth();
  const [currentOrder, setCurrentOrder] = useState<OrderItem | null>(order);
  const [availableTechs, setAvailableTechs] = useState<any[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMode, setPayMode] = useState<'cash' | 'upi' | 'card' | 'online'>('upi');
  const [payRef, setPayRef] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentOrder(order);
    if (order) {
      // Fetch detailed order and shop technicians
      adminApi.getOrderById(order._id).then((res) => {
        if (res?.availableTechnicians) {
          setAvailableTechs(res.availableTechnicians);
        }
        if (res?.order) {
          setCurrentOrder(res.order);
          const techId = typeof res.order.assignedTechnicianId === 'object'
            ? res.order.assignedTechnicianId?._id
            : res.order.assignedTechnicianId;
          setSelectedTechId(techId || '');
        }
      });
    }
  }, [order]);

  if (!currentOrder) return null;

  const isAccessory = (currentOrder.orderType || 'repair') === 'accessory';

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'laptop': return <Laptop size={18} />;
      case 'tablet': return <Tablet size={18} />;
      case 'smartwatch': return <Watch size={18} />;
      default: return <Smartphone size={18} />;
    }
  };

  const getHeaderIcon = () => {
    if (isAccessory) {
      return <ShoppingBag size={18} />;
    }
    return getDeviceIcon(currentOrder.deviceType);
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await adminApi.updateOrderStatus(currentOrder._id, newStatus);
      if (updated) {
        setCurrentOrder(updated);
        onOrderUpdated(updated);
        addToast('success', `Status updated to ${newStatus.replace('_', ' ')}`);
      }
    } catch (e: any) {
      addToast('error', e.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignTech = async () => {
    setIsAssigning(true);
    try {
      const updated = await adminApi.assignTechnician(currentOrder._id, selectedTechId);
      if (updated) {
        setCurrentOrder(updated);
        onOrderUpdated(updated);
        addToast('success', 'Technician reassigned successfully');
      }
    } catch (e: any) {
      addToast('error', e.message || 'Failed to reassign technician');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      addToast('error', 'Enter a valid payment amount');
      return;
    }

    setIsRecordingPayment(true);
    try {
      const updated = await adminApi.addPayment(currentOrder._id, {
        amount: amt,
        mode: payMode,
        transactionRef: payRef,
      });
      if (updated) {
        setCurrentOrder(updated);
        onOrderUpdated(updated);
        addToast('success', `Payment of ₹${amt} recorded!`);
        setShowPaymentForm(false);
        setPayAmount('');
        setPayRef('');
      }
    } catch (e: any) {
      addToast('error', e.message || 'Failed to record payment');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const shopName = typeof currentOrder.shopId === 'object'
    ? currentOrder.shopId?.name
    : 'Repair Shop';

  const shopCity = typeof currentOrder.shopId === 'object'
    ? currentOrder.shopId?.address?.city
    : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              background: isAccessory ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)',
              color: isAccessory ? '#a855f7' : 'var(--accent-primary)',
            }}>
              {getHeaderIcon()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentOrder.jobId}</h3>
                <StatusBadge status={currentOrder.status} />
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: isAccessory ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: isAccessory ? '#a855f7' : '#3b82f6',
                    border: `1px solid ${isAccessory ? 'rgba(168, 85, 247, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                  }}
                >
                  {isAccessory ? '🛒 Accessory' : '🔧 Repair'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Store size={12} />
                <span>{shopName} {shopCity ? `(${shopCity})` : ''}</span>
                <span>•</span>
                <span>Created {new Date(currentOrder.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* CUSTOMER ISSUE PROMINENT CALLOUT — only for repairs */}
          {!isAccessory && currentOrder.problemDescription && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderLeft: '5px solid var(--accent-amber)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <AlertTriangle size={16} color="var(--accent-amber)" />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#fef3c7',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  Customer Reported Issue / Fault
                </span>
              </div>
              <p style={{
                fontSize: '0.9375rem',
                color: '#fffbeb',
                lineHeight: 1.5,
                fontWeight: 500,
              }}>
                "{currentOrder.problemDescription}"
              </p>
            </div>
          )}

          {/* Accessory Product Callout */}
          {isAccessory && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              borderLeft: '5px solid #a855f7',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <ShoppingBag size={16} color="#a855f7" />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#e9d5ff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  Accessory Sold
                </span>
              </div>
              <p style={{
                fontSize: '1.125rem',
                color: '#f3e8ff',
                lineHeight: 1.5,
                fontWeight: 700,
              }}>
                {currentOrder.productName || 'Unnamed Product'}
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: '#d8b4fe',
                fontWeight: 600,
                marginTop: '0.25rem',
              }}>
                Selling Price: ₹{(currentOrder.productPrice || 0).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {/* Grid: Customer Info & Device/Product Specs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            
            {/* Customer Details Box */}
            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <User size={16} color="var(--accent-cyan)" />
                <h4 style={{ fontSize: '0.875rem' }}>Customer Information</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {currentOrder.customerSnapshot.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                  <a
                    href={`tel:${currentOrder.customerSnapshot.phone}`}
                    style={{
                      color: 'var(--accent-cyan)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Phone size={12} />
                    {currentOrder.customerSnapshot.phone}
                  </a>
                </div>
                {currentOrder.invoice?.invoiceNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Invoice No:</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {currentOrder.invoice.invoiceNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Device Details Box (only for repairs) OR Product Details (for accessories) */}
            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {isAccessory ? (
                  <>
                    <ShoppingBag size={16} color="#a855f7" />
                    <h4 style={{ fontSize: '0.875rem' }}>Product Details</h4>
                  </>
                ) : (
                  <>
                    <Wrench size={16} color="var(--accent-primary)" />
                    <h4 style={{ fontSize: '0.875rem' }}>Device Specifications</h4>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                {isAccessory ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Product:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {currentOrder.productName || 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Price:</span>
                      <span style={{ fontWeight: 700, color: '#a855f7' }}>
                        ₹{(currentOrder.productPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Accessory Sale
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Model:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {currentOrder.brand} {currentOrder.model}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                        {currentOrder.deviceType}
                      </span>
                    </div>
                    {currentOrder.serialOrImei && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Serial / IMEI:</span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          {currentOrder.serialOrImei}
                        </span>
                      </div>
                    )}
                    {currentOrder.passcodePattern && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Passcode:</span>
                        <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                          {currentOrder.passcodePattern}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Device Photos Gallery (for repair orders) */}
          {!isAccessory && currentOrder.photos && currentOrder.photos.length > 0 && (
            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '0.875rem' }}>Uploaded Product Photos ({currentOrder.photos.length})</h4>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click photo to enlarge</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {currentOrder.photos.map((photoUrl, idx) => {
                  const resolvedUrl = resolveImageUrl(photoUrl) || photoUrl;
                  return (
                    <div
                      key={idx}
                      onClick={() => setPreviewImage(resolvedUrl)}
                      style={{
                        position: 'relative',
                        width: '100px',
                        height: '100px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '1px solid var(--border-medium)',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        transition: 'transform 0.15s ease',
                      }}
                      className="photo-thumb-hover"
                    >
                      <img
                        src={resolvedUrl}
                        alt={`Device photo ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          color: '#fff',
                        }}
                      >
                        <Maximize2 size={10} />
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          borderRadius: '4px',
                          padding: '1px 5px',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        #{idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions: 1-Click Status Pipeline */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Update Pipeline Status
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(['pending', 'in_progress', 'parts_delayed', 'repaired', 'delivered', 'canceled'] as JobStatus[]).map((st) => (
                <button
                  key={st}
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className={`btn btn-sm ${currentOrder.status === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                    opacity: isUpdatingStatus ? 0.6 : 1,
                  }}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Technician Assignment — only for repairs */}
          {!isAccessory && (
            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Assign Technician for {shopName}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="select-field"
                  style={{ flex: 1 }}
                >
                  <option value="">-- Unassigned --</option>
                  {availableTechs.map((tech) => (
                    <option key={tech._id} value={tech._id}>
                      👨‍🔧 {tech.name} ({tech.phone}) - {tech.role}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignTech}
                  disabled={isAssigning}
                  className="btn btn-secondary btn-sm"
                >
                  {isAssigning ? 'Assigning...' : 'Update Assignment'}
                </button>
              </div>
            </div>
          )}

          {/* Financials & Quick Payment Recorder */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IndianRupee size={18} color="var(--accent-emerald)" />
                <h4 style={{ fontSize: '0.9375rem' }}>Billing & Payments</h4>
              </div>
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="btn btn-primary btn-sm"
              >
                <CreditCard size={14} />
                <span>{showPaymentForm ? 'Cancel' : '+ Record Payment'}</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>ESTIMATED</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{currentOrder.cost.estimated}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>FINAL BILL</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{currentOrder.cost.final}</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '0.6875rem', color: '#6ee7b7' }}>COLLECTED</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>₹{currentOrder.cost.advancePaid}</div>
              </div>
              <div style={{ background: currentOrder.cost.due > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: currentOrder.cost.due > 0 ? '1px solid rgba(244, 63, 94, 0.2)' : 'none' }}>
                <div style={{ fontSize: '0.6875rem', color: currentOrder.cost.due > 0 ? '#fda4af' : 'var(--text-muted)' }}>PENDING DUE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: currentOrder.cost.due > 0 ? '#f43f5e' : 'var(--text-muted)' }}>₹{currentOrder.cost.due}</div>
              </div>
            </div>

            {/* Quick Payment Drawer */}
            {showPaymentForm && (
              <form onSubmit={handleRecordPayment} style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Amount (₹)</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="e.g. 500"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Mode</label>
                    <select
                      className="select-field"
                      value={payMode}
                      onChange={(e) => setPayMode(e.target.value as any)}
                    >
                      <option value="upi">UPI (GPay/PhonePe)</option>
                      <option value="cash">Cash</option>
                      <option value="card">Debit/Credit Card</option>
                      <option value="online">Online / Netbanking</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Txn Reference</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Optional reference"
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={isRecordingPayment} className="btn btn-success">
                    {isRecordingPayment ? 'Saving...' : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            )}

            {/* Past Payments History */}
            {currentOrder.payments && currentOrder.payments.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Payment Records:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {currentOrder.payments.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                      <span>₹{p.amount} via <strong>{p.mode.toUpperCase()}</strong> {p.transactionRef ? `(${p.transactionRef})` : ''}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(p.paidAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SMS Notification Audit Trail */}
          {currentOrder.smsLogs && currentOrder.smsLogs.length > 0 && (
            <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Send size={14} color="var(--accent-cyan)" />
                <span>Fast2SMS Customer Alerts Sent</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {currentOrder.smsLogs.map((sms, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '0.4rem 0.6rem', background: 'rgba(6, 182, 212, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                    <span>Trigger: <strong>{sms.type}</strong> ({sms.status})</span>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(sms.sentAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close Inspector
          </button>
        </div>
      </div>

      {/* Full-Screen Image Lightbox Preview */}
      {previewImage && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1100, backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="btn btn-ghost btn-sm"
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '6px',
              }}
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Device Photo Full View"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
