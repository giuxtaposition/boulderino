import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

const CANVASKIT_VERSION = '0.41.0';

export async function loadSkia(): Promise<void> {
  await LoadSkiaWeb({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${CANVASKIT_VERSION}/bin/full/${file}`,
  });
}
