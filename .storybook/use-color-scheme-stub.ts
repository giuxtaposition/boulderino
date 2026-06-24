import { useSyncExternalStore } from 'react';

export type ColorScheme = 'light' | 'dark';

type Listener = () => void;

const listeners = new Set<Listener>();
let current: ColorScheme = 'light';

export function setStorybookColorScheme(next: ColorScheme): void {
  if (current === next) return;
  current = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ColorScheme {
  return current;
}

export function useColorScheme(): ColorScheme {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
