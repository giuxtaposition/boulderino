import { Route } from "../domain/route/Route";

export interface RouteRepository {
  save(route: Route): void;
  update(route: Route): void;
  findAll(): Route[];
  findById(id: string): Route | undefined;
}
