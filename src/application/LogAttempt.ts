import { Attempt, AttemptOutcome } from "../domain/route/Attempt";
import { Hold } from "../domain/route/Hold";
import { Route } from "../domain/route/Route";
import { RouteRepository } from "./RouteRepository";

export interface LogAttemptInput {
  readonly routeId: string;
  readonly outcome: AttemptOutcome;
  readonly date?: Date;
  readonly notes?: string | null;
  readonly fallHolds?: readonly Hold[];
}

export class LogAttempt {
  constructor(private readonly repository: RouteRepository) {}

  public execute(input: LogAttemptInput): Attempt {
    const route = this.repository.findById(input.routeId);
    if (!route) {
      throw new Error(`Route "${input.routeId}" not found`);
    }
    const attempt = Attempt.create({
      date: input.date,
      outcome: input.outcome,
      notes: input.notes,
      fallHolds: input.fallHolds,
    });
    const updated = Route.addAttempt(route, attempt);
    this.repository.update(updated);
    return attempt;
  }
}
