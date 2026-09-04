import React from 'react';
import { styled, type Theme, type CSSObject } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Avatar,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Logo } from './Logo';

export type NavTab =
  | 'dashboard'
  | 'shops'
  | 'orders'
  | 'accessories'
  | 'revenue'
  | 'notifications';

const drawerWidth = 260;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  backgroundColor: '#0F172A',
  color: '#FFFFFF',
  borderRight: '1px solid #1E293B',
  boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(8)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8.5)} + 1px)`,
  },
  backgroundColor: '#0F172A',
  color: '#FFFFFF',
  borderRight: '1px solid #1E293B',
  boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)',
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  open: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, open, onToggle }) => {
  const { user, logout } = useAdminAuth();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Overview / Dashboard', icon: DashboardRoundedIcon, badge: null },
    { id: 'shops' as NavTab, label: 'Shops & Centers', icon: StoreRoundedIcon, badge: null },
    { id: 'orders' as NavTab, label: 'Repair Orders', icon: ReceiptLongRoundedIcon, badge: 'Live', badgeColor: 'success' as const },
    { id: 'accessories' as NavTab, label: 'Accessories & Sales', icon: ShoppingBagRoundedIcon, badge: 'Sales', badgeColor: 'secondary' as const },
    { id: 'revenue' as NavTab, label: 'Revenue & Finances', icon: CurrencyRupeeRoundedIcon, badge: null },
    { id: 'notifications' as NavTab, label: 'Notification Center', icon: NotificationsRoundedIcon, badge: 'Broadcast', badgeColor: 'info' as const },
  ];

  return (
    <Drawer variant="permanent" open={open}>
      {/* Brand Header with DataDaddy Logo and Toggle */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 2 : 1,
          borderBottom: '1px solid #1E293B',
          background: 'linear-gradient(180deg, #131E35 0%, #0F172A 100%)',
        }}
      >
        {open ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
            <Logo variant="full" height={36} inverted sx={{ flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Super <Box component="span" sx={{ color: '#38BDF8' }}>Admin</Box>
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: '#94A3B8',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Control Center
              </Typography>
            </Box>
          </Box>
        ) : (
          <Tooltip title="Expand Sidebar" placement="right">
            <IconButton onClick={onToggle} sx={{ p: 0.5 }}>
              <Logo variant="icon-only" height={28} inverted />
            </IconButton>
          </Tooltip>
        )}

        {open && (
          <Tooltip title="Collapse Sidebar" placement="right">
            <IconButton
              size="small"
              onClick={onToggle}
              sx={{
                color: '#94A3B8',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.12)' },
              }}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Nav List */}
      <Box sx={{ flex: 1, py: 2, px: open ? 1.5 : 0.75, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {open && (
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#64748B',
              px: 1.5,
              py: 0.5,
              mb: 0.5,
            }}
          >
            Modules
          </Typography>
        )}

        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                <Tooltip title={!open ? item.label : ''} placement="right" arrow>
                  <ListItemButton
                    onClick={() => setActiveTab(item.id)}
                    sx={{
                      minHeight: 44,
                      justifyContent: open ? 'initial' : 'center',
                      px: open ? 2 : 1.5,
                      py: 1,
                      borderRadius: 2,
                      backgroundColor: isActive ? 'rgba(0, 82, 255, 0.16)' : 'transparent',
                      border: isActive ? '1px solid rgba(0, 82, 255, 0.45)' : '1px solid transparent',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        backgroundColor: isActive ? 'rgba(0, 82, 255, 0.24)' : 'rgba(255, 255, 255, 0.05)',
                        color: '#FFFFFF',
                        '& .MuiListItemIcon-root': {
                          color: '#38BDF8',
                          transform: 'scale(1.08)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                        color: isActive ? '#0052FF' : '#94A3B8',
                        transition: 'transform 0.18s ease, color 0.18s ease',
                      }}
                    >
                      <Icon fontSize="small" />
                    </ListItemIcon>

                    {open && (
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontSize: '0.84rem',
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? '#FFFFFF' : '#CBD5E1',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.label}
                          </Typography>
                        }
                      />
                    )}

                    {open && item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        color={item.badgeColor || 'default'}
                        sx={{
                          height: 20,
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          px: 0.5,
                          ml: 1,
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer User Info */}
      <Box
        sx={{
          p: open ? 2 : 1,
          borderTop: '1px solid #1E293B',
          backgroundColor: '#090D16',
          display: 'flex',
          flexDirection: 'column',
          alignItems: open ? 'stretch' : 'center',
          gap: 1.5,
        }}
      >
        {open ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                }}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SA'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: '#F8FAFC',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '0.82rem',
                  }}
                >
                  {user?.name || 'Master Admin'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    fontSize: '0.68rem',
                  }}
                >
                  {user?.email || 'admin@datadaddy.com'}
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="small"
              onClick={logout}
              startIcon={<LogoutRoundedIcon fontSize="small" />}
              sx={{
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                borderRadius: 2,
                py: 0.6,
                fontSize: '0.78rem',
                '&:hover': {
                  borderColor: '#EF4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                },
              }}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <Tooltip title={`${user?.name || 'Admin'} (${user?.email || 'admin@datadaddy.com'}) - Click to Sign Out`} placement="right">
            <IconButton onClick={logout} sx={{ color: '#F87171', p: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SA'}
              </Avatar>
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Drawer>
  );
};
export default Sidebar;
