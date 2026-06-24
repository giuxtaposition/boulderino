import { Route } from "../domain/route/Route";
import { RouteRepository } from "./RouteRepository";

export interface DeleteAttemptInput {
  readonly routeId: string;
  readonly attemptId: string;
}

export class DeleteAttempt {
  constructor(private readonly repository: RouteRepository) {}

  public execute(input: DeleteAttemptInput): void {
    const route = this.repository.findById(input.routeId);
    if (!route) {
      throw new Error(`Route "${input.routeId}" not found`);
    }
    const updated = Route.removeAttempt(route, input.attemptId);
    this.repository.update(updated);
  }
}
