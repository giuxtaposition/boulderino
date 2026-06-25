import { beforeEach, describe, expect, it } from "vitest";
import { Hold } from "../domain/route/Hold";
import { Route } from "../domain/route/Route";
import { InMemoryRouteRepository } from "../infrastructure/route/InMemoryRouteRepository";
import { LogAttempt } from "./LogAttempt";

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

describe("LogAttempt", () => {
  let repository: InMemoryRouteRepository;
  let useCase: LogAttempt;

  beforeEach(() => {
    repository = new InMemoryRouteRepository();
    useCase = new LogAttempt(repository);
  });

  it("should append an attempt to the matching route", () => {
    const route = buildRoute();
    repository.save(route);

    const attempt = useCase.execute({
      routeId: route.id.value,
      outcome: "sent",
    });

    expect(attempt.outcome).toBe("sent");
    expect(repository.findById(route.id.value)?.attempts).toHaveLength(1);
  });

  it("should persist optional notes and fall holds", () => {
    const route = buildRoute();
    repository.save(route);
    const fallHold = buildHold();

    useCase.execute({
      routeId: route.id.value,
      outcome: "fell",
      notes: "wet hold",
      fallHolds: [fallHold],
    });

    const stored = repository.findById(route.id.value)?.attempts[0];
    expect(stored?.notes).toBe("wet hold");
    expect(stored?.fallHolds[0]?.id).toBe(fallHold.id);
  });

  it("should accept a custom date", () => {
    const route = buildRoute();
    repository.save(route);
    const date = new Date("2026-01-15T08:00:00Z");

    const attempt = useCase.execute({
      routeId: route.id.value,
      outcome: "flash",
      date,
    });

    expect(attempt.date).toEqual(date);
  });

  it("should preserve previously logged attempts", () => {
    const route = buildRoute();
    repository.save(route);
    useCase.execute({ routeId: route.id.value, outcome: "fell" });
    useCase.execute({ routeId: route.id.value, outcome: "sent" });

    expect(repository.findById(route.id.value)?.attempts).toHaveLength(2);
  });

  it("should throw when the route does not exist", () => {
    expect(() =>
      useCase.execute({ routeId: "missing", outcome: "sent" }),
    ).toThrow('Route "missing" not found');
  });
});
