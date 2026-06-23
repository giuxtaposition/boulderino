import AsyncStorage from "@react-native-async-storage/async-storage";

import { RouteRepository } from "../../application/RouteRepository";
import { Discipline } from "../../domain/route/Discipline";
import { HoldSnapshot } from "../../domain/route/Hold";
import { Photo } from "../../domain/route/Photo";
import { Route } from "../../domain/route/Route";

const STORAGE_KEY = "boulderino:routes";

type Snapshot = {
  id: string;
  name: string;
  description: string | null;
  tags: readonly string[];
  discipline: Discipline;
  grade: { systemId: string; name: string };
  photo: Photo;
  createdAt: string;
  holds?: readonly HoldSnapshot[];
};

export class AsyncStorageRouteRepository implements RouteRepository {
  private readonly routes: Route[];

  private constructor(seed: Route[]) {
    this.routes = [...seed];
  }

  public static async load(): Promise<AsyncStorageRouteRepository> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new AsyncStorageRouteRepository([]);
    }
    try {
      const snapshots = JSON.parse(raw) as Snapshot[];
      const routes = snapshots.map((snapshot) =>
        Route.restore({
          ...snapshot,
          tags: snapshot.tags ?? [],
          holds: snapshot.holds ?? [],
        }),
      );
      return new AsyncStorageRouteRepository(routes);
    } catch {
      return new AsyncStorageRouteRepository([]);
    }
  }

  public save(route: Route): void {
    this.routes.push(route);
    this.persist();
  }

  public update(route: Route): void {
    const index = this.routes.findIndex((r) => r.id.value === route.id.value);
    if (index === -1) {
      throw new Error(`Route "${route.id.value}" not found`);
    }
    this.routes[index] = route;
    this.persist();
  }

  public findAll(): Route[] {
    return [...this.routes];
  }

  public findById(id: string): Route | undefined {
    return this.routes.find((route) => route.id.value === id);
  }

  private persist(): void {
    const snapshots: Snapshot[] = this.routes.map((route) => ({
      id: route.id.value,
      name: route.name,
      description: route.description,
      tags: [...route.tags],
      discipline: route.discipline,
      grade: { systemId: route.grade.systemId, name: route.grade.name },
      photo: route.photo,
      createdAt: route.createdAt.toISOString(),
      holds: route.holds.map((hold) => ({
        id: hold.id,
        color: hold.color,
        points: hold.points.map((p) => ({ x: p.x, y: p.y })),
      })),
    }));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots)).catch(() => {
      // swallow
    });
  }
}
