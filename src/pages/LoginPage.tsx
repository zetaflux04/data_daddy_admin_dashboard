import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Logo } from '../components/Logo';

export const LoginPage: React.FC = () => {
  const { login, addToast } = useAdminAuth();
  const [email, setEmail] = useState('admin@datadaddy.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('error', 'Email and password are required');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      addToast('error', err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@datadaddy.com');
    setPassword('admin123');
    addToast('info', 'Demo credentials autofilled');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0A0F1D',
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(0, 82, 255, 0.22) 0px, transparent 45%),
          radial-gradient(circle at 85% 75%, rgba(6, 182, 212, 0.18) 0px, transparent 50%)
        `,
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          p: { xs: 2, sm: 3.5 },
          borderRadius: 3.5,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0 }}>
          {/* Official DataDaddy Logo */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0, 82, 255, 0.1)',
              mb: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Logo variant="full" height={48} />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              textAlign: 'center',
              color: '#0F172A',
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Admin Control Portal
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748B',
              textAlign: 'center',
              mb: 3.5,
            }}
          >
            Cross-tenant governance, financial analytics & repair tracking
          </Typography>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.75 }}
              >
                Admin Email Address
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="admin@datadaddy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.75 }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffRoundedIcon fontSize="small" />
                          ) : (
                            <VisibilityRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              endIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <ArrowForwardRoundedIcon fontSize="small" />
                )
              }
              sx={{
                py: 1.25,
                mt: 1,
                fontSize: '0.92rem',
                borderRadius: 2.5,
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
            </Button>
          </Box>

          {/* Quick Demo Credentials Autofill Pill */}
          <Divider sx={{ width: '100%', my: 3 }} />

          <Button
            variant="text"
            size="small"
            onClick={handleFillDemo}
            startIcon={<AutoAwesomeRoundedIcon sx={{ color: 'secondary.main' }} />}
            sx={{
              color: 'primary.main',
              fontSize: '0.78rem',
              fontWeight: 600,
              bgcolor: 'rgba(0, 82, 255, 0.05)',
              px: 2,
              py: 0.75,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(0, 82, 255, 0.1)',
              },
            }}
          >
            Autofill Demo Credentials (admin@datadaddy.com / admin123)
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
export default LoginPage;
