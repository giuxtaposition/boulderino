import { beforeEach, describe, expect, it } from "vitest";
import { GradingSystem } from "../domain/grading/GradingSystem";
import { InMemoryGradingSystemRegistry } from "../infrastructure/grading/InMemoryGradingSystemRegistry";
import { InMemoryRouteRepository } from "../infrastructure/route/InMemoryRouteRepository";
import { AddRoute } from "./AddRoute";

const validPhoto = {
  url: "https://example.com/photo.jpg",
  width: 800,
  height: 600,
};

describe("AddRoute", () => {
  let registry: InMemoryGradingSystemRegistry;
  let repository: InMemoryRouteRepository;
  let useCase: AddRoute;

  beforeEach(() => {
    registry = new InMemoryGradingSystemRegistry();
    registry.register(
      GradingSystem.create({
        name: "YDS",
        grades: [
          { value: "5.10a", label: "5.10a", color: "#22C55E", order: 1 },
          { value: "5.10b", label: "5.10b", color: "#FACC15", order: 2 },
        ],
      }),
    );

    repository = new InMemoryRouteRepository();
    useCase = new AddRoute(registry, repository);
  });

  it("should create a route with a Grade tagged by the grading system", () => {
    const route = useCase.execute({
      name: "Sample",
      description: "Long pulls",
      tags: ["overhang", "crimp"],
      discipline: "bouldering",
      gradingSystemName: "YDS",
      gradeValue: "5.10a",
      photo: validPhoto,
    });

    expect(route.name).toBe("Sample");
    expect(route.description).toBe("Long pulls");
    expect(route.tags).toEqual(["overhang", "crimp"]);
    expect(route.grade).toEqual({ systemId: "YDS", value: "5.10a" });
    expect(route.discipline).toBe("bouldering");
    expect(route.photo).toEqual(validPhoto);
  });

  it("should persist the created route via the repository", () => {
    const route = useCase.execute({
      name: "Persisted route",
      discipline: "lead-sport",
      gradingSystemName: "YDS",
      gradeValue: "5.10b",
      photo: validPhoto,
    });

    expect(repository.findAll()).toEqual([route]);
  });

  it("should throw when the grading system does not exist in the registry", () => {
    expect(() =>
      useCase.execute({
        name: "Whatever",
        discipline: "bouldering",
        gradingSystemName: "Unknown",
        gradeValue: "5.10a",
        photo: validPhoto,
      }),
    ).toThrow('Grading system "Unknown" not found in registry');
  });

  it("should throw when the grade is not part of the grading system", () => {
    expect(() =>
      useCase.execute({
        name: "Whatever",
        discipline: "bouldering",
        gradingSystemName: "YDS",
        gradeValue: "V5",
        photo: validPhoto,
      }),
    ).toThrow('Grade "V5" is not part of grading system "YDS"');
  });

  it("should not persist the route when validation fails", () => {
    expect(() =>
      useCase.execute({
        name: "Whatever",
        discipline: "bouldering",
        gradingSystemName: "YDS",
        gradeValue: "V5",
        photo: validPhoto,
      }),
    ).toThrow();

    expect(repository.findAll()).toEqual([]);
  });

  it("should assign a unique id to each created route", () => {
    const first = useCase.execute({
      name: "First",
      discipline: "bouldering",
      gradingSystemName: "YDS",
      gradeValue: "5.10a",
      photo: validPhoto,
    });
    const second = useCase.execute({
      name: "Second",
      discipline: "bouldering",
      gradingSystemName: "YDS",
      gradeValue: "5.10a",
      photo: validPhoto,
    });

    expect(first.id).not.toBe(second.id);
  });

  it("should throw when the route name is empty", () => {
    expect(() =>
      useCase.execute({
        name: "   ",
        discipline: "bouldering",
        gradingSystemName: "YDS",
        gradeValue: "5.10a",
        photo: validPhoto,
      }),
    ).toThrow("Route name cannot be empty");
  });
});
