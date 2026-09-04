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
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import type { RevenueAnalytics } from '../types/admin';
import { StatCard } from '../components/StatCard';
import { RevenueChart } from '../components/RevenueChart';
import { adminApi } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const RevenuePage: React.FC = () => {
  const { selectedShopId, addToast } = useAdminAuth();
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRevenueAnalytics(selectedShopId);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchRevenue();
  }, [selectedShopId]);

  const handleExportCSV = () => {
    if (!data) return;

    const headers = ['Shop Name,Owner,Plan,Revenue Collected (INR),Pending Dues (INR),Total Jobs'];
    const rows = data.revenueByShop.map(
      (s) => `"${s.shopName}","${s.ownerName}","${s.plan}",${s.revenue},${s.dues},${s.ordersCount}`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `datadaddy_revenue_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Revenue report CSV exported successfully!');
  };

  const summary = data?.summary;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Revenue & Financial Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Consolidated cash collections, outstanding dues recovery rate, and tenant turnover.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleExportCSV}
          startIcon={<DownloadRoundedIcon fontSize="small" />}
        >
          Export CSV Financials
        </Button>
      </Box>

      {/* Top Financial Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}
      >
        <StatCard
          title="TOTAL REVENUE COLLECTED"
          value={`₹${(summary?.totalRevenue || 0).toLocaleString()}`}
          subtitle="Realized payments & advances"
          trend={{ value: '100% Verified', isPositive: true }}
          icon={CurrencyRupeeRoundedIcon}
          gradient="emerald"
        />

        <StatCard
          title="PENDING CUSTOMER DUES"
          value={`₹${(summary?.totalDues || 0).toLocaleString()}`}
          subtitle="Pending pickup or delivery"
          trend={{ value: 'Outstanding', isPositive: false }}
          icon={WarningAmberRoundedIcon}
          gradient="amber"
        />

        <StatCard
          title="TOTAL GROSS REPAIRS"
          value={`₹${(summary?.totalGrossValue || 0).toLocaleString()}`}
          subtitle={`Across ${summary?.ordersCount || 0} job cards`}
          trend={{ value: '+18% growth', isPositive: true }}
          icon={TrendingUpRoundedIcon}
          gradient="brand"
        />
      </Box>

      {/* Visual Analytics Chart */}
      <RevenueChart data={data} />

      {/* Multi-Shop Revenue Breakdown Table */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
            Shop-by-Shop Financial Breakdown
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Detailed turnover, uncollected balance, and job count per repair franchise
          </Typography>
        </Box>

        <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Center / Shop</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell>Total Jobs</TableCell>
                <TableCell>Collected Revenue</TableCell>
                <TableCell>Uncollected Dues</TableCell>
                <TableCell>Collection Efficiency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                      Loading financial ledger...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : !data || data.revenueByShop.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No revenue records available.
                  </TableCell>
                </TableRow>
              ) : (
                data.revenueByShop
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => {
                  const total = item.revenue + item.dues;
                  const collectionRate = total > 0 ? Math.round((item.revenue / total) * 100) : 100;

                  return (
                    <TableRow key={item.shopId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StoreRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {item.shopName}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                          {item.ownerName}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={`${item.plan.toUpperCase()} TIER`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            borderRadius: 1.5,
                            bgcolor: item.plan === 'pro' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                            color: item.plan === 'pro' ? '#7C3AED' : '#475569',
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.ordersCount}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                          ₹{item.revenue.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: item.dues > 0 ? 'error.main' : 'text.secondary',
                          }}
                        >
                          {item.dues > 0 ? `₹${item.dues.toLocaleString()}` : '₹0'}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ minWidth: 160 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={collectionRate}
                            color={collectionRate >= 80 ? 'success' : collectionRate >= 50 ? 'warning' : 'error'}
                            sx={{ flex: 1, height: 8, borderRadius: 5 }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {collectionRate}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {data?.revenueByShop && data.revenueByShop.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.revenueByShop.length}
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
    </Box>
  );
};
export default RevenuePage;
