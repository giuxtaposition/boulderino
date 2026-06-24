import { describe, expect, it } from "vitest";
import { Attempt } from "./Attempt";
import { Hold } from "./Hold";
import { Route, RouteInput } from "./Route";

const samplePoints = [
  { x: 0.1, y: 0.1 },
  { x: 0.2, y: 0.1 },
  { x: 0.2, y: 0.2 },
];

const validInput: RouteInput = {
  name: "Crimpy Crack",
  description: "  thin face on small holds  ",
  tags: ["overhang", "  crimps  ", "", "crimps"],
  discipline: "bouldering",
  grade: {
    systemId: "system1",
    name: "green",
  },
  photo: {
    url: "https://example.com/photo.jpg",
    width: 800,
    height: 600,
  },
};

describe("Route", () => {
  it("should create a new route with the provided fields", () => {
    const route = Route.create(validInput);

    expect(route.id).toBeDefined();
    expect(route.name).toBe("Crimpy Crack");
    expect(route.description).toBe("thin face on small holds");
    expect(route.tags).toEqual(["overhang", "crimps"]);
    expect(route.discipline).toBe(validInput.discipline);
    expect(route.grade).toEqual(validInput.grade);
    expect(route.photo).toEqual(validInput.photo);
  });

  it("should default description to null when omitted", () => {
    const route = Route.create({ ...validInput, description: undefined });

    expect(route.description).toBeNull();
  });

  it("should default tags to an empty array when omitted", () => {
    const route = Route.create({ ...validInput, tags: undefined });

    expect(route.tags).toEqual([]);
  });

  it("should throw when the route name is empty", () => {
    expect(() => Route.create({ ...validInput, name: "   " })).toThrow(
      "Route name cannot be empty",
    );
  });

  it("should set createdAt to a valid date", () => {
    const route = Route.create(validInput);

    expect(route.createdAt).toBeInstanceOf(Date);
    expect(isNaN(route.createdAt.getTime())).toBe(false);
  });

  it("should create a route with a unique id", () => {
    const a = Route.create(validInput);
    const b = Route.create(validInput);

    expect(a.id).not.toBe(b.id);
  });

  it("should default holds to an empty array when omitted", () => {
    const route = Route.create(validInput);

    expect(route.holds).toEqual([]);
    expect(Object.isFrozen(route.holds)).toBe(true);
  });

  it("should accept provided holds", () => {
    const hold = Hold.create({ color: "#FF0000", points: samplePoints });
    const route = Route.create({ ...validInput, holds: [hold] });

    expect(route.holds).toHaveLength(1);
    expect(route.holds[0]).toBe(hold);
  });

  it("should restore holds from a snapshot", () => {
    const route = Route.restore({
      id: "route-1",
      name: "x",
      description: null,
      tags: [],
      discipline: "bouldering",
      grade: { systemId: "s", name: "g" },
      photo: { url: "u", width: 1, height: 1 },
      createdAt: new Date().toISOString(),
      holds: [{ id: "hold-1", color: "#FF0000", points: samplePoints }],
    });

    expect(route.holds).toHaveLength(1);
    expect(route.holds[0].id).toBe("hold-1");
  });

  it("should default holds to empty when restoring snapshot without holds", () => {
    const route = Route.restore({
      id: "route-1",
      name: "x",
      description: null,
      tags: [],
      discipline: "bouldering",
      grade: { systemId: "s", name: "g" },
      photo: { url: "u", width: 1, height: 1 },
      createdAt: new Date().toISOString(),
    });

    expect(route.holds).toEqual([]);
  });

  it("should return a new route with replaced holds via withHolds", () => {
    const route = Route.create(validInput);
    const hold = Hold.create({ color: "#FF0000", points: samplePoints });
    const updated = Route.withHolds(route, [hold]);

    expect(updated).not.toBe(route);
    expect(updated.id).toBe(route.id);
    expect(updated.holds).toHaveLength(1);
    expect(route.holds).toEqual([]);
  });

  it("should default attempts to an empty frozen array", () => {
    const route = Route.create(validInput);

    expect(route.attempts).toEqual([]);
    expect(Object.isFrozen(route.attempts)).toBe(true);
  });

  it("should append an attempt without mutating the source route", () => {
    const route = Route.create(validInput);
    const attempt = Attempt.create({ outcome: "fell", notes: "slip" });

    const updated = Route.addAttempt(route, attempt);

    expect(updated).not.toBe(route);
    expect(updated.id).toBe(route.id);
    expect(updated.attempts).toHaveLength(1);
    expect(updated.attempts[0]).toBe(attempt);
    expect(route.attempts).toEqual([]);
  });

  it("should remove an attempt by id without mutating the source route", () => {
    const route = Route.create(validInput);
    const a = Attempt.create({ outcome: "fell" });
    const b = Attempt.create({ outcome: "sent" });
    const withTwo = Route.addAttempt(Route.addAttempt(route, a), b);

    const updated = Route.removeAttempt(withTwo, a.id);

    expect(updated).not.toBe(withTwo);
    expect(updated.attempts).toEqual([b]);
    expect(withTwo.attempts).toHaveLength(2);
  });

  it("should throw when removing an attempt that does not exist", () => {
    const route = Route.create(validInput);

    expect(() => Route.removeAttempt(route, "missing")).toThrow(
      'Attempt "missing" not found on route',
    );
  });

  it("should restore attempts from a snapshot", () => {
    const route = Route.restore({
      id: "route-1",
      name: "x",
      description: null,
      tags: [],
      discipline: "bouldering",
      grade: { systemId: "s", name: "g" },
      photo: { url: "u", width: 1, height: 1 },
      createdAt: new Date().toISOString(),
      attempts: [
        {
          id: "attempt-1",
          date: "2026-06-23T10:00:00.000Z",
          outcome: "sent",
          notes: null,
          fallHold: null,
        },
      ],
    });

    expect(route.attempts).toHaveLength(1);
    expect(route.attempts[0].id).toBe("attempt-1");
  });
});
