import { Grade } from "../grading/Grade";
import { Discipline } from "./Discipline";
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
  readonly createdAt: Date;
}

export interface RouteInput {
  readonly name: string;
  readonly description?: string | null;
  readonly tags?: readonly string[];
  readonly discipline: Discipline;
  readonly grade: Grade;
  readonly photo: Photo;
}

const normalizeTags = (tags: readonly string[] | undefined): readonly string[] =>
  Array.from(
    new Set((tags ?? []).map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
  );

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
      createdAt: new Date(),
    });
  },

  restore(snapshot: {
    id: string;
    name: string;
    description: string | null;
    tags: readonly string[];
    discipline: Discipline;
    grade: Grade;
    photo: Photo;
    createdAt: string | Date;
  }): Route {
    return Object.freeze({
      id: RouteId.from(snapshot.id),
      name: snapshot.name,
      description: snapshot.description,
      tags: Object.freeze([...snapshot.tags]),
      discipline: snapshot.discipline,
      grade: snapshot.grade,
      photo: snapshot.photo,
      createdAt:
        snapshot.createdAt instanceof Date
          ? snapshot.createdAt
          : new Date(snapshot.createdAt),
    });
  },
};
