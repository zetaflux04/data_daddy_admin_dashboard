import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

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
      const newNotif = await adminApi.createNotification({
        title: title.trim(),
        message: message.trim(),
        type: targetType,
        targetShopId: targetType === 'direct' ? selectedShopId : undefined,
        priority,
      });

      addToast(
        'success',
        targetType === 'broadcast'
          ? 'Broadcast notification broadcasted to all repair centers!'
          : 'Private notification dispatched to target shop!'
      );

      setTitle('');
      setMessage('');
      if (newNotif) {
        setNotifications((prev) => [newNotif, ...prev]);
      } else {
        fetchNotifications();
      }
    } catch (e: any) {
      addToast('error', e.message || 'Failed to dispatch notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteNotification(id);
      addToast('success', 'Notification revoked from records');
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (e: any) {
      addToast('error', 'Failed to delete notification');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Notification Broadcast & Center Messaging
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Publish platform announcements, compliance notices, fee updates, or targeted private alerts to specific shops.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '420px 1fr' }, gap: 3.5 }}>
        {/* Form Card */}
        <Card sx={{ p: 1, borderRadius: 3, height: 'fit-content' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CampaignRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                Dispatch Notification
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Target Audience Selector */}
              <Box>
                <FormLabel sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                  Target Audience
                </FormLabel>
                <RadioGroup
                  row
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                >
                  <FormControlLabel
                    value="broadcast"
                    control={<Radio size="small" />}
                    label={<Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>All Centers (Global)</Typography>}
                  />
                  <FormControlLabel
                    value="direct"
                    control={<Radio size="small" />}
                    label={<Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Direct to Shop</Typography>}
                  />
                </RadioGroup>
              </Box>

              {/* Specific Shop Dropdown */}
              {targetType === 'direct' && (
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                  >
                    {shops.map((shop) => (
                      <MenuItem key={shop._id} value={shop._id}>
                        🏪 {shop.name} {shop.address?.city ? `(${shop.address.city})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Priority Select */}
              <Box>
                <FormLabel sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                  Priority Level
                </FormLabel>
                <FormControl fullWidth size="small">
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <MenuItem value="info">🔵 Informational Announcement</MenuItem>
                    <MenuItem value="warning">🟠 Urgent Alert / Maintenance</MenuItem>
                    <MenuItem value="promo">🟣 Feature Update / Promotion</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Title */}
              <TextField
                fullWidth
                label="Notification Subject"
                placeholder="e.g. Scheduled Cloud Maintenance Tonight"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              {/* Message */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Announcement Message"
                placeholder="Compose clear instructions for shop technicians and center managers..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={sending}
                startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon fontSize="small" />}
                sx={{ py: 1.2, mt: 1 }}
              >
                {sending ? 'Dispatching Message...' : 'Broadcast Notification'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* History List Card */}
        <Card sx={{ p: 1, borderRadius: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsRoundedIcon sx={{ color: 'secondary.main', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                  Dispatched Announcements Log
                </Typography>
              </Box>
              <Chip
                label={`${notifications.length} logged`}
                size="small"
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                  Loading announcement log...
                </Typography>
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <Typography variant="body2">No broadcast messages yet. Use the form to send announcements.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {notifications.map((notif) => {
                  const targetShop = shops.find((s) => s._id === notif.targetShopId);

                  const priorityStyles = {
                    info: {
                      icon: <InfoRoundedIcon sx={{ fontSize: 16 }} />,
                      color: '#0052FF',
                      bg: 'rgba(0, 82, 255, 0.08)',
                    },
                    warning: {
                      icon: <WarningAmberRoundedIcon sx={{ fontSize: 16 }} />,
                      color: '#D97706',
                      bg: 'rgba(245, 158, 11, 0.1)',
                    },
                    promo: {
                      icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />,
                      color: '#7C3AED',
                      bg: 'rgba(124, 58, 237, 0.1)',
                    },
                  };

                  const pStyle = priorityStyles[notif.priority] || priorityStyles.info;

                  return (
                    <Box
                      key={notif._id}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.25,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            icon={pStyle.icon}
                            label={notif.priority.toUpperCase()}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.65rem',
                              bgcolor: pStyle.bg,
                              color: pStyle.color,
                              borderRadius: 1.5,
                            }}
                          />

                          <Chip
                            label={
                              notif.type === 'broadcast'
                                ? '🌐 All Shops'
                                : `🏪 ${targetShop?.name || 'Direct Shop'}`
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              borderRadius: 1.5,
                            }}
                          />
                        </Box>

                        <Tooltip title="Delete Announcement">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(notif._id)}
                            sx={{
                              color: 'error.main',
                              bgcolor: 'rgba(239, 68, 68, 0.08)',
                              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.16)' },
                            }}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                        {notif.title}
                      </Typography>

                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.45 }}>
                        {notif.message}
                      </Typography>

                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
export default NotificationPage;
