import AsyncStorage from "@react-native-async-storage/async-storage";

import { GradingSystemRegistry } from "../../application/GradingSystemRegistry";
import { GradeDefinition } from "../../domain/grading/GradeDefinition";
import { GradingSystem } from "../../domain/grading/GradingSystem";

const STORAGE_KEY = "boulderino:grading-systems";

type Snapshot = {
  name: string;
  grades: GradeDefinition[];
};

export class AsyncStorageGradingSystemRegistry implements GradingSystemRegistry {
  private readonly gradingSystems = new Map<string, GradingSystem>();

  private constructor(seed: GradingSystem[]) {
    for (const system of seed) {
      this.gradingSystems.set(system.name, system);
    }
  }

  public static async load(): Promise<AsyncStorageGradingSystemRegistry> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new AsyncStorageGradingSystemRegistry([]);
    }
    try {
      const snapshots = JSON.parse(raw) as Snapshot[];
      const systems = snapshots.map((snapshot) =>
        GradingSystem.create(snapshot),
      );
      return new AsyncStorageGradingSystemRegistry(systems);
    } catch {
      return new AsyncStorageGradingSystemRegistry([]);
    }
  }

  public register(system: GradingSystem): void {
    if (this.gradingSystems.has(system.name)) {
      throw new Error(`Grading system "${system.name}" is already registered`);
    }
    this.gradingSystems.set(system.name, system);
    this.persist();
  }

  public replace(system: GradingSystem): void {
    if (!this.gradingSystems.has(system.name)) {
      throw new Error(`Grading system "${system.name}" not found in registry`);
    }
    this.gradingSystems.set(system.name, system);
    this.persist();
  }

  public delete(name: string): void {
    if (!this.gradingSystems.delete(name)) {
      throw new Error(`Grading system "${name}" not found in registry`);
    }
    this.persist();
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

  private persist(): void {
    const snapshots: Snapshot[] = [...this.gradingSystems.values()].map(
      (system) => ({ name: system.name, grades: [...system.grades] }),
    );
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots)).catch(() => {
      // swallow — UI keeps live cache regardless
    });
  }
}
