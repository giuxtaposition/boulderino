import { Route } from "../domain/route/Route";

export interface RouteRepository {
  save(route: Route): void;
  update(route: Route): void;
  delete(id: string): void;
  findAll(): Route[];
  findById(id: string): Route | undefined;
}
