import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';

import type { ShopItem, TechnicianItem } from '../types/admin';
import { StatusBadge } from './StatusBadge';
import { adminApi, resolveImageUrl } from '../services/adminApi';

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
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={shop.logoUrl ? resolveImageUrl(shop.logoUrl) : undefined}
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2.5,
              bgcolor: 'primary.main',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.1rem',
              border: '1px solid #CBD5E1',
            }}
          >
            {shop.name.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
                {shop.name}
              </Typography>
              <StatusBadge status={shop.subscription?.plan || 'free'} type="plan" />
              <Chip
                label={shop.subscription?.status || 'active'}
                size="small"
                color={shop.subscription?.status === 'active' ? 'success' : 'default'}
                sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', borderRadius: 1.5 }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Registered Repair Center • ID: {shop._id.slice(-8).toUpperCase()}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* KPI Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1.5,
          }}
        >
          <Paper sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 0.5 }}>
              <CurrencyRupeeRoundedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Total Revenue</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
              ₹{(shop.stats?.totalRevenue || 0).toLocaleString()}
            </Typography>
          </Paper>

          <Paper sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 0.5 }}>
              <ReceiptLongRoundedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Total Orders</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
              {shop.stats?.totalOrders || 0}
            </Typography>
          </Paper>

          <Paper sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 0.5 }}>
              <BuildRoundedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Technicians</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {shop.stats?.totalStaff || 0}
            </Typography>
          </Paper>

          <Paper sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 0.5 }}>
              <PeopleAltRoundedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Customers</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
              {shop.stats?.totalCustomers || 0}
            </Typography>
          </Paper>
        </Box>

        {/* Center Details & Address */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2.5 }}>
          <Paper sx={{ p: 2, borderRadius: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              Proprietor / Contact
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {shop.ownerName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneRoundedIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.dark' }}>
                  {shop.phone}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
              Service Location
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <LocationOnRoundedIcon sx={{ fontSize: 18, color: 'error.main', mt: 0.2 }} />
              <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.4 }}>
                {shop.address?.street ? `${shop.address.street}, ` : ''}
                {shop.address?.city || 'City not specified'}
                {shop.address?.state ? `, ${shop.address.state}` : ''}
                {shop.address?.pincode ? ` - ${shop.address.pincode}` : ''}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Staff & Technicians Roster */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Staff & Technicians Roster ({techs.length})
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onAddTechnician(shop._id)}
              startIcon={<PersonAddRoundedIcon fontSize="small" />}
              sx={{ fontSize: '0.75rem', py: 0.4 }}
            >
              + Add Staff
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : techs.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: '#F8FAFC' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No technicians registered for this center yet.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {techs.map((t) => (
                <Paper
                  key={t._id}
                  sx={{
                    p: 1.5,
                    px: 2,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: 'rgba(0, 82, 255, 0.1)',
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {t.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {t.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        📞 {t.phone}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusBadge status={t.role} type="role" />
                    <Chip
                      label={t.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={t.isActive ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', fontWeight: 700, borderRadius: 1.5 }}
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button variant="outlined" onClick={onClose} sx={{ color: '#475569', borderColor: '#CBD5E1' }}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => onEdit(shop)}
          startIcon={<EditRoundedIcon fontSize="small" />}
        >
          Edit Center Profile
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ShopDetailsModal;
