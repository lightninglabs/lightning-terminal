import React from 'react';
import { Theme, ThemeProvider as EmotionThemeProvider } from '@emotion/react';

const fallbackFont =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const theme: Theme = {
  fonts: {
    open: {
      light: `${fallbackFont}`,
      regular: `${fallbackFont}`,
      semiBold: `${fallbackFont}`,
      bold: `${fallbackFont}`,
      extraBold: `${fallbackFont}`,
    },
    work: {
      light: `${fallbackFont}`,
      medium: `${fallbackFont}`,
      semiBold: `${fallbackFont}`,
    },
  },
  sizes: {
    xxs: '11px',
    xs: '13px',
    s: '14px',
    m: '15px',
    l: '18px',
    xl: '24px',
    xxl: '36px',
  },
  colors: {
    blue: '#131620',
    darkBlue: '#0d1017',
    gray: '#6b7280',
    darkGray: '#4b5563',
    white: '#ffffff',
    offWhite: '#e5e7eb',
    pink: '#f43f5e',
    green: '#10B981',
    gold: '#F59E0B',
    purple: '#8b5cf6',
    overlay: 'rgba(255,255,255,0.04)',
    gradient: 'linear-gradient(135deg, #131620 0%, #1e2433 100%)',
    lightBlue: '#1e2433',
    paleBlue: '#252d3d',
    lightningRed: '#EF4444',
    lightningGray: '#9ca3af',
    lightningNavy: '#0d1017',
    iris: '#6366f1',
  },
  breakpoints: {
    s: 'min-width: 576px',
    m: 'min-width: 768px',
    l: 'min-width: 992px',
    xl: 'min-width: 1200px',
  },
};

export const ThemeProvider: React.FC = ({ children }) => {
  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>;
};
