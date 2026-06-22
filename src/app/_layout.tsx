import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { ContainerProvider } from '@/composition/Container';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ContainerProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppTabs />
      </ThemeProvider>
    </ContainerProvider>
  );
}
