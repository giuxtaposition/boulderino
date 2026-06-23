import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AddGradingSystem } from '@/application/AddGradingSystem';
import { AddRoute } from '@/application/AddRoute';
import { GradingSystemRegistry } from '@/application/GradingSystemRegistry';
import { RouteRepository } from '@/application/RouteRepository';
import { UpdateRouteHolds } from '@/application/UpdateRouteHolds';
import { AsyncStorageGradingSystemRegistry } from '@/infrastructure/grading/AsyncStorageGradingSystemRegistry';
import { AsyncStorageRouteRepository } from '@/infrastructure/route/AsyncStorageRouteRepository';

export interface Container {
  gradingSystemRegistry: GradingSystemRegistry;
  routeRepository: RouteRepository;
  addGradingSystem: AddGradingSystem;
  addRoute: AddRoute;
  updateRouteHolds: UpdateRouteHolds;
}

export async function createContainer(): Promise<Container> {
  const [gradingSystemRegistry, routeRepository] = await Promise.all([
    AsyncStorageGradingSystemRegistry.load(),
    AsyncStorageRouteRepository.load(),
  ]);
  return {
    gradingSystemRegistry,
    routeRepository,
    addGradingSystem: new AddGradingSystem(gradingSystemRegistry),
    addRoute: new AddRoute(gradingSystemRegistry, routeRepository),
    updateRouteHolds: new UpdateRouteHolds(routeRepository),
  };
}

const ContainerContext = createContext<Container | null>(null);

export function ContainerProvider({
  children,
  value,
}: {
  children: ReactNode;
  value?: Container;
}) {
  const [container, setContainer] = useState<Container | null>(value ?? null);

  useEffect(() => {
    if (value) {
      setContainer(value);
      return;
    }
    let alive = true;
    createContainer().then((next) => {
      if (alive) setContainer(next);
    });
    return () => {
      alive = false;
    };
  }, [value]);

  if (!container) {
    return (
      <View style={styles.loading} testID="container-loading">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ContainerContext.Provider value={container}>
      {children}
    </ContainerContext.Provider>
  );
}

export function useContainer(): Container {
  const container = useContext(ContainerContext);
  if (!container) {
    throw new Error('useContainer must be used within ContainerProvider');
  }
  return container;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
