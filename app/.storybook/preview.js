import React from 'react';
import { addDecorator } from '@storybook/react';
import { ThemeProvider } from 'components/theme';

addDecorator(storyFn => <ThemeProvider>{storyFn()}</ThemeProvider>);
