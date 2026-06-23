import { randomUUID } from "expo-crypto";

export interface HoldPoint {
  readonly x: number;
  readonly y: number;
}

export interface Hold {
  readonly id: string;
  readonly color: string;
  readonly points: readonly HoldPoint[];
}

export interface HoldInput {
  readonly color: string;
  readonly points: readonly HoldPoint[];
}

export interface HoldSnapshot {
  readonly id: string;
  readonly color: string;
  readonly points: readonly HoldPoint[];
}

const isNormalized = (value: number): boolean => value >= 0 && value <= 1;

const freezePoints = (points: readonly HoldPoint[]): readonly HoldPoint[] =>
  Object.freeze(points.map((p) => Object.freeze({ x: p.x, y: p.y })));

const assertPoints = (points: readonly HoldPoint[]): void => {
  if (points.length < 3) {
    throw new Error("Hold polygon needs at least 3 points");
  }
  for (const point of points) {
    if (!isNormalized(point.x) || !isNormalized(point.y)) {
      throw new Error("Hold coordinates must be normalized to [0, 1]");
    }
  }
};

export const Hold = {
  create(input: HoldInput): Hold {
    assertPoints(input.points);
    return Object.freeze({
      id: randomUUID(),
      color: input.color,
      points: freezePoints(input.points),
    });
  },

  restore(snapshot: HoldSnapshot): Hold {
    if (!snapshot.id) {
      throw new Error("Hold id cannot be empty");
    }
    return Object.freeze({
      id: snapshot.id,
      color: snapshot.color,
      points: freezePoints(snapshot.points),
    });
  },
};
