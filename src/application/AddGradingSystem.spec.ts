import { beforeEach, describe, expect, it } from "vitest";
import { GradeDefinition } from "../domain/grading/GradeDefinition";
import { InMemoryGradingSystemRegistry } from "../infrastructure/grading/InMemoryGradingSystemRegistry";
import { AddGradingSystem } from "./AddGradingSystem";

const grade = (overrides: Partial<GradeDefinition> = {}): GradeDefinition => ({
  name: "5.10a",
  color: "#22C55E",
  order: 1,
  ...overrides,
});

describe("AddGradingSystem", () => {
  let registry: InMemoryGradingSystemRegistry;
  let useCase: AddGradingSystem;

  beforeEach(() => {
    registry = new InMemoryGradingSystemRegistry();
    useCase = new AddGradingSystem(registry);
  });

  it("should register a new grading system in the registry", () => {
    useCase.execute({
      name: "YDS",
      grades: [grade(), grade({ name: "5.10b", order: 2 })],
    });

    expect(registry.getByName("YDS")?.grades.map((g) => g.name)).toEqual([
      "5.10a",
      "5.10b",
    ]);
  });

  it("should return the registered grading system", () => {
    const system = useCase.execute({
      name: "V-Scale",
      grades: [grade({ name: "V0", order: 1 })],
    });

    expect(system.name).toBe("V-Scale");
    expect(system.grades).toHaveLength(1);
  });

  it("should throw when the name is empty", () => {
    expect(() => useCase.execute({ name: "", grades: [grade()] })).toThrow(
      "Grading system name cannot be empty",
    );
  });

  it("should throw when the grades array is empty", () => {
    expect(() => useCase.execute({ name: "YDS", grades: [] })).toThrow(
      "Grading system must have at least one grade",
    );
  });

  it("should throw when a system with the same name is already registered", () => {
    useCase.execute({ name: "YDS", grades: [grade()] });

    expect(() =>
      useCase.execute({
        name: "YDS",
        grades: [grade({ name: "5.10b", order: 2 })],
      }),
    ).toThrow('Grading system "YDS" is already registered');
  });
});
