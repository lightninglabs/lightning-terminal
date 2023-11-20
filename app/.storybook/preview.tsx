import React from 'react';
import { Preview } from '@storybook/react';
import '../src/App.scss';
import '../src/i18n';
import StoryWrapper from '../src/__stories__/StoryWrapper';

/**
 * adds a common wrapper component around all stories to:
 *  - set the background color
 *  - include the theme & store providers
 *  - use Storybook parameters to customize the width of the wrapper
 */

const preview: Preview = {
  decorators: [
    (StoryFn, ctx) => (
      <StoryWrapper
        centered={ctx.parameters.centered}
        contained={ctx.parameters.contained}
      >
        <StoryFn {...ctx} />
      </StoryWrapper>
    ),
  ],
};

export default preview;
