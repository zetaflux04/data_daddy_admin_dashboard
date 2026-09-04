import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  Divider,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { useAdminAuth } from '../context/AdminAuthContext';

interface TopbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, selectedShopId, setSelectedShopId, shops, logout } = useAdminAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        borderBottom: '1px solid #E2E8F0',
        zIndex: 30,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: '64px !important',
        }}
      >
        {/* Left: Sidebar Toggle + Clean Global Shop Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {onToggleSidebar && (
            <Tooltip title={isSidebarOpen ? 'Collapse menu' : 'Expand menu'}>
              <IconButton
                onClick={onToggleSidebar}
                edge="start"
                sx={{
                  color: '#475569',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 2,
                  p: 0.85,
                  '&:hover': {
                    bgcolor: '#F1F5F9',
                    color: '#0F172A',
                  },
                }}
              >
                <MenuRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Clean Shop Selector */}
          <FormControl size="small" sx={{ minWidth: 200, maxWidth: 300 }}>
            <Select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              displayEmpty
              sx={{
                fontSize: '0.82rem',
                fontWeight: 600,
                bgcolor: '#F8FAFC',
                borderRadius: 2,
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  py: 0.75,
                },
              }}
              startAdornment={<StoreRoundedIcon sx={{ color: 'text.secondary', mr: 0.75, fontSize: 18 }} />}
            >
              <MenuItem value="all" sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                🌐 All Shops
              </MenuItem>
              {shops.map((shop) => (
                <MenuItem key={shop._id} value={shop._id} sx={{ fontSize: '0.82rem' }}>
                  🏪 {shop.name} {shop.address?.city ? `(${shop.address.city})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Right: Avatar & Logged User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              p: '4px 10px 4px 6px',
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                bgcolor: '#F1F5F9',
                borderColor: '#CBD5E1',
              },
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.82rem',
                boxShadow: '0 2px 6px rgba(0, 82, 255, 0.25)',
              }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SA'}
            </Avatar>

            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: '#0F172A',
                  fontSize: '0.82rem',
                  lineHeight: 1.2,
                }}
              >
                {user?.name || 'Super Admin'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
                  fontSize: '0.72rem',
                  lineHeight: 1,
                  mt: 0.2,
                }}
              >
                {user?.email || 'admin@datadaddy.com'}
              </Typography>
            </Box>
          </Box>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  width: 230,
                  mt: 1.2,
                  p: 0.5,
                  borderRadius: 2.5,
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #E2E8F0',
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {user?.name || 'Super Admin'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {user?.email || 'admin@datadaddy.com'}
              </Typography>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem sx={{ py: 1, borderRadius: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ShieldRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Super Admin Access</Typography>
            </MenuItem>

            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1,
                borderRadius: 1.5,
                color: 'error.main',
                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <LogoutRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'error.main' }}>Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default Topbar;
