export class RouteId {
  private constructor(readonly value: string) {}

  static generate(): RouteId {
    return new RouteId(globalThis.crypto.randomUUID());
  }

  static from(value: string): RouteId {
    if (!value) {
      throw new Error("RouteId value cannot be empty");
    }
    return new RouteId(value);
  }
}
