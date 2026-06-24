import { GradeDefinition } from "../domain/grading/GradeDefinition";
import { GradingSystem } from "../domain/grading/GradingSystem";
import { GradingSystemRegistry } from "./GradingSystemRegistry";

export interface EditGradingSystemInput {
  readonly name: string;
  readonly grades: GradeDefinition[];
}

export class EditGradingSystem {
  constructor(private readonly registry: GradingSystemRegistry) {}

  public execute(input: EditGradingSystemInput): GradingSystem {
    this.registry.requireByName(input.name);
    const updated = GradingSystem.create(input);
    this.registry.replace(updated);
    return updated;
  }
}
