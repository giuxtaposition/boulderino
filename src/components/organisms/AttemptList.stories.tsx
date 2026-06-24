import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";

import { AttemptList } from "./AttemptList";
import { Rainbow } from "@/constants/theme";
import { Attempt } from "@/domain/route/Attempt";
import { Hold } from "@/domain/route/Hold";

const fallHold = Hold.restore({
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  color: Rainbow[2],
  points: [
    { x: 0.3, y: 0.3 },
    { x: 0.7, y: 0.3 },
    { x: 0.7, y: 0.7 },
    { x: 0.3, y: 0.7 },
  ],
});

const attempts: Attempt[] = [
  Attempt.restore({
    id: "11111111-1111-1111-1111-111111111111",
    date: "2025-09-04T08:15:00Z",
    outcome: "sent",
    notes: "Crisp morning, friction was perfect.",
    fallHold: null,
  }),
  Attempt.restore({
    id: "22222222-2222-2222-2222-222222222222",
    date: "2025-08-30T15:00:00Z",
    outcome: "fell",
    notes: "Slipped off the sloper crux.",
    fallHold: {
      id: fallHold.id,
      color: fallHold.color,
      points: fallHold.points,
    },
  }),
  Attempt.restore({
    id: "33333333-3333-3333-3333-333333333333",
    date: "2025-08-29T17:30:00Z",
    outcome: "flash",
    notes: null,
    fallHold: null,
  }),
];

const meta = {
  title: "Organisms/AttemptList",
  component: AttemptList,
  args: {
    attempts,
    photoUri:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400",
    photoWidth: 400,
    photoHeight: 300,
    testID: "attempt-list",
  },
} satisfies Meta<typeof AttemptList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { attempts: [] },
};

export const RendersAttempts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("SENT")).toBeVisible();
    await expect(await canvas.findByText("FELL")).toBeVisible();
    await expect(await canvas.findByText("FLASH")).toBeVisible();
  },
};

export const RendersEmptyState: Story = {
  args: { attempts: [], testID: "attempt-list" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("No attempts logged yet."),
    ).toBeVisible();
  },
};
