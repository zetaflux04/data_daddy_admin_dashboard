import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  IconButton,
  Avatar,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

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
      setPlan(shop.subscription?.plan || 'free');
      setStatus(shop.subscription?.status || 'active');
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
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <StoreRoundedIcon sx={{ color: 'primary.main', fontSize: 26 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
            {shop ? 'Edit Shop Profile' : 'Onboard New Repair Shop'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Logo Upload Box */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 2.5,
              bgcolor: 'rgba(0, 82, 255, 0.04)',
              border: '1px dashed rgba(0, 82, 255, 0.3)',
            }}
          >
            <Avatar
              src={logoUrl ? resolveImageUrl(logoUrl) : undefined}
              sx={{
                width: 58,
                height: 58,
                borderRadius: 2.5,
                bgcolor: '#FFFFFF',
                color: 'primary.main',
                border: '1px solid #CBD5E1',
              }}
            >
              <StoreRoundedIcon sx={{ fontSize: 32 }} />
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                Center Logo / Storefront Photo
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                Direct cloud upload to AWS S3
              </Typography>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />

              <Button
                variant="outlined"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
                startIcon={
                  isUploadingLogo ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <CloudUploadRoundedIcon fontSize="small" />
                  )
                }
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                {isUploadingLogo ? 'Uploading S3...' : 'Choose Image'}
              </Button>
            </Box>
          </Box>

          {/* Shop Basic Info */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              fullWidth
              label="Shop Name"
              placeholder="e.g. QuickFix Mobiles"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Owner Full Name"
              placeholder="e.g. Ramesh Kumar"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
          </Box>

          <TextField
            fullWidth
            label="Phone Number"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          {/* Address Fields */}
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', mt: 1 }}>
            Location & Address
          </Typography>

          <TextField
            fullWidth
            label="Street Address"
            placeholder="Shop 12, Main Market"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
            <TextField
              label="City"
              placeholder="Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <TextField
              label="State"
              placeholder="Maharashtra"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <TextField
              label="Pincode"
              placeholder="400001"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </Box>

          {/* Subscription Settings */}
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', mt: 1 }}>
            Plan & Status
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <FormControl fullWidth size="small">
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5 }}>Subscription Plan</Typography>
              <Select
                value={plan}
                onChange={(e) => setPlan(e.target.value as any)}
              >
                <MenuItem value="free">🌱 Free Tier</MenuItem>
                <MenuItem value="pro">⭐ Pro Plan</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5 }}>Account Status</Typography>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <MenuItem value="active">🟢 Active</MenuItem>
                <MenuItem value="expired">🟡 Expired</MenuItem>
                <MenuItem value="canceled">🔴 Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="outlined" onClick={onClose} sx={{ color: '#475569', borderColor: '#CBD5E1' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <CheckRoundedIcon fontSize="small" />}
          >
            {isSubmitting ? 'Saving...' : shop ? 'Save Changes' : 'Register Shop'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
export default ShopModal;
