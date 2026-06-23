import { Discipline } from "../domain/route/Discipline";
import { Hold } from "../domain/route/Hold";
import { Photo } from "../domain/route/Photo";
import { Route } from "../domain/route/Route";
import { GradingSystemRegistry } from "./GradingSystemRegistry";
import { RouteRepository } from "./RouteRepository";

export interface AddRouteInput {
  readonly name: string;
  readonly description?: string | null;
  readonly tags?: readonly string[];
  readonly discipline: Discipline;
  readonly gradingSystemName: string;
  readonly gradeValue: string;
  readonly photo: Photo;
  readonly holds?: readonly Hold[];
}

export class AddRoute {
  constructor(
    private readonly registry: GradingSystemRegistry,
    private readonly repository: RouteRepository,
  ) {}

  public execute(input: AddRouteInput): Route {
    const system = this.registry.requireByName(input.gradingSystemName);
    const grade = system.gradeFor(input.gradeValue);
    const route = Route.create({
      name: input.name,
      description: input.description,
      tags: input.tags,
      discipline: input.discipline,
      grade,
      photo: input.photo,
      holds: input.holds,
    });
    this.repository.save(route);
    return route;
  }
}
