import React from 'react';
import { Theme, ThemeProvider as EmotionThemeProvider } from '@emotion/react';

// use the bootstrap font-families as a fallback while custom fonts are being downloaded
const fallbackFont =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

const theme: Theme = {
  fonts: {
    open: {
      light: `'OpenSans Light', ${fallbackFont}`,
      regular: `'OpenSans Regular', ${fallbackFont}`,
      semiBold: `'OpenSans SemiBold', ${fallbackFont}`,
      bold: `'OpenSans Bold', ${fallbackFont}`,
      extraBold: `'OpenSans ExtraBold', ${fallbackFont}`,
    },
    work: {
      light: `'WorkSans Light', ${fallbackFont}`,
      medium: `'WorkSans Medium', ${fallbackFont}`,
      semiBold: `'WorkSans SemiBold', ${fallbackFont}`,
    },
  },
  sizes: {
    xxs: '11px',
    xs: '14px',
    s: '16px',
    m: '18px',
    l: '22px',
    xl: '27px',
    xxl: '45px',
  },
  colors: {
    blue: '#252f4a',
    darkBlue: '#212133',
    gray: '#848a99',
    darkGray: '#6b6969ef',
    white: '#ffffff',
    offWhite: '#f5f5f5',
    pink: '#f5406e',
    green: '#10B981',
    gold: '#F59E0B',
    purple: '#57038d',
    overlay: 'rgba(245,245,245,0.04)',
    gradient: 'linear-gradient(325.53deg, #252F4A 0%, #46547B 100%);',
    lightBlue: '#384770',
    paleBlue: '#2E3A5C',
    lightningRed: '#EF4444',
    lightningGray: '#B9BDC5',
    lightningNavy: '#1D253A',
    iris: '#5D5FEF',
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
