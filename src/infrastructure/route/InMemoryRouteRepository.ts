import { RouteRepository } from "../../application/RouteRepository";
import { Route } from "../../domain/route/Route";

export class InMemoryRouteRepository implements RouteRepository {
  private readonly routes: Route[] = [];

  public save(route: Route): void {
    this.routes.push(route);
  }

  public update(route: Route): void {
    const index = this.routes.findIndex((r) => r.id.value === route.id.value);
    if (index === -1) {
      throw new Error(`Route "${route.id.value}" not found`);
    }
    this.routes[index] = route;
  }

  public findAll(): Route[] {
    return [...this.routes];
  }

  public findById(id: string): Route | undefined {
    return this.routes.find((route) => route.id.value === id);
  }
}
