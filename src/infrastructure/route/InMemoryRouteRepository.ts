import { RouteRepository } from "../../application/RouteRepository";
import { Route } from "../../domain/route/Route";

export class InMemoryRouteRepository implements RouteRepository {
  private readonly routes: Route[] = [];

  public save(route: Route): void {
    this.routes.push(route);
  }

  public findAll(): Route[] {
    return [...this.routes];
  }

  public findById(id: string): Route | undefined {
    return this.routes.find((route) => route.id.value === id);
  }
}
