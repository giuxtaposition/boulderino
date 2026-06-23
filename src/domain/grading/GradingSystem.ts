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

    this.validateGrades(input.grades);

    return new GradingSystem(
      input.name,
      this.sortGradesBasedOnOrder(input.grades),
    );
  }

  private static validateGrades(grades: GradeDefinition[]): void {
    grades.forEach((grade) => this.validate(grade));
  }

  private static validate = (grade: GradeDefinition): void => {
    if (!grade.name) {
      throw new Error(`Grade name cannot be empty`);
    }
    if (!grade.color) {
      throw new Error(`Grade color for "${grade.name}" cannot be empty`);
    }
    if (!Number.isFinite(grade.order)) {
      throw new Error(
        `Grade order for "${grade.name}" must be a finite number`,
      );
    }
  };

  private static sortGradesBasedOnOrder(
    grades: GradeDefinition[],
  ): GradeDefinition[] {
    return [...grades].sort((a, b) => a.order - b.order);
  }

  public contains(name: string): boolean {
    return this.grades.some((grade) => grade.name === name);
  }

  public gradeFor(name: string): Grade {
    if (!this.contains(name)) {
      throw new Error(
        `Grade "${name}" is not part of grading system "${this.name}"`,
      );
    }
    return Object.freeze({ systemId: this.name, name });
  }

  public definitionFor(name: string): GradeDefinition {
    const definition = this.grades.find((grade) => grade.name === name);
    if (!definition) {
      throw new Error(
        `Grade "${name}" is not part of grading system "${this.name}"`,
      );
    }
    return definition;
  }
}
