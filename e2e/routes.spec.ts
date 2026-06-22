import path from 'node:path';

import { expect, Page, test } from '@playwright/test';

const PHOTO_FIXTURE = path.resolve(__dirname, 'fixtures/photo.png');

const seedSystem = async (
  page: Page,
  name: string,
  grades: { value: string; order: string }[],
): Promise<void> => {
  await page.getByRole('link', { name: 'Grades' }).click();
  await expect(page.getByTestId('form-grading-system')).toBeVisible();

  await page.getByTestId('input-system-name').fill(name);

  for (let i = 0; i < grades.length; i++) {
    if (i > 0) {
      await page.getByTestId('add-grade-row').click();
    }
    await page.getByTestId(`input-grade-value-${i}`).fill(grades[i].value);
    await page.getByTestId(`input-grade-order-${i}`).fill(grades[i].order);
  }

  await page.getByTestId('submit-system').click();
  await expect(page.getByTestId(`system-row-${name}`)).toBeVisible();
};

const openRoutesTab = async (page: Page): Promise<void> => {
  await page.getByRole('link', { name: 'Routes' }).click();
  await expect(page.getByTestId('form-route')).toBeVisible();
};

const pickPhoto = async (page: Page): Promise<void> => {
  const filechooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId('pick-photo-button').click();
  const chooser = await filechooserPromise;
  await chooser.setFiles(PHOTO_FIXTURE);
};

test.describe('Routes screen', () => {
  test('adds a route with name, description, tags and opens its detail screen', async ({
    page,
  }) => {
    await page.goto('/');
    await seedSystem(page, 'YDS', [
      { value: '5.10a', order: '1' },
      { value: '5.10b', order: '2' },
    ]);
    await openRoutesTab(page);

    await page.getByTestId('input-route-name').fill('Crimpy Crack');
    await page
      .getByTestId('input-route-description')
      .fill('Thin face with sharp crimps');
    await page.getByTestId('input-route-tags').fill('overhang, crimps, slab');
    await page.getByTestId('select-discipline-lead-sport').click();
    await page.getByTestId('select-system-YDS').click();
    await page.getByTestId('select-grade-5.10b').click();
    await pickPhoto(page);
    await page.getByTestId('submit-route').click();

    const firstRow = page.getByTestId('route-row-0');
    await expect(firstRow).toBeVisible();
    await expect(firstRow).toContainText('Crimpy Crack');
    await expect(firstRow).toContainText('YDS / 5.10b');
    await expect(page.getByTestId('route-photo-0')).toBeVisible();
    await expect(page.getByTestId('route-created-0')).not.toHaveText('');

    await firstRow.click();

    await expect(page.getByTestId('route-detail-card')).toBeVisible();
    await expect(page.getByTestId('route-detail-name')).toHaveText(
      'Crimpy Crack',
    );
    await expect(page.getByTestId('route-detail-photo')).toBeVisible();
    await expect(page.getByTestId('route-detail-description')).toContainText(
      'Thin face with sharp crimps',
    );
    await expect(page.getByTestId('route-detail-tag-overhang')).toBeVisible();
    await expect(page.getByTestId('route-detail-tag-crimps')).toBeVisible();
    await expect(page.getByTestId('route-detail-tag-slab')).toBeVisible();

    await page.getByTestId('route-detail-back').click();
    await expect(page.getByTestId('form-route')).toBeVisible();
  });

  test('shows a hint when no grading systems exist', async ({ page }) => {
    await page.goto('/');
    await openRoutesTab(page);

    await expect(page.getByTestId('no-systems-hint')).toBeVisible();
  });

  test('requires name, grading system, grade and photo before submitting', async ({
    page,
  }) => {
    await page.goto('/');
    await seedSystem(page, 'YDS', [{ value: '5.10a', order: '1' }]);
    await openRoutesTab(page);

    await page.getByTestId('submit-route').click();
    await expect(page.getByTestId('error-route')).toContainText(
      'Name your route',
    );

    await page.getByTestId('input-route-name').fill('Test Route');
    await page.getByTestId('submit-route').click();
    await expect(page.getByTestId('error-route')).toContainText(
      'Select a grading system',
    );

    await page.getByTestId('select-system-YDS').click();
    await page.getByTestId('submit-route').click();
    await expect(page.getByTestId('error-route')).toContainText(
      'Select a grade',
    );

    await page.getByTestId('select-grade-5.10a').click();
    await page.getByTestId('submit-route').click();
    await expect(page.getByTestId('error-route')).toContainText(
      'Pick a photo',
    );
  });

  test('only shows grades from the selected grading system', async ({
    page,
  }) => {
    await page.goto('/');
    await seedSystem(page, 'YDS', [{ value: '5.10a', order: '1' }]);
    await seedSystem(page, 'V-Scale', [
      { value: 'V0', order: '1' },
      { value: 'V1', order: '2' },
    ]);
    await openRoutesTab(page);

    await page.getByTestId('select-system-V-Scale').click();
    await expect(page.getByTestId('select-grade-V0')).toBeVisible();
    await expect(page.getByTestId('select-grade-V1')).toBeVisible();
    await expect(page.getByTestId('select-grade-5.10a')).toHaveCount(0);
  });
});
