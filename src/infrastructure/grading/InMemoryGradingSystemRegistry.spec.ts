import { beforeEach, describe, expect, it } from "vitest";
import { GradingSystem } from "../../domain/grading/GradingSystem";
import { InMemoryGradingSystemRegistry } from "./InMemoryGradingSystemRegistry";

describe("InMemoryGradingSystemRegistry", () => {
  let registry: InMemoryGradingSystemRegistry;
  let yds: GradingSystem;

  beforeEach(() => {
    registry = new InMemoryGradingSystemRegistry();
    yds = GradingSystem.create({
      name: "YDS",
      grades: [
        { name: "5.10a", color: "#22C55E", order: 1 },
        { name: "5.10b", color: "#FACC15", order: 2 },
      ],
    });
  });

  it("should register a grading system and return it by name", () => {
    registry.register(yds);

    expect(registry.getByName("YDS")).toBe(yds);
  });

  it("should return undefined for an unknown system", () => {
    expect(registry.getByName("Unknown")).toBeUndefined();
  });

  it("should return the system when requireByName finds a match", () => {
    registry.register(yds);

    expect(registry.requireByName("YDS")).toBe(yds);
  });

  it("should throw when requireByName cannot find the system", () => {
    expect(() => registry.requireByName("Unknown")).toThrow(
      'Grading system "Unknown" not found in registry',
    );
  });

  it("should throw when registering a system whose name already exists", () => {
    registry.register(yds);

    expect(() => registry.register(yds)).toThrow(
      'Grading system "YDS" is already registered',
    );
  });

  it("should return an empty list when no systems are registered", () => {
    expect(registry.findAll()).toEqual([]);
  });

  it("should return all registered systems in insertion order", () => {
    const v = GradingSystem.create({
      name: "V-Scale",
      grades: [{ name: "V0", color: "#2563EB", order: 1 }],
    });
    registry.register(yds);
    registry.register(v);

    expect(registry.findAll()).toEqual([yds, v]);
  });
});
