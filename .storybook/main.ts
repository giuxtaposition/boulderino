import path from 'node:path';

import type { StorybookConfig } from '@storybook/react-native-web-vite';

const stubPath = path.resolve(process.cwd(), '.storybook/expo-router-stub.tsx');

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {},
  },
  viteFinal: async (viteConfig) => {
    viteConfig.resolve = viteConfig.resolve ?? {};
    const aliases = viteConfig.resolve.alias;
    const stubAlias = { 'expo-router': stubPath };
    if (Array.isArray(aliases)) {
      aliases.push({ find: 'expo-router', replacement: stubPath });
    } else {
      viteConfig.resolve.alias = { ...(aliases ?? {}), ...stubAlias };
    }
    return viteConfig;
  },
};

export default config;
