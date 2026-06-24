import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { ContainerProvider } from '@/composition/Container';
import { loadSkia } from '@/infrastructure/skia/loadSkia';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [skiaReady, setSkiaReady] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let alive = true;
    loadSkia().finally(() => {
      if (alive) setSkiaReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!skiaReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ContainerProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AppTabs />
        </ThemeProvider>
      </ContainerProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
