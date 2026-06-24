import { useEffect } from 'react';
import { View } from 'react-native';
import type { Preview } from '@storybook/react';

import { Colors } from '../src/constants/theme';
import {
  setStorybookColorScheme,
  type ColorScheme,
} from './use-color-scheme-stub';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'Color scheme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const scheme = (context.globals.theme as ColorScheme) ?? 'light';
      const palette = Colors[scheme];

      useEffect(() => {
        setStorybookColorScheme(scheme);
        if (typeof document !== 'undefined') {
          document.documentElement.style.colorScheme = scheme;
          document.body.style.backgroundColor = palette.background;
        }
      }, [scheme, palette.background]);

      return (
        <View
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: palette.background,
            minHeight: '100%',
          }}
        >
          <Story />
        </View>
      );
    },
  ],
};

export default preview;
