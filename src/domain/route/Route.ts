import { Grade } from "../grading/Grade";
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
}

const normalizeTags = (tags: readonly string[] | undefined): readonly string[] =>
  Array.from(
    new Set((tags ?? []).map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
  );

const freezeHolds = (holds: readonly Hold[] | undefined): readonly Hold[] =>
  Object.freeze([...(holds ?? [])]);

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
};
