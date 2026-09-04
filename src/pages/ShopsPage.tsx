import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddBusinessRoundedIcon from '@mui/icons-material/AddBusinessRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import type { ShopItem } from '../types/admin';
import { ShopModal } from '../components/ShopModal';
import { ShopDetailsModal } from '../components/ShopDetailsModal';
import { TechnicianModal } from '../components/TechnicianModal';
import { adminApi, resolveImageUrl } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const ShopsPage: React.FC = () => {
  const { addToast } = useAdminAuth();
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals state
  const [selectedShop, setSelectedShop] = useState<ShopItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [detailsShop, setDetailsShop] = useState<ShopItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [targetShopIdForTech, setTargetShopIdForTech] = useState<string>('');
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getShops({
        search: search.trim() || undefined,
        plan: planFilter !== 'all' ? planFilter : undefined,
      });
      setShops(res.shops || []);
    } catch (e: any) {
      addToast('error', 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchShops();
  }, [planFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchShops();
  };

  const handleTogglePlan = async (shop: ShopItem) => {
    const nextPlan = shop.subscription.plan === 'pro' ? 'free' : 'pro';
    try {
      await adminApi.updateShopSubscription(shop._id, { plan: nextPlan, status: 'active' });
      addToast('success', `Plan changed to ${nextPlan.toUpperCase()} for ${shop.name}`);
      fetchShops();
    } catch (e: any) {
      addToast('error', 'Failed to update subscription');
    }
  };

  const handleDeleteShop = async (shop: ShopItem) => {
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to delete "${shop.name}"?\n\nThis will permanently remove the repair center, its staff, and associated records.`
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteShop(shop._id);
      addToast('success', `Shop "${shop.name}" removed successfully.`);
      fetchShops();
    } catch (e: any) {
      addToast('error', e.message || 'Failed to delete shop');
    }
  };

  const handleOpenAddTech = (shopId: string) => {
    setTargetShopIdForTech(shopId);
    setIsTechModalOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Registered Repair Centers & Franchises
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage centers across cities, inspect performance, assign technicians, and control subscriptions.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSelectedShop(null);
            setIsEditModalOpen(true);
          }}
          startIcon={<AddBusinessRoundedIcon fontSize="small" />}
        >
          Register New Center
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <TextField
            placeholder="Search by center name, owner, city, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 280 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <MenuItem value="all">All Plans</MenuItem>
                <MenuItem value="pro">⭐ Pro Plan</MenuItem>
                <MenuItem value="free">🌱 Free Tier</MenuItem>
              </Select>
            </FormControl>

            <Button type="submit" variant="outlined" sx={{ color: '#334155', borderColor: '#CBD5E1' }}>
              Search
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Centers Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Center / Shop</TableCell>
                <TableCell>Owner & Contact</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Clients</TableCell>
                <TableCell>Orders</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Subscription Tier</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                      Loading repair centers...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : shops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No repair centers found matching your query.
                  </TableCell>
                </TableRow>
              ) : (
                shops
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((shop) => (
                  <TableRow key={shop._id} hover>
                    {/* Shop details */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={shop.logoUrl ? resolveImageUrl(shop.logoUrl) : undefined}
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2.5,
                            bgcolor: 'primary.main',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          {shop.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {shop.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, mt: 0.25 }}>
                            <LocationOnRoundedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {shop.address?.city || 'India'}
                              {shop.address?.state ? ` • ${shop.address.state}` : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Owner & Phone */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                        {shop.ownerName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, mt: 0.25 }}>
                        <PhoneRoundedIcon sx={{ fontSize: 13, color: 'secondary.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'secondary.dark' }}>
                          {shop.phone}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Staff */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleAltRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {shop.stats?.totalStaff || 1} staff
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Clients */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                        {(shop.stats?.totalCustomers || 0).toLocaleString()}
                      </Typography>
                    </TableCell>

                    {/* Orders */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {(shop.stats?.totalOrders || 0).toLocaleString()}
                      </Typography>
                    </TableCell>

                    {/* Revenue */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                        ₹{(shop.stats?.totalRevenue || 0).toLocaleString()}
                      </Typography>
                    </TableCell>

                    {/* Subscription Tier with Toggle */}
                    <TableCell>
                      <Tooltip title="Click to toggle Pro / Free plan">
                        <Chip
                          icon={
                            shop.subscription?.plan === 'pro' ? (
                              <AutoAwesomeRoundedIcon sx={{ fontSize: '13px !important' }} />
                            ) : undefined
                          }
                          label={shop.subscription?.plan === 'pro' ? 'PRO PLAN' : 'FREE TIER'}
                          size="small"
                          clickable
                          onClick={() => handleTogglePlan(shop)}
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            borderRadius: 1.5,
                            bgcolor:
                              shop.subscription?.plan === 'pro'
                                ? 'rgba(124, 58, 237, 0.1)'
                                : 'rgba(100, 116, 139, 0.1)',
                            color: shop.subscription?.plan === 'pro' ? '#7C3AED' : '#475569',
                            border: `1px solid ${
                              shop.subscription?.plan === 'pro'
                                ? 'rgba(124, 58, 237, 0.3)'
                                : 'rgba(100, 116, 139, 0.25)'
                            }`,
                          }}
                        />
                      </Tooltip>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Assign New Technician">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenAddTech(shop._id)}
                            sx={{
                              color: 'secondary.main',
                              bgcolor: 'rgba(6, 182, 212, 0.08)',
                              '&:hover': { bgcolor: 'rgba(6, 182, 212, 0.16)' },
                            }}
                          >
                            <PersonAddRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="View Center Details & Technicians">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDetailsShop(shop);
                              setIsDetailsModalOpen(true);
                            }}
                            sx={{
                              color: 'primary.main',
                              bgcolor: 'rgba(0, 82, 255, 0.08)',
                              '&:hover': { bgcolor: 'rgba(0, 82, 255, 0.16)' },
                            }}
                          >
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Center Info">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedShop(shop);
                              setIsEditModalOpen(true);
                            }}
                            sx={{
                              color: 'info.main',
                              bgcolor: 'rgba(99, 102, 241, 0.08)',
                              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.16)' },
                            }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Center">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteShop(shop)}
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {shops.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={shops.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: '1px solid #E2E8F0' }}
          />
        )}
      </Paper>

      {/* Edit or Create Shop Modal */}
      <ShopModal
        shop={selectedShop}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={() => fetchShops()}
      />

      {/* Shop Details Modal */}
      <ShopDetailsModal
        shop={detailsShop}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={(shopToEdit) => {
          setIsDetailsModalOpen(false);
          setSelectedShop(shopToEdit);
          setIsEditModalOpen(true);
        }}
        onAddTechnician={(shopId) => {
          setIsDetailsModalOpen(false);
          handleOpenAddTech(shopId);
        }}
      />

      {/* Technician Modal */}
      <TechnicianModal
        technician={null}
        shopId={targetShopIdForTech}
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        onSaved={() => fetchShops()}
      />
    </Box>
  );
};
export default ShopsPage;
