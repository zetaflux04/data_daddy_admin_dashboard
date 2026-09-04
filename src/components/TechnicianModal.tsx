import React, { useState, useEffect } from 'react';
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
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import type { TechnicianItem, UserRole } from '../types/admin';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface TechnicianModalProps {
  technician: TechnicianItem | null;
  shopId?: string;
  defaultShopId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (saved: TechnicianItem) => void;
}

export const TechnicianModal: React.FC<TechnicianModalProps> = ({
  technician,
  shopId: propShopId,
  defaultShopId,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { shops, addToast } = useAdminAuth();
  const [selectedShopId, setSelectedShopId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('technician');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (technician) {
      const sid = typeof technician.shopId === 'object' ? technician.shopId?._id : technician.shopId;
      setSelectedShopId(sid || '');
      setName(technician.name);
      setPhone(technician.phone);
      setRole(technician.role);
      setIsActive(technician.isActive);
    } else {
      setSelectedShopId(propShopId || defaultShopId || shops[0]?._id || '');
      setName('');
      setPhone('');
      setRole('technician');
      setIsActive(true);
    }
  }, [technician, propShopId, defaultShopId, isOpen, shops]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !selectedShopId) {
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
          shopId: selectedShopId,
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
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <PeopleAltRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
            {technician ? 'Edit Technician / Staff' : 'Add Technician to Center'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Associated Shop */}
          <FormControl fullWidth size="small">
            <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5 }}>Associated Repair Center *</Typography>
            <Select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              disabled={!!technician}
              required
            >
              {shops.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  🏪 {s.name} {s.address?.city ? `(${s.address.city})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Name & Phone */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              placeholder="e.g. Ramesh Deshmukh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Phone Number"
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </Box>

          {/* Role & Status */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <FormControl fullWidth size="small">
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5 }}>Staff Role</Typography>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <MenuItem value="technician">Technician (Repairs & Hardware)</MenuItem>
                <MenuItem value="staff">Front Desk Staff (Intake & Billing)</MenuItem>
                <MenuItem value="owner">Shop Owner / Manager</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5 }}>Status</Typography>
              <Select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
              >
                <MenuItem value="active">🟢 Active (Accepts Jobs)</MenuItem>
                <MenuItem value="inactive">⚪ Inactive / On Leave</MenuItem>
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
            {isSubmitting ? 'Saving...' : technician ? 'Save Changes' : 'Assign Technician'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
export default TechnicianModal;
