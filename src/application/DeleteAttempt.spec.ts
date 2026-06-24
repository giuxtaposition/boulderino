import { beforeEach, describe, expect, it } from "vitest";
import { Attempt } from "../domain/route/Attempt";
import { Route } from "../domain/route/Route";
import { InMemoryRouteRepository } from "../infrastructure/route/InMemoryRouteRepository";
import { DeleteAttempt } from "./DeleteAttempt";

const photo = {
  url: "https://example.com/photo.jpg",
  width: 800,
  height: 600,
};

const buildRoute = (): Route =>
  Route.create({
    name: "Crimpy",
    discipline: "bouldering",
    grade: { systemId: "YDS", name: "5.10a" },
    photo,
  });

describe("DeleteAttempt", () => {
  let repository: InMemoryRouteRepository;
  let useCase: DeleteAttempt;

  beforeEach(() => {
    repository = new InMemoryRouteRepository();
    useCase = new DeleteAttempt(repository);
  });

  it("should remove the matching attempt from the route", () => {
    const route = buildRoute();
    const attempt = Attempt.create({ outcome: "fell" });
    repository.save(Route.addAttempt(route, attempt));

    useCase.execute({ routeId: route.id.value, attemptId: attempt.id });

    expect(repository.findById(route.id.value)?.attempts).toEqual([]);
  });

  it("should preserve other attempts on the route", () => {
    const route = buildRoute();
    const a = Attempt.create({ outcome: "fell" });
    const b = Attempt.create({ outcome: "sent" });
    repository.save(Route.addAttempt(Route.addAttempt(route, a), b));

    useCase.execute({ routeId: route.id.value, attemptId: a.id });

    expect(repository.findById(route.id.value)?.attempts).toEqual([b]);
  });

  it("should throw when the route does not exist", () => {
    expect(() =>
      useCase.execute({ routeId: "missing", attemptId: "x" }),
    ).toThrow('Route "missing" not found');
  });

  it("should throw when the attempt does not exist", () => {
    const route = buildRoute();
    repository.save(route);

    expect(() =>
      useCase.execute({ routeId: route.id.value, attemptId: "missing" }),
    ).toThrow('Attempt "missing" not found on route');
  });
});
