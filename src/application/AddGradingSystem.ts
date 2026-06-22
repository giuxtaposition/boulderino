import { GradeDefinition } from "../domain/grading/GradeDefinition";
import { GradingSystem } from "../domain/grading/GradingSystem";
import { GradingSystemRegistry } from "./GradingSystemRegistry";

export interface AddGradingSystemInput {
  readonly name: string;
  readonly grades: GradeDefinition[];
}

export class AddGradingSystem {
  constructor(private readonly registry: GradingSystemRegistry) {}

  public execute(input: AddGradingSystemInput): GradingSystem {
    const system = GradingSystem.create(input);
    this.registry.register(system);
    return system;
  }
}
