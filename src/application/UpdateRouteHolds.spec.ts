import { beforeEach, describe, expect, it } from "vitest";
import { Hold } from "../domain/route/Hold";
import { Route } from "../domain/route/Route";
import { InMemoryRouteRepository } from "../infrastructure/route/InMemoryRouteRepository";
import { UpdateRouteHolds } from "./UpdateRouteHolds";

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

const buildHold = () =>
  Hold.create({
    color: "#FF0000",
    points: [
      { x: 0.1, y: 0.1 },
      { x: 0.3, y: 0.1 },
      { x: 0.3, y: 0.3 },
    ],
  });

describe("UpdateRouteHolds", () => {
  let repository: InMemoryRouteRepository;
  let useCase: UpdateRouteHolds;

  beforeEach(() => {
    repository = new InMemoryRouteRepository();
    useCase = new UpdateRouteHolds(repository);
  });

  it("should replace the holds on the matching route", () => {
    const route = buildRoute();
    repository.save(route);
    const hold = buildHold();

    const updated = useCase.execute({ routeId: route.id.value, holds: [hold] });

    expect(updated.holds).toEqual([hold]);
    expect(updated.id.value).toBe(route.id.value);
  });

  it("should persist the updated holds via the repository", () => {
    const route = buildRoute();
    repository.save(route);
    const hold = buildHold();

    useCase.execute({ routeId: route.id.value, holds: [hold] });

    const reloaded = repository.findById(route.id.value);
    expect(reloaded?.holds).toEqual([hold]);
  });

  it("should clear holds when given an empty list", () => {
    const route = Route.create({
      name: "x",
      discipline: "bouldering",
      grade: { systemId: "YDS", name: "5.10a" },
      photo,
      holds: [buildHold()],
    });
    repository.save(route);

    useCase.execute({ routeId: route.id.value, holds: [] });

    expect(repository.findById(route.id.value)?.holds).toEqual([]);
  });

  it("should throw when the route does not exist", () => {
    expect(() =>
      useCase.execute({ routeId: "missing", holds: [buildHold()] }),
    ).toThrow('Route "missing" not found');
  });
});
