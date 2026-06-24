import { GradingSystemRegistry } from "../../application/GradingSystemRegistry";
import { GradingSystem } from "../../domain/grading/GradingSystem";

export class InMemoryGradingSystemRegistry implements GradingSystemRegistry {
  private readonly gradingSystems = new Map<string, GradingSystem>();

  public register(system: GradingSystem): void {
    if (this.gradingSystems.has(system.name)) {
      throw new Error(`Grading system "${system.name}" is already registered`);
    }
    this.gradingSystems.set(system.name, system);
  }

  public replace(system: GradingSystem): void {
    if (!this.gradingSystems.has(system.name)) {
      throw new Error(`Grading system "${system.name}" not found in registry`);
    }
    this.gradingSystems.set(system.name, system);
  }

  public delete(name: string): void {
    if (!this.gradingSystems.delete(name)) {
      throw new Error(`Grading system "${name}" not found in registry`);
    }
  }

  public getByName(name: string): GradingSystem | undefined {
    return this.gradingSystems.get(name);
  }

  public requireByName(name: string): GradingSystem {
    const system = this.gradingSystems.get(name);
    if (!system) {
      throw new Error(`Grading system "${name}" not found in registry`);
    }
    return system;
  }

  public findAll(): GradingSystem[] {
    return [...this.gradingSystems.values()];
  }
}
