import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon: React.ElementType;
  gradient?: 'brand' | 'emerald' | 'amber' | 'cyan';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  gradient = 'brand',
}) => {
  const gradientStyles = {
    brand: {
      bg: 'linear-gradient(135deg, #0052FF 0%, #3B82F6 100%)',
      shadow: '0 4px 14px rgba(0, 82, 255, 0.28)',
      accent: '#0052FF',
      chipBg: 'rgba(0, 82, 255, 0.1)',
      chipText: '#0052FF',
      chipBorder: 'rgba(0, 82, 255, 0.25)',
    },
    emerald: {
      bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      shadow: '0 4px 14px rgba(16, 185, 129, 0.28)',
      accent: '#10B981',
      chipBg: 'rgba(16, 185, 129, 0.12)',
      chipText: '#047857',
      chipBorder: 'rgba(16, 185, 129, 0.3)',
    },
    amber: {
      bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      shadow: '0 4px 14px rgba(245, 158, 11, 0.28)',
      accent: '#F59E0B',
      chipBg: 'rgba(245, 158, 11, 0.12)',
      chipText: '#B45309',
      chipBorder: 'rgba(245, 158, 11, 0.3)',
    },
    cyan: {
      bg: 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)',
      shadow: '0 4px 14px rgba(6, 182, 212, 0.28)',
      accent: '#06B6D4',
      chipBg: 'rgba(6, 182, 212, 0.1)',
      chipText: '#0284C7',
      chipBorder: 'rgba(6, 182, 212, 0.25)',
    },
  };

  const currentTheme = gradientStyles[gradient];

  const isNegative = trend?.isPositive === false;
  const chipBg = isNegative ? 'rgba(239, 68, 68, 0.12)' : currentTheme.chipBg;
  const chipColor = isNegative ? '#DC2626' : currentTheme.chipText;
  const chipBorder = isNegative ? 'rgba(239, 68, 68, 0.3)' : currentTheme.chipBorder;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.1)',
        },
      }}
    >
      {/* Top Accent Stripe */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: currentTheme.bg,
        }}
      />

      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'text.secondary',
              fontSize: '0.72rem',
            }}
          >
            {title}
          </Typography>

          <Avatar
            sx={{
              width: 42,
              height: 42,
              background: currentTheme.bg,
              boxShadow: currentTheme.shadow,
              color: '#FFFFFF',
              borderRadius: 2.5,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Avatar>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: '1.85rem',
            letterSpacing: '-0.03em',
            color: 'text.primary',
            mb: 0.75,
          }}
        >
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {trend && (
            <Chip
              icon={
                isNegative ? (
                  <TrendingDownRoundedIcon sx={{ fontSize: '13px !important' }} />
                ) : (
                  <TrendingUpRoundedIcon sx={{ fontSize: '13px !important' }} />
                )
              }
              label={trend.value}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: 1.5,
                bgcolor: chipBg,
                color: chipColor,
                border: `1px solid ${chipBorder}`,
                '& .MuiChip-icon': {
                  color: `${chipColor} !important`,
                  fontSize: '13px !important',
                },
                '& .MuiChip-label': {
                  px: 0.75,
                },
              }}
            />
          )}

          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
export default StatCard;
