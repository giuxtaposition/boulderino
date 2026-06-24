import path from 'node:path';

import type { StorybookConfig } from '@storybook/react-native-web-vite';

const expoRouterStub = path.resolve(process.cwd(), '.storybook/expo-router-stub.tsx');
const expoModulesCoreStub = path.resolve(
  process.cwd(),
  '.storybook/expo-modules-core-stub.ts',
);
const assetRegistryStub = path.resolve(
  process.cwd(),
  '.storybook/asset-registry-stub.ts',
);
const samSegmenterStub = path.resolve(
  process.cwd(),
  '.storybook/sam-segmenter-stub.ts',
);
const emptyAssetStub = path.resolve(
  process.cwd(),
  '.storybook/empty-asset-stub.ts',
);
const skiaStub = path.resolve(process.cwd(), '.storybook/skia-stub.tsx');
const colorSchemeStub = path.resolve(
  process.cwd(),
  '.storybook/use-color-scheme-stub.ts',
);

type AliasEntry = { find: string | RegExp; replacement: string };

const stubAliases: AliasEntry[] = [
  { find: 'expo-router', replacement: expoRouterStub },
  { find: 'expo-modules-core', replacement: expoModulesCoreStub },
  {
    find: /^@\/infrastructure\/segmentation\/SamSegmenter(?:\.web)?$/,
    replacement: samSegmenterStub,
  },
  { find: /\.onnx$/, replacement: emptyAssetStub },
  { find: '@shopify/react-native-skia', replacement: skiaStub },
  {
    find: /^@\/hooks\/use-color-scheme(?:\.web)?$/,
    replacement: colorSchemeStub,
  },
];

const ASSET_REGISTRY_RE = /(?:^|\/)react-native(?:-web)?\/Libraries\/Image\/AssetRegistry$/;

const resolveStubsPlugin = {
  name: 'boulderino-storybook-stubs',
  enforce: 'pre' as const,
  resolveId(source: string) {
    if (ASSET_REGISTRY_RE.test(source)) {
      return assetRegistryStub;
    }
    return null;
  },
};

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {},
  },
  viteFinal: async (viteConfig) => {
    viteConfig.resolve = viteConfig.resolve ?? {};
    const existing = viteConfig.resolve.alias;
    const existingArray: AliasEntry[] = Array.isArray(existing)
      ? (existing as AliasEntry[])
      : Object.entries(existing ?? {}).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        }));
    viteConfig.resolve.alias = [...stubAliases, ...existingArray];
    viteConfig.plugins = viteConfig.plugins ?? [];
    viteConfig.plugins.unshift(resolveStubsPlugin);
    return viteConfig;
  },
};

export default config;
