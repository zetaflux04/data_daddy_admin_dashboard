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
  InputAdornment,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import type { OrderItem } from '../types/admin';
import { StatusBadge } from '../components/StatusBadge';
import { OrderInspectorModal } from '../components/OrderInspectorModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AccessoriesPage: React.FC = () => {
  const { selectedShopId, addToast } = useAdminAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [inspectOrder, setInspectOrder] = useState<OrderItem | null>(null);
  const [editOrder, setEditOrder] = useState<OrderItem | null>(null);

  const fetchAccessoryOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        shopId: selectedShopId,
        orderType: 'accessory',
        search,
      });
      setOrders(res.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchAccessoryOrders();
  }, [selectedShopId, search]);

  const handleDelete = async (ord: OrderItem) => {
    const confirmed = window.confirm(
      `⚠️ Delete accessory sale "${ord.jobId}" (${ord.productName || 'Product'}) for customer ${ord.customerSnapshot.name}?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteOrder(ord._id);
      addToast('success', `Accessory sale ${ord.jobId} deleted successfully`);
      fetchAccessoryOrders();
    } catch (e: any) {
      addToast('error', e.message || 'Failed to delete accessory record');
    }
  };

  const totalAccessoryRevenue = orders.reduce((sum, o) => sum + (o.cost?.final || o.productPrice || 0), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Accessory Sales & Direct Products
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Track direct OTC accessory items, chargers, display protectors, cables, and earwear sold across shops.
          </Typography>
        </Box>

        <Paper
          sx={{
            p: 1.5,
            px: 2.5,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Accessory Sales
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
              ₹{totalAccessoryRevenue.toLocaleString()}
            </Typography>
          </Box>
          <Chip
            label={`${orders.length} items`}
            size="small"
            color="primary"
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          />
        </Paper>
      </Box>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by accessory name, customer, phone, Job ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      </Paper>

      {/* Accessories Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Sale / Job ID</TableCell>
                <TableCell>Center</TableCell>
                <TableCell>Customer Details</TableCell>
                <TableCell>Accessory Product</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                      Loading accessory records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No accessory sales recorded.
                  </TableCell>
                </TableRow>
              ) : (
                orders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ord) => {
                  const shopName = typeof ord.shopId === 'object' ? ord.shopId?.name : 'Center';
                  return (
                    <TableRow key={ord._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#0F172A' }}>
                          {ord.jobId}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StoreRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {shopName}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              bgcolor: 'rgba(6, 182, 212, 0.1)',
                              color: 'secondary.main',
                            }}
                          >
                            {ord.customerSnapshot?.name ? ord.customerSnapshot.name.charAt(0) : 'C'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {ord.customerSnapshot?.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
                              <PhoneRoundedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {ord.customerSnapshot?.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <ShoppingBagRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {ord.productName || 'Accessories Item'}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(ord as any).quantity || 1}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          ₹{(ord.cost?.final || ord.productPrice || 0).toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={ord.status} />
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Inspect Sale Details">
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

                          <Tooltip title="Edit Record">
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

                          <Tooltip title="Delete Record">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(ord)}
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
            fetchAccessoryOrders();
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
            fetchAccessoryOrders();
          }}
        />
      )}
    </Box>
  );
};
export default AccessoriesPage;
