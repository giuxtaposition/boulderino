import { RouteRepository } from "./RouteRepository";

export interface DeleteRouteInput {
  readonly routeId: string;
}

export class DeleteRoute {
  constructor(private readonly repository: RouteRepository) {}

  public execute(input: DeleteRouteInput): void {
    const route = this.repository.findById(input.routeId);
    if (!route) {
      throw new Error(`Route "${input.routeId}" not found`);
    }
    this.repository.delete(input.routeId);
  }
}
