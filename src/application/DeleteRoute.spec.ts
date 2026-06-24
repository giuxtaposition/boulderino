import { beforeEach, describe, expect, it } from "vitest";
import { Route } from "../domain/route/Route";
import { InMemoryRouteRepository } from "../infrastructure/route/InMemoryRouteRepository";
import { DeleteRoute } from "./DeleteRoute";

const buildRoute = (): Route =>
  Route.create({
    name: "Crimpy",
    discipline: "bouldering",
    grade: { systemId: "YDS", name: "5.10a" },
    photo: { url: "https://example.com/photo.jpg", width: 800, height: 600 },
  });

describe("DeleteRoute", () => {
  let repository: InMemoryRouteRepository;
  let useCase: DeleteRoute;

  beforeEach(() => {
    repository = new InMemoryRouteRepository();
    useCase = new DeleteRoute(repository);
  });

  it("should remove the matching route from the repository", () => {
    const route = buildRoute();
    repository.save(route);

    useCase.execute({ routeId: route.id.value });

    expect(repository.findById(route.id.value)).toBeUndefined();
  });

  it("should leave other routes untouched", () => {
    const first = buildRoute();
    const second = buildRoute();
    repository.save(first);
    repository.save(second);

    useCase.execute({ routeId: first.id.value });

    expect(repository.findAll()).toEqual([second]);
  });

  it("should throw when the route does not exist", () => {
    expect(() => useCase.execute({ routeId: "missing" })).toThrow(
      'Route "missing" not found',
    );
  });
});
