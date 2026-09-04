import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import type { RevenueAnalytics } from '../types/admin';

interface RevenueChartProps {
  data: RevenueAnalytics | null;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  if (!data) return null;

  const maxRevenue = Math.max(...data.revenueByShop.map((s) => s.revenue + s.dues), 1);
  const totalModeAmount = data.paymentsByMode.reduce((sum, m) => sum + m.totalAmount, 0) || 1;

  const modeColors: Record<string, string> = {
    upi: '#7C3AED',
    cash: '#10B981',
    card: '#0052FF',
    online: '#F59E0B',
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
        gap: 3,
      }}
    >
      {/* Revenue Leaderboard per Shop */}
      <Card sx={{ p: 1, borderRadius: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartRoundedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                Shop Revenue & Dues Comparison
              </Typography>
            </Box>
            <Chip label="Tenant Performance" size="small" variant="outlined" sx={{ fontSize: '0.68rem', fontWeight: 700 }} />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.revenueByShop.map((item) => {
              const revPct = Math.round((item.revenue / maxRevenue) * 100);
              const duePct = Math.round((item.dues / maxRevenue) * 100);

              return (
                <Box key={item.shopId} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.82rem' }}>
                      {item.shopName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800 }}>
                        ₹{item.revenue.toLocaleString()}
                      </Typography>
                      {item.dues > 0 && (
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                          Due: ₹{item.dues.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Stacked Progress Bar */}
                  <Box
                    sx={{
                      height: 10,
                      borderRadius: 10,
                      bgcolor: '#F1F5F9',
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    <Box
                      title={`Collected: ₹${item.revenue}`}
                      sx={{
                        width: `${revPct}%`,
                        background: 'linear-gradient(90deg, #0052FF, #10B981)',
                        borderRadius: duePct > 0 ? '10px 0 0 10px' : '10px',
                        transition: 'width 0.5s ease-out',
                      }}
                    />
                    {item.dues > 0 && (
                      <Box
                        title={`Pending Due: ₹${item.dues}`}
                        sx={{
                          width: `${duePct}%`,
                          bgcolor: '#EF4444',
                          transition: 'width 0.5s ease-out',
                        }}
                      />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 2.5, mt: 3, pt: 2, borderTop: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Revenue Collected
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Uncollected Dues
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Payment Modes Distribution */}
      <Card sx={{ p: 1, borderRadius: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieChartRoundedIcon sx={{ color: 'secondary.main', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                Payment Method Distribution
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              ₹{totalModeAmount.toLocaleString()} Total
            </Typography>
          </Box>

          {/* Horizontal Stacked Bar */}
          <Box
            sx={{
              height: 14,
              borderRadius: 10,
              overflow: 'hidden',
              display: 'flex',
              mb: 3,
              bgcolor: '#F1F5F9',
            }}
          >
            {data.paymentsByMode.map((mode) => {
              const pct = (mode.totalAmount / totalModeAmount) * 100;
              return (
                <Box
                  key={mode._id}
                  title={`${mode._id.toUpperCase()}: ₹${mode.totalAmount} (${Math.round(pct)}%)`}
                  sx={{
                    width: `${pct}%`,
                    bgcolor: modeColors[mode._id] || '#0052FF',
                    transition: 'width 0.5s ease-out',
                  }}
                />
              );
            })}
          </Box>

          {/* Detailed Breakdown Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            {data.paymentsByMode.map((mode) => {
              const pct = Math.round((mode.totalAmount / totalModeAmount) * 100);
              return (
                <Box
                  key={mode._id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: 1,
                      bgcolor: modeColors[mode._id] || '#0052FF',
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', display: 'block' }}
                    >
                      {mode._id}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      ₹{mode.totalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                    {pct}%
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
export default RevenueChart;
