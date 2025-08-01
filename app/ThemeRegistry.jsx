'use client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Vazirmatn, Arial, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.4
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem'
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.5rem'
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.25rem'
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.8
    }
  },
  palette: {
    primary: {
      main: '#2477F3',
      light: '#D2E7FF',
      dark: '#1A56DB'
    },
    secondary: {
      main: '#66DE93',
      light: '#E1F5E4',
      dark: '#4dca80'
    },
    error: {
      main: '#FF6B6B'
    },
    background: {
      default: '#F9FAFB'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 'bold',
          textTransform: 'none',
          fontSize: '1rem',
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-3px)'
          }
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16
        }
      }
    }
  },
  shape: {
    borderRadius: 16
  }
});

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

export default function ThemeRegistry({ children }) {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}