import React from 'react';
import emotionStyled, { CreateStyled } from '@emotion/styled/macro';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';

export interface Theme {
  fonts: {
    open: {
      light: string;
      regular: string;
      semiBold: string;
      bold: string;
      extraBold: string;
    };
    work: {
      light: string;
      medium: string;
      semiBold: string;
    };
  };
  sizes: {
    xxs: string;
    xs: string;
    s: string;
    m: string;
    l: string;
    xl: string;
    xxl: string;
  };
  colors: {
    blue: string;
    darkBlue: string;
    gray: string;
    darkGray: string;
    white: string;
    offWhite: string;
    pink: string;
    green: string;
    yellow: string;
    purple: string;
    overlay: string;
    gradient: string;
  };
}

const theme: Theme = {
  fonts: {
    open: {
      light: "'OpenSans Light'",
      regular: "'OpenSans Regular'",
      semiBold: "'OpenSans SemiBold'",
      bold: "'OpenSans Bold'",
      extraBold: "'OpenSans ExtraBold'",
    },
    work: {
      light: "'WorkSans Light'",
      medium: "'WorkSans Medium'",
      semiBold: "'WorkSans SemiBold'",
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
    green: '#46E80E',
    yellow: '#fff917',
    purple: '#57038d',
    overlay: 'rgba(245,245,245,0.04)',
    gradient: 'linear-gradient(325.53deg, #252F4A 0%, #46547B 100%);',
  },
};

export const styled = emotionStyled as CreateStyled<Theme>;

export const ThemeProvider: React.FC = ({ children }) => {
  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>;
};
