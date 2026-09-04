import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tooltip,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AddBusinessRoundedIcon from '@mui/icons-material/AddBusinessRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import type { PlatformOverview, OrderItem, RevenueAnalytics } from '../types/admin';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { RevenueChart } from '../components/RevenueChart';
import { OrderInspectorModal } from '../components/OrderInspectorModal';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

interface DashboardPageProps {
  onNavigateTab: (tab: any) => void;
  onOpenShopModal: () => void;
  onOpenTechModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenShopModal,
  onOpenTechModal,
}) => {
  const { selectedShopId, shops } = useAdminAuth();
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, rev] = await Promise.all([
        adminApi.getOverview(selectedShopId),
        adminApi.getRevenueAnalytics(selectedShopId),
      ]);
      setOverview(ov);
      setRevenueData(rev);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedShopId]);

  const activeShop = shops.find((s) => s._id === selectedShopId);
  const kpis = overview?.kpis;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Header Banner */}
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
            {selectedShopId === 'all'
              ? 'Platform Overview & Health'
              : `${activeShop?.name || 'Shop'} Dashboard`}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {selectedShopId === 'all'
              ? 'Real-time multi-shop aggregation, job pipeline status, and consolidated revenue intelligence.'
              : `Operating in ${activeShop?.address?.city || 'India'} • Managed by ${activeShop?.ownerName}`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onOpenTechModal}
            startIcon={<PersonAddRoundedIcon fontSize="small" />}
            sx={{
              color: '#334155',
              borderColor: '#CBD5E1',
              '&:hover': { borderColor: '#0052FF', color: '#0052FF' },
            }}
          >
            Add Technician
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={onOpenShopModal}
            startIcon={<AddBusinessRoundedIcon fontSize="small" />}
          >
            Onboard Shop
          </Button>
        </Box>
      </Box>

      {/* KPI Stat Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2.5,
        }}
      >
        <StatCard
          title="TOTAL REVENUE"
          value={`₹${(kpis?.totalRevenue || 0).toLocaleString()}`}
          subtitle={selectedShopId === 'all' ? 'All Shops Collected' : 'Total Collected'}
          trend={{ value: '+14% this month', isPositive: true }}
          icon={CurrencyRupeeRoundedIcon}
          gradient="emerald"
        />

        <StatCard
          title="ACTIVE SHOPS"
          value={kpis?.totalShops || 0}
          subtitle={`${kpis?.proShops || 0} on Pro Tier`}
          trend={{ value: `${kpis?.activeShops || 0} active centers`, isPositive: true }}
          icon={StoreRoundedIcon}
          gradient="brand"
        />

        <StatCard
          title="TOTAL TECHNICIANS"
          value={kpis?.totalTechnicians || 0}
          subtitle="Hardware & Chip Engineers"
          trend={{ value: 'Multi-shop staff', isPositive: true }}
          icon={PeopleAltRoundedIcon}
          gradient="cyan"
        />

        <StatCard
          title="PENDING REPAIRS"
          value={(overview?.statusCounts?.pending || 0) + (overview?.statusCounts?.in_progress || 0)}
          subtitle={`₹${(kpis?.totalDues || 0).toLocaleString()} uncollected dues`}
          trend={{ value: `${overview?.statusCounts?.in_progress || 0} in progress`, isPositive: true }}
          icon={ReceiptLongRoundedIcon}
          gradient="amber"
        />
      </Box>

      {/* Revenue Charts & Leaderboard */}
      <RevenueChart data={revenueData} />

      {/* Live Recent Orders & Customer Issues Feed */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2.5,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
              Live Repair Orders & Customer Issues Feed
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Real-time feed of reported device faults and repair stages across centers
            </Typography>
          </Box>

          <Button
            variant="text"
            size="small"
            onClick={() => onNavigateTab('orders')}
            endIcon={<ArrowForwardRoundedIcon fontSize="small" />}
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            View All Orders
          </Button>
        </Box>

        <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Job ID</TableCell>
                <TableCell>Repair Center</TableCell>
                <TableCell>Customer Details</TableCell>
                <TableCell>Device Model</TableCell>
                <TableCell>Customer Issue / Fault</TableCell>
                <TableCell>Job Status</TableCell>
                <TableCell>Amount & Dues</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                      Loading platform data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : overview?.recentOrders && overview.recentOrders.length > 0 ? (
                overview.recentOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ord) => {
                  const shopName = typeof ord.shopId === 'object' ? ord.shopId?.name : 'Shop';
                  return (
                    <TableRow key={ord._id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: 'primary.main',
                            fontSize: '0.85rem',
                          }}
                        >
                          {ord.jobId}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                          {shopName}
                        </Typography>
                      </TableCell>

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
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {ord.customerSnapshot?.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {ord.brand} {ord.model}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            textTransform: 'capitalize',
                            display: 'block',
                          }}
                        >
                          {ord.deviceType}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 260 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            fontSize: '0.78rem',
                            color: '#1E293B',
                            fontWeight: 500,
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          "{ord.problemDescription}"
                        </Box>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={ord.status} />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          ₹{(ord.cost?.final || 0).toLocaleString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: (ord.cost?.due || 0) > 0 ? 'error.main' : 'success.main',
                          }}
                        >
                          {(ord.cost?.due || 0) > 0 ? `Due: ₹${ord.cost.due}` : 'Fully Paid'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="Inspect Full Job Card">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setSelectedOrder(ord)}
                            startIcon={<VisibilityRoundedIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              px: 1.5,
                              py: 0.5,
                              color: '#334155',
                              borderColor: '#CBD5E1',
                              '&:hover': {
                                borderColor: '#0052FF',
                                color: '#0052FF',
                                bgcolor: 'rgba(0, 82, 255, 0.04)',
                              },
                            }}
                          >
                            Inspect
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No repair orders recorded. Click "Seed Demo Data" above to generate realistic data!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 10 per page TablePagination */}
        {overview?.recentOrders && overview.recentOrders.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={overview.recentOrders.length}
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

      {/* Order Inspector Modal */}
      {selectedOrder && (
        <OrderInspectorModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={(updated) => {
            setSelectedOrder(updated);
            loadData();
          }}
        />
      )}
    </Box>
  );
};
export default DashboardPage;
