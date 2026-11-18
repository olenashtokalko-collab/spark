import type { StorybookConfig } from '@storybook/react-vite';

// Spark's Health system (18 Nov, after the consistency audit): the tokens and components the portal uses, in Health's
// theme. Stories live in src/stories.
const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: { name: '@storybook/react-vite', options: {} },
  staticDirs: ['../public'],
  docs: { autodocs: false },
};
export default config;
