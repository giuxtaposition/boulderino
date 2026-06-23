import { describe, expect, it } from "vitest";
import { Route, RouteInput } from "./Route";

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
});
