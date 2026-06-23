import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { ContainerProvider } from '@/composition/Container';

const CANVASKIT_VERSION = '0.41.0';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [skiaReady, setSkiaReady] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let alive = true;
    import('@shopify/react-native-skia/lib/module/web')
      .then(({ LoadSkiaWeb }) =>
        LoadSkiaWeb({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${CANVASKIT_VERSION}/bin/full/${file}`,
        }),
      )
      .then(() => {
        if (alive) setSkiaReady(true);
      })
      .catch(() => {
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
