import { Hold } from "../domain/route/Hold";
import { Route } from "../domain/route/Route";
import { RouteRepository } from "./RouteRepository";

export interface UpdateRouteHoldsInput {
  readonly routeId: string;
  readonly holds: readonly Hold[];
}

export class UpdateRouteHolds {
  constructor(private readonly repository: RouteRepository) {}

  public execute(input: UpdateRouteHoldsInput): Route {
    const route = this.repository.findById(input.routeId);
    if (!route) {
      throw new Error(`Route "${input.routeId}" not found`);
    }
    const updated = Route.withHolds(route, input.holds);
    this.repository.update(updated);
    return updated;
  }
}
