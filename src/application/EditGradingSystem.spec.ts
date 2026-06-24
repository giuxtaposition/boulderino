import { beforeEach, describe, expect, it } from "vitest";
import { GradingSystem } from "../domain/grading/GradingSystem";
import { InMemoryGradingSystemRegistry } from "../infrastructure/grading/InMemoryGradingSystemRegistry";
import { EditGradingSystem } from "./EditGradingSystem";

describe("EditGradingSystem", () => {
  let registry: InMemoryGradingSystemRegistry;
  let useCase: EditGradingSystem;

  beforeEach(() => {
    registry = new InMemoryGradingSystemRegistry();
    registry.register(
      GradingSystem.create({
        name: "YDS",
        grades: [
          { name: "5.10a", color: "#22C55E", order: 1 },
          { name: "5.10b", color: "#FACC15", order: 2 },
        ],
      }),
    );
    useCase = new EditGradingSystem(registry);
  });

  it("should replace the grades of an existing system", () => {
    useCase.execute({
      name: "YDS",
      grades: [{ name: "5.11a", color: "#EF4444", order: 1 }],
    });

    const updated = registry.requireByName("YDS");
    expect(updated.grades.map((grade) => grade.name)).toEqual(["5.11a"]);
  });

  it("should return the updated grading system", () => {
    const updated = useCase.execute({
      name: "YDS",
      grades: [{ name: "5.11a", color: "#EF4444", order: 1 }],
    });

    expect(updated.name).toBe("YDS");
    expect(updated.grades).toHaveLength(1);
  });

  it("should throw when the system does not exist", () => {
    expect(() =>
      useCase.execute({
        name: "Unknown",
        grades: [{ name: "x", color: "#000000", order: 1 }],
      }),
    ).toThrow('Grading system "Unknown" not found in registry');
  });

  it("should throw when grades are empty", () => {
    expect(() => useCase.execute({ name: "YDS", grades: [] })).toThrow(
      "Grading system must have at least one grade",
    );
  });
});
