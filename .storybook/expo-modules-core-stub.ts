export class CodedError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class UnavailabilityError extends CodedError {
  constructor(moduleName: string, propertyName: string) {
    super(
      'ERR_UNAVAILABLE',
      `The method or property ${moduleName}.${propertyName} is not available on web.`,
    );
  }
}

export class EventEmitter {
  addListener() {
    return { remove() {} };
  }
  removeAllListeners() {}
  removeListener() {}
  removeSubscription() {}
  emit() {}
}

export class NativeModule extends EventEmitter {}
export class SharedObject extends EventEmitter {}
export class SharedRef extends EventEmitter {}

export const Platform = { OS: 'web' as const };

export const NativeModulesProxy = new Proxy(
  {},
  {
    get: () => new Proxy({}, { get: () => () => undefined }),
  },
);

export function requireNativeModule(): never {
  throw new Error('requireNativeModule is not available in Storybook');
}

export function requireOptionalNativeModule(): null {
  return null;
}

export function requireNativeViewManager(): null {
  return null;
}

export function registerWebModule<T extends new () => unknown>(
  moduleImplementation: T,
): InstanceType<T> {
  return new moduleImplementation() as InstanceType<T>;
}

export async function reloadAppAsync(): Promise<void> {}

export function installOnUIRuntime(): void {}

export const PermissionStatus = {
  GRANTED: 'granted',
  UNDETERMINED: 'undetermined',
  DENIED: 'denied',
} as const;

export function createPermissionHook(): () => [unknown, () => Promise<unknown>, () => Promise<unknown>] {
  return () => [null, async () => null, async () => null];
}

export function uuidv4(): string {
  return globalThis.crypto?.randomUUID?.() ?? '00000000-0000-0000-0000-000000000000';
}

export const uuid = { v4: uuidv4, v5: () => uuidv4() };
