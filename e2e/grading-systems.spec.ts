import { expect, Page, test } from "@playwright/test";

const openGradesTab = async (page: Page): Promise<void> => {
  await page.goto("/");
  await page.getByRole("link", { name: "Grades" }).click();
  await expect(page.getByTestId("form-grading-system")).toBeVisible();
};

const fillGradeRow = async (
  page: Page,
  index: number,
  args: { name: string; order?: string; colorKey?: string },
): Promise<void> => {
  await page.getByTestId(`input-grade-name-${index}`).fill(args.name);
  if (args.order !== undefined) {
    await page.getByTestId(`input-grade-order-${index}`).fill(args.order);
  }
  if (args.colorKey) {
    await page
      .getByTestId(`select-grade-color-${index}-${args.colorKey}`)
      .click();
  }
};

test.describe("Grading systems screen", () => {
  test("adds a new grading system and shows its colored grades", async ({
    page,
  }) => {
    await openGradesTab(page);

    await page.getByTestId("input-system-name").fill("YDS");
    await fillGradeRow(page, 0, {
      name: "5.10a",
      order: "1",
      colorKey: "S",
    });
    await page.getByTestId("add-grade-row").click();
    await fillGradeRow(page, 1, {
      name: "5.10b",
      order: "2",
      colorKey: "O",
    });
    await page.getByTestId("submit-system").click();

    await expect(page.getByTestId("system-row-YDS")).toBeVisible();
    await expect(page.getByTestId("system-grade-YDS-5.10a")).toContainText(
      "Ten A",
    );
    await expect(page.getByTestId("system-grade-YDS-5.10b")).toContainText(
      "Ten B",
    );
  });

  test("shows an error when the system name is empty", async ({ page }) => {
    await openGradesTab(page);

    await fillGradeRow(page, 0, { name: "V0", order: "1" });
    await page.getByTestId("submit-system").click();

    await expect(page.getByTestId("error-system")).toContainText(
      "name cannot be empty",
    );
  });

  test("shows an error when no grade names are provided", async ({ page }) => {
    await openGradesTab(page);

    await page.getByTestId("input-system-name").fill("YDS");
    await page.getByTestId("submit-system").click();

    await expect(page.getByTestId("error-system")).toContainText(
      "must have at least one grade",
    );
  });

  test("shows an error when registering a duplicate system", async ({
    page,
  }) => {
    await openGradesTab(page);

    await page.getByTestId("input-system-name").fill("YDS");
    await fillGradeRow(page, 0, { name: "5.10a", order: "1" });
    await page.getByTestId("submit-system").click();
    await expect(page.getByTestId("system-row-YDS")).toBeVisible();

    await page.getByTestId("input-system-name").fill("YDS");
    await fillGradeRow(page, 0, { name: "5.10b", order: "1" });
    await page.getByTestId("submit-system").click();

    await expect(page.getByTestId("error-system")).toContainText(
      "already registered",
    );
  });

  test("removes a grade row when the remove button is pressed", async ({
    page,
  }) => {
    await openGradesTab(page);

    await page.getByTestId("add-grade-row").click();
    await expect(page.getByTestId("grade-row-1")).toBeVisible();

    await page.getByTestId("remove-grade-row-1").click();
    await expect(page.getByTestId("grade-row-1")).toHaveCount(0);
  });
});
