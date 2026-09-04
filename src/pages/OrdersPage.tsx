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
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';

import type { OrderItem } from '../types/admin';
import { StatusBadge } from '../components/StatusBadge';
import { OrderInspectorModal } from '../components/OrderInspectorModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const OrdersPage: React.FC = () => {
  const { selectedShopId, addToast } = useAdminAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [inspectOrder, setInspectOrder] = useState<OrderItem | null>(null);
  const [editOrder, setEditOrder] = useState<OrderItem | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        shopId: selectedShopId,
        status: statusFilter,
        deviceType: deviceFilter,
        orderType: orderTypeFilter,
        search,
      });
      setOrders(res.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchOrders();
  }, [selectedShopId, statusFilter, deviceFilter, orderTypeFilter, search]);

  const handleDeleteOrder = async (ord: OrderItem) => {
    const typeLabel = (ord.orderType || 'repair') === 'accessory' ? 'accessory sale' : 'repair order';
    const confirmed = window.confirm(
      `⚠️ Delete ${typeLabel} "${ord.jobId}" for customer ${ord.customerSnapshot.name}?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteOrder(ord._id);
      addToast('success', `Order ${ord.jobId} deleted successfully`);
      fetchOrders();
    } catch (e: any) {
      addToast('error', e.message || 'Failed to delete order');
    }
  };

  const statusTabs: { id: string; label: string }[] = [
    { id: 'all', label: 'All Jobs' },
    { id: 'pending', label: 'Pending Intake' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'parts_delayed', label: 'Parts Delayed' },
    { id: 'repaired', label: 'Repaired / Ready' },
    { id: 'delivered', label: 'Delivered' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Customer Repair Orders & Job Cards
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Inspect reported customer issues, device model numbers, costs, customer addresses, and update or delete records.
        </Typography>
      </Box>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <TextField
            placeholder="Search by issue, device, customer name, phone, or Job ID..."
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

          {/* Order Type Dropdown */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="repair">🔧 Repair Orders</MenuItem>
              <MenuItem value="accessory">🛒 Accessory Sales</MenuItem>
            </Select>
          </FormControl>

          {/* Device Type Dropdown */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All Devices</MenuItem>
              <MenuItem value="mobile">📱 Smartphone</MenuItem>
              <MenuItem value="laptop">💻 Laptop</MenuItem>
              <MenuItem value="tablet">📟 Tablet</MenuItem>
              <MenuItem value="watch">⌚ Smartwatch</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Status Pipeline Chips */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pt: 2,
            mt: 2,
            borderTop: '1px solid #F1F5F9',
          }}
        >
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <Chip
                key={tab.id}
                label={tab.label}
                clickable
                onClick={() => setStatusFilter(tab.id)}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.78rem',
                  borderRadius: 2,
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* Orders Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Job ID & Center</TableCell>
                <TableCell>Customer Details</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Device / Item</TableCell>
                <TableCell sx={{ minWidth: 220 }}>Fault / Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount & Dues</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                      Loading customer orders...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No orders match your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                orders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ord) => {
                  const shopName = typeof ord.shopId === 'object' ? ord.shopId?.name : 'Center';
                  const shopCity = typeof ord.shopId === 'object' ? ord.shopId?.address?.city : '';
                  const customerAddress =
                    typeof ord.customerId === 'object' && ord.customerId && 'address' in (ord.customerId as any)
                      ? `${(ord.customerId as any).address?.street || ''} ${(ord.customerId as any).address?.city || ''}`.trim() || 'On-file with center'
                      : 'On-file with center';

                  const isAccessory = (ord.orderType || 'repair') === 'accessory';

                  return (
                    <TableRow key={ord._id} hover>
                      {/* Job ID & Center */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: '#0F172A',
                            fontSize: '0.85rem',
                          }}
                        >
                          {ord.jobId}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                          <StoreRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {shopName} {shopCity ? `(${shopCity})` : ''}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Customer Details */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              bgcolor: 'rgba(0, 82, 255, 0.1)',
                              color: 'primary.main',
                            }}
                          >
                            {ord.customerSnapshot?.name ? ord.customerSnapshot.name.charAt(0) : 'C'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {ord.customerSnapshot?.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: 0.25 }}>
                              <LocationOnRoundedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {customerAddress}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Phone */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneRoundedIcon sx={{ fontSize: 14, color: 'secondary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.dark', fontSize: '0.82rem' }}>
                            {ord.customerSnapshot?.phone}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Chip
                          icon={
                            isAccessory ? (
                              <ShoppingBagRoundedIcon sx={{ fontSize: '13px !important' }} />
                            ) : (
                              <BuildRoundedIcon sx={{ fontSize: '13px !important' }} />
                            )
                          }
                          label={isAccessory ? 'Accessory' : 'Repair'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.6875rem',
                            borderRadius: 1.5,
                            bgcolor: isAccessory ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0, 82, 255, 0.1)',
                            color: isAccessory ? '#9333EA' : '#0052FF',
                            border: `1px solid ${isAccessory ? 'rgba(168, 85, 247, 0.3)' : 'rgba(0, 82, 255, 0.3)'}`,
                          }}
                        />
                      </TableCell>

                      {/* Device / Item */}
                      <TableCell>
                        {isAccessory ? (
                          <>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {ord.productName || 'Accessory Product'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              MRP: ₹{(ord.productPrice || 0).toLocaleString()}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {ord.brand} {ord.model}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                              {ord.deviceType} {ord.serialOrImei ? `• IMEI: ${ord.serialOrImei.slice(-4)}` : ''}
                            </Typography>
                          </>
                        )}
                      </TableCell>

                      {/* Fault Description */}
                      <TableCell sx={{ maxWidth: 260 }}>
                        {isAccessory ? (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            Direct store sale
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              bgcolor: 'rgba(245, 158, 11, 0.08)',
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                              fontSize: '0.78rem',
                              color: '#92400E',
                              fontWeight: 500,
                              lineHeight: 1.3,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25, fontWeight: 700 }}>
                              <WarningAmberRoundedIcon sx={{ fontSize: 13, color: '#D97706' }} />
                              <span>FAULT:</span>
                            </Box>
                            "{ord.problemDescription}"
                          </Box>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={ord.status} />
                      </TableCell>

                      {/* Cost & Due */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          ₹{(ord.cost?.final || ord.cost?.estimated || 0).toLocaleString()}
                        </Typography>
                        {(ord.cost?.due || 0) > 0 ? (
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main', display: 'block' }}>
                            Due: ₹{ord.cost.due.toLocaleString()}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', display: 'block' }}>
                            Paid
                          </Typography>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Inspect Job Card">
                            <IconButton
                              size="small"
                              onClick={() => setInspectOrder(ord)}
                              sx={{
                                color: 'primary.main',
                                bgcolor: 'rgba(0, 82, 255, 0.06)',
                                '&:hover': { bgcolor: 'rgba(0, 82, 255, 0.15)' },
                              }}
                            >
                              <VisibilityRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Order Details">
                            <IconButton
                              size="small"
                              onClick={() => setEditOrder(ord)}
                              sx={{
                                color: 'info.main',
                                bgcolor: 'rgba(99, 102, 241, 0.06)',
                                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' },
                              }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Order">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteOrder(ord)}
                              sx={{
                                color: 'error.main',
                                bgcolor: 'rgba(239, 68, 68, 0.06)',
                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' },
                              }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {orders.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={orders.length}
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

      {/* Inspector Modal */}
      {inspectOrder && (
        <OrderInspectorModal
          order={inspectOrder}
          onClose={() => setInspectOrder(null)}
          onOrderUpdated={(updated) => {
            setInspectOrder(updated);
            fetchOrders();
          }}
        />
      )}

      {/* Edit Modal */}
      {editOrder && (
        <EditOrderModal
          order={editOrder}
          isOpen={true}
          onClose={() => setEditOrder(null)}
          onSaved={() => {
            setEditOrder(null);
            fetchOrders();
          }}
        />
      )}
    </Box>
  );
};
export default OrdersPage;
