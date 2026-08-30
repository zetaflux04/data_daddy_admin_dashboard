import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Trash2,
  AlertTriangle,
  Info,
  Sparkles,
  Store,
  Globe,
  Clock,
  Radio,
} from 'lucide-react';
import type { NotificationItem } from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const NotificationPage: React.FC = () => {
  const { shops, addToast } = useAdminAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'broadcast' | 'direct'>('broadcast');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [priority, setPriority] = useState<'info' | 'warning' | 'promo'>('info');
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNotifications();
      setNotifications(res.notifications || []);
    } catch (e: any) {
      addToast('error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (shops.length > 0 && !selectedShopId) {
      setSelectedShopId(shops[0]._id);
    }
  }, [shops]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      addToast('error', 'Title and message are required');
      return;
    }

    if (targetType === 'direct' && !selectedShopId) {
      addToast('error', 'Please select a target shop');
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        type: targetType,
        targetShopId: targetType === 'direct' ? selectedShopId : undefined,
        priority,
      };

      const newNotif = await adminApi.createNotification(payload);
      addToast(
        'success',
        targetType === 'broadcast'
          ? 'Broadcast notification published to all shop owners & mobile app!'
          : 'Direct notification dispatched to selected center!'
      );
      setNotifications([newNotif, ...notifications]);

      // Reset form
      setTitle('');
      setMessage('');
    } catch (e: any) {
      addToast('error', e.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await adminApi.deleteNotification(id);
      setNotifications(notifications.filter((n) => n._id !== id));
      addToast('success', 'Notification removed');
    } catch (e: any) {
      addToast('error', 'Failed to delete notification');
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Title Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Notification & Broadcast Center</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Broadcast real-time announcements to every shop owner or dispatch private alerts to an individual repair center. All notifications sync directly with the mobile app.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Radio size={12} color="#2563eb" />
            <span>Mobile App Push Enabled</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.75rem' }}>
        {/* Left Column: Composer */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4338ca',
              }}
            >
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Compose New Notification</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target all shop owners or select a single shop
              </p>
            </div>
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Target Audience Selector */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Target Audience</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setTargetType('broadcast')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: targetType === 'broadcast' ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                    backgroundColor: targetType === 'broadcast' ? '#e0e7ff' : '#ffffff',
                    color: targetType === 'broadcast' ? '#4338ca' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                  }}
                >
                  <Globe size={15} />
                  <span>All Shop Owners</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('direct')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: targetType === 'direct' ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                    backgroundColor: targetType === 'direct' ? '#e0e7ff' : '#ffffff',
                    color: targetType === 'direct' ? '#4338ca' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                  }}
                >
                  <Store size={15} />
                  <span>Particular Shop</span>
                </button>
              </div>

              {targetType === 'direct' && (
                <div style={{ marginTop: '0.25rem' }}>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Select Destination Center</label>
                  <select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    className="select-field"
                    required
                  >
                    {shops.map((s) => (
                      <option key={s._id} value={s._id}>
                        🏪 {s.name} ({s.address?.city || 'India'}) - {s.ownerName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Notification Title */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Notification Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="e.g. 📢 Diwali Spare Parts Discount Available"
                required
              />
            </div>

            {/* Priority Picker */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Priority / Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPriority('info')}
                  style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-md)',
                    border: priority === 'info' ? '2px solid #2563eb' : '1px solid var(--border-subtle)',
                    backgroundColor: priority === 'info' ? '#eff6ff' : '#ffffff',
                    color: priority === 'info' ? '#1d4ed8' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Info size={13} />
                  <span>General Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPriority('warning')}
                  style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-md)',
                    border: priority === 'warning' ? '2px solid #d97706' : '1px solid var(--border-subtle)',
                    backgroundColor: priority === 'warning' ? '#fffbeb' : '#ffffff',
                    color: priority === 'warning' ? '#b45309' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <AlertTriangle size={13} />
                  <span>Urgent / Alert</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPriority('promo')}
                  style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-md)',
                    border: priority === 'promo' ? '2px solid #059669' : '1px solid var(--border-subtle)',
                    backgroundColor: priority === 'promo' ? '#ecfdf5' : '#ffffff',
                    color: priority === 'promo' ? '#047857' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Sparkles size={13} />
                  <span>Promotion</span>
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="textarea-field"
                rows={4}
                placeholder="Write your announcement or notice here. This will be seen immediately on shop owners' mobile screens."
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            >
              <Send size={16} />
              <span>{sending ? 'Dispatching to App...' : 'Dispatch Notification'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: History */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b45309',
                }}
              >
                <Bell size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Dispatched Notifications ({notifications.length})
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Active notifications shown across mobile devices
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading notification logs...
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                border: '1px dashed var(--border-medium)',
                color: 'var(--text-muted)',
              }}
            >
              <Bell size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 600 }}>No notifications dispatched yet.</p>
              <p style={{ fontSize: '0.8125rem' }}>
                Use the composer on the left to send announcements to your repair centers.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {notifications.map((item) => {
                const isBroadcast = item.type === 'broadcast';
                const targetShopName =
                  typeof item.targetShopId === 'object'
                    ? item.targetShopId?.name
                    : 'Designated Center';

                const priorityStyles =
                  item.priority === 'warning'
                    ? { bg: '#fee2e2', border: '#fecaca', text: '#b91c1c', label: 'Urgent' }
                    : item.priority === 'promo'
                    ? { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', label: 'Promo' }
                    : { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'Info' };

                return (
                  <div
                    key={item._id}
                    style={{
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {/* Target badge */}
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isBroadcast ? '#f3e8ff' : '#e0e7ff',
                            color: isBroadcast ? '#7e22ce' : '#4338ca',
                            border: `1px solid ${isBroadcast ? '#d8b4fe' : '#c7d2fe'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          {isBroadcast ? <Globe size={11} /> : <Store size={11} />}
                          <span>{isBroadcast ? 'All Shops (Broadcast)' : targetShopName}</span>
                        </span>

                        {/* Priority Pill */}
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: priorityStyles.bg,
                            color: priorityStyles.text,
                            border: `1px solid ${priorityStyles.border}`,
                          }}
                        >
                          {priorityStyles.label}
                        </span>

                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Clock size={12} />
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="btn btn-ghost btn-sm"
                        title="Delete notification"
                        style={{ color: '#ef4444', padding: '0.25rem' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.title}
                    </h4>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {item.message}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
