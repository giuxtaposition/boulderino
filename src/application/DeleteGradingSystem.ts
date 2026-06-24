import { GradingSystemRegistry } from "./GradingSystemRegistry";

export interface DeleteGradingSystemInput {
  readonly name: string;
}

export class DeleteGradingSystem {
  constructor(private readonly registry: GradingSystemRegistry) {}

  public execute(input: DeleteGradingSystemInput): void {
    this.registry.delete(input.name);
  }
}
