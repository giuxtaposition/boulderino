import { Grade } from "./Grade";
import { GradeDefinition } from "./GradeDefinition";

export class GradingSystem {
  private constructor(
    public readonly name: string,
    public readonly grades: readonly GradeDefinition[],
  ) {}

  public static create(input: {
    name: string;
    grades: GradeDefinition[];
  }): GradingSystem {
    if (!input.name) {
      throw new Error("Grading system name cannot be empty");
    }
    if (input.grades.length === 0) {
      throw new Error("Grading system must have at least one grade");
    }
    for (const grade of input.grades) {
      validate(grade);
    }
    const sorted = [...input.grades].sort((a, b) => a.order - b.order);
    return new GradingSystem(input.name, sorted);
  }

  public contains(value: string): boolean {
    return this.grades.some((grade) => grade.value === value);
  }

  public gradeFor(value: string): Grade {
    if (!this.contains(value)) {
      throw new Error(
        `Grade "${value}" is not part of grading system "${this.name}"`,
      );
    }
    return Object.freeze({ systemId: this.name, value });
  }

  public definitionFor(value: string): GradeDefinition {
    const definition = this.grades.find((grade) => grade.value === value);
    if (!definition) {
      throw new Error(
        `Grade "${value}" is not part of grading system "${this.name}"`,
      );
    }
    return definition;
  }
}

const validate = (grade: GradeDefinition): void => {
  if (!grade.value) {
    throw new Error("Grade value cannot be empty");
  }
  if (!grade.label) {
    throw new Error(`Grade label for "${grade.value}" cannot be empty`);
  }
  if (!grade.color) {
    throw new Error(`Grade color for "${grade.value}" cannot be empty`);
  }
  if (!Number.isFinite(grade.order)) {
    throw new Error(`Grade order for "${grade.value}" must be a finite number`);
  }
};
