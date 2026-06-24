import { beforeEach, describe, expect, it } from "vitest";
import { GradingSystem } from "../domain/grading/GradingSystem";
import { InMemoryGradingSystemRegistry } from "../infrastructure/grading/InMemoryGradingSystemRegistry";
import { DeleteGradingSystem } from "./DeleteGradingSystem";

describe("DeleteGradingSystem", () => {
  let registry: InMemoryGradingSystemRegistry;
  let useCase: DeleteGradingSystem;

  beforeEach(() => {
    registry = new InMemoryGradingSystemRegistry();
    registry.register(
      GradingSystem.create({
        name: "YDS",
        grades: [{ name: "5.10a", color: "#22C55E", order: 1 }],
      }),
    );
    useCase = new DeleteGradingSystem(registry);
  });

  it("should remove the matching system from the registry", () => {
    useCase.execute({ name: "YDS" });

    expect(registry.getByName("YDS")).toBeUndefined();
  });

  it("should leave other systems untouched", () => {
    const v = GradingSystem.create({
      name: "V-Scale",
      grades: [{ name: "V0", color: "#2563EB", order: 1 }],
    });
    registry.register(v);

    useCase.execute({ name: "YDS" });

    expect(registry.findAll()).toEqual([v]);
  });

  it("should throw when the system does not exist", () => {
    expect(() => useCase.execute({ name: "Unknown" })).toThrow(
      'Grading system "Unknown" not found in registry',
    );
  });
});
