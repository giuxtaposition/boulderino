import { forwardRef } from 'react';
import { View } from 'react-native';

type AnyProps = Record<string, unknown>;

const NoopView = forwardRef<View, AnyProps>(({ children, ...rest }, ref) => (
  <View ref={ref} {...(rest as object)}>
    {children as never}
  </View>
));
NoopView.displayName = 'SkiaStubView';

const NoopComponent = ({ children }: AnyProps) =>
  (children as JSX.Element | null) ?? null;

export const Canvas = NoopView;
export const Group = NoopComponent;
export const Path = NoopComponent;
export const Image = NoopComponent;

const noopPath = {
  moveTo() {},
  lineTo() {},
  close() {},
  addCircle() {},
};

export const Skia = {
  Path: { Make: () => noopPath },
  Surface: { Make: () => null },
  Paint: () => ({}),
};

export function useImage(): null {
  return null;
}
