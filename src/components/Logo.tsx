import React from 'react';
import { Box, Typography } from '@mui/material';
import logoImg from '../assets/logo.png';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon-only';
  height?: number | string;
  showSubtitle?: boolean;
  inverted?: boolean;
  sx?: any;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  height = 36,
  showSubtitle = false,
  inverted = false,
  sx = {},
}) => {
  if (variant === 'icon-only') {
    return (
      <Box
        component="img"
        src={logoImg}
        alt="DataDaddy Mark"
        sx={{
          height: height || 32,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          ...sx,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        userSelect: 'none',
        ...sx,
      }}
    >
      <Box
        sx={{
          height: height || 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1.5,
          overflow: 'hidden',
          backgroundColor: inverted ? '#FFFFFF' : 'transparent',
          p: inverted ? 0.5 : 0,
          boxShadow: inverted ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        <Box
          component="img"
          src={logoImg}
          alt="DataDaddy Logo"
          sx={{
            height: '100%',
            width: 'auto',
            objectFit: 'contain',
            filter: inverted ? 'none' : 'none',
          }}
        />
      </Box>

      {showSubtitle && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography
              component="span"
              sx={{
                fontFamily: 'inherit',
                fontWeight: 900,
                fontSize: '1.15rem',
                letterSpacing: '-0.03em',
                color: inverted ? '#FFFFFF' : '#0F172A',
                lineHeight: 1.1,
              }}
            >
              Data
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: 'inherit',
                fontWeight: 900,
                fontSize: '1.15rem',
                letterSpacing: '-0.03em',
                color: '#0052FF',
                lineHeight: 1.1,
              }}
            >
              Daddy
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: inverted ? '#38BDF8' : '#0284C7',
              lineHeight: 1,
              mt: 0.25,
            }}
          >
            Super Admin
          </Typography>
        </Box>
      )}
    </Box>
  );
};
export default Logo;
