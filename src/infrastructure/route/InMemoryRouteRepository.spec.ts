import { beforeEach, describe, expect, it } from "vitest";
import { Route } from "../../domain/route/Route";
import { InMemoryRouteRepository } from "./InMemoryRouteRepository";

const buildRoute = (): Route =>
  Route.create({
    name: "Test Route",
    discipline: "bouldering",
    grade: { systemId: "YDS", name: "5.10a" },
    photo: {
      url: "https://example.com/photo.jpg",
      width: 800,
      height: 600,
    },
  });

describe("InMemoryRouteRepository", () => {
  let repository: InMemoryRouteRepository;

  beforeEach(() => {
    repository = new InMemoryRouteRepository();
  });

  it("should persist a route", () => {
    const route = buildRoute();

    repository.save(route);

    expect(repository.findAll()).toEqual([route]);
  });

  it("should preserve insertion order across multiple saves", () => {
    const first = buildRoute();
    const second = buildRoute();

    repository.save(first);
    repository.save(second);

    expect(repository.findAll()).toEqual([first, second]);
  });

  it("should return an isolated snapshot from findAll", () => {
    const route = buildRoute();
    repository.save(route);

    const snapshot = repository.findAll();
    snapshot.pop();

    expect(repository.findAll()).toEqual([route]);
  });

  it("should return an empty list when no routes have been saved", () => {
    expect(repository.findAll()).toEqual([]);
  });

  it("should return a saved route by id", () => {
    const route = buildRoute();

    repository.save(route);

    expect(repository.findById(route.id.value)).toBe(route);
  });

  it("should return undefined when no route matches the id", () => {
    expect(repository.findById("missing")).toBeUndefined();
  });

  it("should replace an existing route via update", () => {
    const route = buildRoute();
    repository.save(route);
    const replaced = Route.withHolds(route, []);

    repository.update(replaced);

    expect(repository.findById(route.id.value)).toBe(replaced);
    expect(repository.findAll()).toHaveLength(1);
  });

  it("should throw when updating a route that does not exist", () => {
    const route = buildRoute();

    expect(() => repository.update(route)).toThrow(
      `Route "${route.id.value}" not found`,
    );
  });
});
