import { Grade } from "../grading/Grade";
import { Attempt, AttemptSnapshot } from "./Attempt";
import { Discipline } from "./Discipline";
import { Hold, HoldSnapshot } from "./Hold";
import { Photo } from "./Photo";
import { RouteId } from "./RouteId";

export interface Route {
  readonly id: RouteId;
  readonly name: string;
  readonly description: string | null;
  readonly tags: readonly string[];
  readonly discipline: Discipline;
  readonly grade: Grade;
  readonly photo: Photo;
  readonly holds: readonly Hold[];
  readonly attempts: readonly Attempt[];
  readonly createdAt: Date;
}

export interface RouteInput {
  readonly name: string;
  readonly description?: string | null;
  readonly tags?: readonly string[];
  readonly discipline: Discipline;
  readonly grade: Grade;
  readonly photo: Photo;
  readonly holds?: readonly Hold[];
  readonly attempts?: readonly Attempt[];
}

export interface RouteSnapshot {
  id: string;
  name: string;
  description: string | null;
  tags: readonly string[];
  discipline: Discipline;
  grade: Grade;
  photo: Photo;
  createdAt: string | Date;
  holds?: readonly HoldSnapshot[];
  attempts?: readonly AttemptSnapshot[];
}

const normalizeTags = (tags: readonly string[] | undefined): readonly string[] =>
  Array.from(
    new Set((tags ?? []).map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
  );

const freezeHolds = (holds: readonly Hold[] | undefined): readonly Hold[] =>
  Object.freeze([...(holds ?? [])]);

const freezeAttempts = (
  attempts: readonly Attempt[] | undefined,
): readonly Attempt[] => Object.freeze([...(attempts ?? [])]);

export const Route = {
  create(input: RouteInput): Route {
    const name = input.name.trim();
    if (name.length === 0) {
      throw new Error("Route name cannot be empty");
    }
    const description = input.description?.trim() ?? "";
    return Object.freeze({
      id: RouteId.generate(),
      name,
      description: description.length > 0 ? description : null,
      tags: Object.freeze(normalizeTags(input.tags)),
      discipline: input.discipline,
      grade: input.grade,
      photo: input.photo,
      holds: freezeHolds(input.holds),
      attempts: freezeAttempts(input.attempts),
      createdAt: new Date(),
    });
  },

  restore(snapshot: RouteSnapshot): Route {
    return Object.freeze({
      id: RouteId.from(snapshot.id),
      name: snapshot.name,
      description: snapshot.description,
      tags: Object.freeze([...snapshot.tags]),
      discipline: snapshot.discipline,
      grade: snapshot.grade,
      photo: snapshot.photo,
      holds: freezeHolds(snapshot.holds?.map((hold) => Hold.restore(hold))),
      attempts: freezeAttempts(
        snapshot.attempts?.map((attempt) => Attempt.restore(attempt)),
      ),
      createdAt:
        snapshot.createdAt instanceof Date
          ? snapshot.createdAt
          : new Date(snapshot.createdAt),
    });
  },

  withHolds(route: Route, holds: readonly Hold[]): Route {
    return Object.freeze({
      ...route,
      holds: freezeHolds(holds),
    });
  },

  addAttempt(route: Route, attempt: Attempt): Route {
    return Object.freeze({
      ...route,
      attempts: freezeAttempts([...route.attempts, attempt]),
    });
  },
};
