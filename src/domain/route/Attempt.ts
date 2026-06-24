import { randomUUID } from "expo-crypto";

import { Hold, HoldSnapshot } from "./Hold";

export type AttemptOutcome = "sent" | "fell" | "flash";

const OUTCOMES: readonly AttemptOutcome[] = ["sent", "fell", "flash"];

const isOutcome = (value: unknown): value is AttemptOutcome =>
  OUTCOMES.includes(value as AttemptOutcome);

const assertOutcome = (value: AttemptOutcome): void => {
  if (!isOutcome(value)) {
    throw new Error(`Attempt outcome must be one of ${OUTCOMES.join(", ")}`);
  }
};

const normalizeNotes = (notes: string | null | undefined): string | null => {
  if (notes == null) return null;
  const trimmed = notes.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export interface Attempt {
  readonly id: string;
  readonly date: Date;
  readonly outcome: AttemptOutcome;
  readonly notes: string | null;
  readonly fallHold: Hold | null;
}

export interface AttemptInput {
  readonly date?: Date;
  readonly outcome: AttemptOutcome;
  readonly notes?: string | null;
  readonly fallHold?: Hold | null;
}

export interface AttemptSnapshot {
  readonly id: string;
  readonly date: string | Date;
  readonly outcome: AttemptOutcome;
  readonly notes: string | null;
  readonly fallHold: HoldSnapshot | null;
}

export const Attempt = {
  create(input: AttemptInput): Attempt {
    assertOutcome(input.outcome);
    return Object.freeze({
      id: randomUUID(),
      date: input.date ?? new Date(),
      outcome: input.outcome,
      notes: normalizeNotes(input.notes),
      fallHold: input.fallHold ?? null,
    });
  },

  restore(snapshot: AttemptSnapshot): Attempt {
    if (!snapshot.id) {
      throw new Error("Attempt id cannot be empty");
    }
    assertOutcome(snapshot.outcome);
    return Object.freeze({
      id: snapshot.id,
      date:
        snapshot.date instanceof Date ? snapshot.date : new Date(snapshot.date),
      outcome: snapshot.outcome,
      notes: normalizeNotes(snapshot.notes),
      fallHold: snapshot.fallHold ? Hold.restore(snapshot.fallHold) : null,
    });
  },
};
