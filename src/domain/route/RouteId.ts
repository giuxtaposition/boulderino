import { randomUUID } from "expo-crypto";

export class RouteId {
  private constructor(readonly value: string) {}

  static generate(): RouteId {
    return new RouteId(randomUUID());
  }

  static from(value: string): RouteId {
    if (!value) {
      throw new Error("RouteId value cannot be empty");
    }
    return new RouteId(value);
  }
}
