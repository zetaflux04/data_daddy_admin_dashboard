import React from 'react';
import { Chip } from '@mui/material';
import type { JobStatus } from '../types/admin';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

interface StatusBadgeProps {
  status: JobStatus | string;
  type?: 'status' | 'plan' | 'role';
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status', size = 'small' }) => {
  if (type === 'plan') {
    const isPro = status === 'pro';
    return (
      <Chip
        icon={isPro ? <AutoAwesomeRoundedIcon sx={{ fontSize: '13px !important' }} /> : undefined}
        label={`${status.toUpperCase()} PLAN`}
        size={size}
        sx={{
          fontWeight: 800,
          fontSize: '0.6875rem',
          borderRadius: 1.5,
          color: isPro ? '#7C3AED' : '#475569',
          bgcolor: isPro ? 'rgba(124, 58, 237, 0.1)' : 'rgba(100, 116, 139, 0.1)',
          border: `1px solid ${isPro ? 'rgba(124, 58, 237, 0.3)' : 'rgba(100, 116, 139, 0.25)'}`,
        }}
      />
    );
  }

  if (type === 'role') {
    const roleColors: Record<string, { bg: string; border: string; text: string }> = {
      owner: { bg: 'rgba(217, 70, 239, 0.1)', border: 'rgba(217, 70, 239, 0.35)', text: '#A21CAF' },
      technician: { bg: 'rgba(0, 82, 255, 0.1)', border: 'rgba(0, 82, 255, 0.35)', text: '#0052FF' },
      staff: { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.35)', text: '#0284C7' },
    };
    const c = roleColors[status] || roleColors.staff;
    return (
      <Chip
        icon={<PersonRoundedIcon sx={{ fontSize: '13px !important', color: `${c.text} !important` }} />}
        label={status}
        size={size}
        sx={{
          fontWeight: 700,
          fontSize: '0.7rem',
          textTransform: 'capitalize',
          borderRadius: 1.5,
          bgcolor: c.bg,
          border: `1px solid ${c.border}`,
          color: c.text,
        }}
      />
    );
  }

  // Job Status Chip
  const statusConfig: Record<
    string,
    { label: string; icon: React.ReactElement; color: string; bg: string; border: string }
  > = {
    pending: {
      label: 'Intake / Pending',
      icon: <ScheduleRoundedIcon sx={{ fontSize: '13px !important' }} />,
      color: '#D97706',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    in_progress: {
      label: 'In Progress',
      icon: <BuildRoundedIcon sx={{ fontSize: '13px !important' }} />,
      color: '#0284C7',
      bg: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.3)',
    },
    parts_delayed: {
      label: 'Parts Delayed',
      icon: <WarningAmberRoundedIcon sx={{ fontSize: '13px !important' }} />,
      color: '#E11D48',
      bg: 'rgba(244, 63, 94, 0.1)',
      border: 'rgba(244, 63, 94, 0.3)',
    },
    repaired: {
      label: 'Ready for Pickup',
      icon: <CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />,
      color: '#059669',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    delivered: {
      label: 'Delivered',
      icon: <LocalShippingRoundedIcon sx={{ fontSize: '13px !important' }} />,
      color: '#4338CA',
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.3)',
    },
    canceled: {
      label: 'Canceled',
      icon: <CancelRoundedIcon sx={{ fontSize: '13px !important' }} />,
      color: '#DC2626',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
    },
  };

  const cfg = statusConfig[status] || {
    label: status,
    icon: <ScheduleRoundedIcon sx={{ fontSize: '13px !important' }} />,
    color: '#64748B',
    bg: 'rgba(100, 116, 139, 0.1)',
    border: 'rgba(100, 116, 139, 0.3)',
  };

  return (
    <Chip
      icon={cfg.icon}
      label={cfg.label}
      size={size}
      sx={{
        fontWeight: 700,
        fontSize: '0.72rem',
        borderRadius: 1.5,
        color: cfg.color,
        bgcolor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        '& .MuiChip-icon': {
          color: `${cfg.color} !important`,
          fontSize: '13px !important',
        },
      }}
    />
  );
};
export default StatusBadge;
