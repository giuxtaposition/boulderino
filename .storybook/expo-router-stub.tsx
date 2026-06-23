export type Href = string;

type Router = {
  push: (href: Href) => void;
  replace: (href: Href) => void;
  back: () => void;
  navigate: (href: Href) => void;
  setParams: (params: Record<string, string>) => void;
};

const noopRouter: Router = {
  push: () => {},
  replace: () => {},
  back: () => {},
  navigate: () => {},
  setParams: () => {},
};

export const useRouter = (): Router => noopRouter;

export const usePathname = (): string => '/';

export const useLocalSearchParams = (): Record<string, string> => ({});

export const useSegments = (): string[] => [];

export const Link = ({ children }: { children: unknown }) => children as never;

export const router = noopRouter;

export const Stack = (() => null) as unknown as (props: unknown) => null;
export const Slot = (() => null) as unknown as (props: unknown) => null;
export const Redirect = (() => null) as unknown as (props: unknown) => null;
