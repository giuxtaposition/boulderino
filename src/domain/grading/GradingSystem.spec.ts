import { beforeEach, describe, expect, it } from "vitest";
import { GradeDefinition } from "./GradeDefinition";
import { GradingSystem } from "./GradingSystem";

const sample = (overrides: Partial<GradeDefinition> = {}): GradeDefinition => ({
  name: "5.10a",
  color: "#22C55E",
  order: 1,
  ...overrides,
});

describe("GradingSystem", () => {
  describe("create", () => {
    it("should create a new grading system with valid grades", () => {
      const system = GradingSystem.create({
        name: "YDS",
        grades: [sample(), sample({ name: "5.10b", order: 2 })],
      });

      expect(system.name).toBe("YDS");
      expect(system.grades.map((grade) => grade.name)).toEqual([
        "5.10a",
        "5.10b",
      ]);
    });

    it("should sort grades by order ascending", () => {
      const system = GradingSystem.create({
        name: "YDS",
        grades: [
          sample({ name: "5.10c", order: 3 }),
          sample({ name: "5.10a", order: 1 }),
          sample({ name: "5.10b", order: 2 }),
        ],
      });

      expect(system.grades.map((grade) => grade.name)).toEqual([
        "5.10a",
        "5.10b",
        "5.10c",
      ]);
    });

    it("should throw an error if the name is empty", () => {
      expect(() =>
        GradingSystem.create({ name: "", grades: [sample()] }),
      ).toThrow("Grading system name cannot be empty");
    });

    it("should throw an error if the grades array is empty", () => {
      expect(() => GradingSystem.create({ name: "YDS", grades: [] })).toThrow(
        "Grading system must have at least one grade",
      );
    });

    it("should throw an error if a grade name is empty", () => {
      expect(() =>
        GradingSystem.create({
          name: "YDS",
          grades: [sample({ name: "" })],
        }),
      ).toThrow("Grade name cannot be empty");
    });

    it("should throw an error if a grade color is empty", () => {
      expect(() =>
        GradingSystem.create({
          name: "YDS",
          grades: [sample({ color: "" })],
        }),
      ).toThrow('Grade color for "5.10a" cannot be empty');
    });

    it("should throw an error if a grade order is not finite", () => {
      expect(() =>
        GradingSystem.create({
          name: "YDS",
          grades: [sample({ order: Number.NaN })],
        }),
      ).toThrow('Grade order for "5.10a" must be a finite number');
    });
  });

  describe("membership", () => {
    let system: GradingSystem;

    beforeEach(() => {
      system = GradingSystem.create({
        name: "YDS",
        grades: [
          sample({ name: "5.10a", order: 1 }),
          sample({ name: "5.10b", order: 2 }),
          sample({ name: "5.10c", order: 3 }),
        ],
      });
    });

    it("should return true when the grade exists in the system", () => {
      expect(system.contains("5.10b")).toBe(true);
    });

    it("should return false when the grade does not exist in the system", () => {
      expect(system.contains("V5")).toBe(false);
    });

    it("should build a Grade tagged with the system name when the name is valid", () => {
      expect(system.gradeFor("5.10a")).toEqual({
        systemId: "YDS",
        name: "5.10a",
      });
    });

    it("should throw when building a Grade with a name not in the system", () => {
      expect(() => system.gradeFor("V5")).toThrow(
        'Grade "V5" is not part of grading system "YDS"',
      );
    });

    it("should return the matching GradeDefinition for definitionFor", () => {
      expect(system.definitionFor("5.10b")).toEqual({
        name: "5.10b",
        color: "#22C55E",
        order: 2,
      });
    });

    it("should throw when definitionFor cannot find the name", () => {
      expect(() => system.definitionFor("V5")).toThrow(
        'Grade "V5" is not part of grading system "YDS"',
      );
    });
  });
});
