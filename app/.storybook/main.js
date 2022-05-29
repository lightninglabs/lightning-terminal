module.exports = {
  stories: [
    // display the Loop page as the first story int he list
    '../src/__stories__/LoopPage.stories.tsx',
    '../src/**/*.stories.(ts|tsx|js|jsx|mdx)',
  ],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
      },
    },
  ],
  core: {
    builder: 'webpack5'
  }
};
