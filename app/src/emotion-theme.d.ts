import '@emotion/react';

declare module '@emotion/react' {
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
      gold: string;
      purple: string;
      overlay: string;
      gradient: string;
      lightBlue: string;
      paleBlue: string;
      lightningRed: string;
      lightningGray: string;
      lightningNavy: string;
      iris: string;
    };
    breakpoints: {
      s: string;
      m: string;
      l: string;
      xl: string;
    };
  }
}
