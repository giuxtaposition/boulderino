import { describe, expect, it } from "vitest";
import { Hold } from "./Hold";

const validPoints = [
  { x: 0.1, y: 0.1 },
  { x: 0.4, y: 0.1 },
  { x: 0.4, y: 0.4 },
  { x: 0.1, y: 0.4 },
];

describe("Hold", () => {
  it("should create a hold with a generated id", () => {
    const hold = Hold.create({ color: "#FF0000", points: validPoints });

    expect(hold.id).toBeDefined();
    expect(hold.id.length).toBeGreaterThan(0);
    expect(hold.color).toBe("#FF0000");
    expect(hold.points).toEqual(validPoints);
  });

  it("should create holds with unique ids", () => {
    const a = Hold.create({ color: "#FF0000", points: validPoints });
    const b = Hold.create({ color: "#FF0000", points: validPoints });

    expect(a.id).not.toBe(b.id);
  });

  it("should throw when the polygon has fewer than 3 points", () => {
    expect(() =>
      Hold.create({
        color: "#FF0000",
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
      }),
    ).toThrow("Hold polygon needs at least 3 points");
  });

  it("should throw when any coordinate is outside [0, 1]", () => {
    expect(() =>
      Hold.create({
        color: "#FF0000",
        points: [
          { x: -0.1, y: 0 },
          { x: 0.5, y: 0.5 },
          { x: 0.5, y: 0 },
        ],
      }),
    ).toThrow("Hold coordinates must be normalized to [0, 1]");
  });

  it("should freeze the hold and its points", () => {
    const hold = Hold.create({ color: "#FF0000", points: validPoints });

    expect(Object.isFrozen(hold)).toBe(true);
    expect(Object.isFrozen(hold.points)).toBe(true);
    expect(Object.isFrozen(hold.points[0])).toBe(true);
  });

  it("should restore a hold from a snapshot preserving the id", () => {
    const hold = Hold.restore({
      id: "hold-1",
      color: "#00FF00",
      points: validPoints,
    });

    expect(hold.id).toBe("hold-1");
    expect(hold.color).toBe("#00FF00");
    expect(hold.points).toEqual(validPoints);
  });

  it("should throw when restoring a hold with an empty id", () => {
    expect(() =>
      Hold.restore({ id: "", color: "#00FF00", points: validPoints }),
    ).toThrow("Hold id cannot be empty");
  });
});
