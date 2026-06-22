import { GradingSystem } from "../domain/grading/GradingSystem";

export interface GradingSystemRegistry {
  register(system: GradingSystem): void;
  getByName(name: string): GradingSystem | undefined;
  requireByName(name: string): GradingSystem;
  findAll(): GradingSystem[];
}
