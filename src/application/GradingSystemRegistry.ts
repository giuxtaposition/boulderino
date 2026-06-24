import { GradingSystem } from "../domain/grading/GradingSystem";

export interface GradingSystemRegistry {
  register(system: GradingSystem): void;
  replace(system: GradingSystem): void;
  delete(name: string): void;
  getByName(name: string): GradingSystem | undefined;
  requireByName(name: string): GradingSystem;
  findAll(): GradingSystem[];
}
