import React from 'react';
import emotionStyled, { CreateStyled } from '@emotion/styled/macro';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';

const theme = {
  fonts: {
    light: "'OpenSans Light'",
    regular: "'OpenSans Regular'",
    semiBold: "'OpenSans SemiBold'",
    bold: "'OpenSans Bold'",
    extraBold: "'OpenSans ExtraBold'",
  },
  sizes: {
    s: '14px',
    m: '18px',
    l: '22px',
    xl: '27px',
  },
  colors: {
    blue: '#252f4a',
    darkBlue: '#212133',
    gray: '#848a99',
    white: '#ffffff',
    whitish: '#f5f5f5',
    pink: '#f5406e',
    tileBack: 'rgba(245,245,245,0.04)',
  },
};

export const styled = emotionStyled as CreateStyled<typeof theme>;

export const ThemeProvider: React.FC = ({ children }) => {
  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>;
};
