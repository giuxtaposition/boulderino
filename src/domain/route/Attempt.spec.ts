import { describe, expect, it } from "vitest";
import { Attempt } from "./Attempt";
import { Hold } from "./Hold";

const samplePoints = [
  { x: 0.1, y: 0.1 },
  { x: 0.3, y: 0.1 },
  { x: 0.3, y: 0.3 },
];

const fallHold = Hold.create({ color: "#FF0000", points: samplePoints });

describe("Attempt", () => {
  it("should create an attempt with a generated id and provided fields", () => {
    const date = new Date("2026-06-23T10:00:00Z");
    const attempt = Attempt.create({
      date,
      outcome: "fell",
      notes: "  slipped on the crux  ",
      fallHold,
    });

    expect(attempt.id).toBeDefined();
    expect(attempt.id.length).toBeGreaterThan(0);
    expect(attempt.date).toEqual(date);
    expect(attempt.outcome).toBe("fell");
    expect(attempt.notes).toBe("slipped on the crux");
    expect(attempt.fallHold).toBe(fallHold);
  });

  it("should default date to now when omitted", () => {
    const before = Date.now();
    const attempt = Attempt.create({ outcome: "sent" });
    const after = Date.now();

    expect(attempt.date.getTime()).toBeGreaterThanOrEqual(before);
    expect(attempt.date.getTime()).toBeLessThanOrEqual(after);
  });

  it("should default notes to null when omitted", () => {
    const attempt = Attempt.create({ outcome: "sent" });

    expect(attempt.notes).toBeNull();
  });

  it("should default notes to null when blank", () => {
    const attempt = Attempt.create({ outcome: "sent", notes: "   " });

    expect(attempt.notes).toBeNull();
  });

  it("should default fallHold to null when omitted", () => {
    const attempt = Attempt.create({ outcome: "sent" });

    expect(attempt.fallHold).toBeNull();
  });

  it("should create attempts with unique ids", () => {
    const a = Attempt.create({ outcome: "sent" });
    const b = Attempt.create({ outcome: "sent" });

    expect(a.id).not.toBe(b.id);
  });

  it("should freeze the attempt", () => {
    const attempt = Attempt.create({ outcome: "sent" });

    expect(Object.isFrozen(attempt)).toBe(true);
  });

  it("should throw when outcome is not a valid value", () => {
    expect(() =>
      Attempt.create({ outcome: "bogus" as unknown as "sent" }),
    ).toThrow("Attempt outcome must be one of sent, fell, flash");
  });

  it("should restore an attempt from a snapshot preserving the id", () => {
    const attempt = Attempt.restore({
      id: "attempt-1",
      date: "2026-06-23T10:00:00.000Z",
      outcome: "fell",
      notes: "wet hold",
      fallHold: { id: "h", color: "#000", points: samplePoints },
    });

    expect(attempt.id).toBe("attempt-1");
    expect(attempt.date).toBeInstanceOf(Date);
    expect(attempt.date.toISOString()).toBe("2026-06-23T10:00:00.000Z");
    expect(attempt.outcome).toBe("fell");
    expect(attempt.notes).toBe("wet hold");
    expect(attempt.fallHold?.id).toBe("h");
  });

  it("should restore an attempt with null fields", () => {
    const attempt = Attempt.restore({
      id: "attempt-1",
      date: new Date("2026-06-23T10:00:00Z"),
      outcome: "sent",
      notes: null,
      fallHold: null,
    });

    expect(attempt.notes).toBeNull();
    expect(attempt.fallHold).toBeNull();
  });

  it("should throw when restoring an attempt with an empty id", () => {
    expect(() =>
      Attempt.restore({
        id: "",
        date: new Date(),
        outcome: "sent",
        notes: null,
        fallHold: null,
      }),
    ).toThrow("Attempt id cannot be empty");
  });
});
