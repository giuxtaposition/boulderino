import type { Meta, StoryObj } from "@storybook/react";

import HoldOverlay from "./HoldOverlay";
import { RainbowTokens } from "@/constants/theme";
import { Hold } from "@/domain/route/Hold";

const star: Hold = Hold.restore({
  id: "11111111-1111-1111-1111-111111111111",
  color: RainbowTokens.yellow.bg,
  points: [
    { x: 0.5, y: 0.15 },
    { x: 0.6, y: 0.4 },
    { x: 0.85, y: 0.4 },
    { x: 0.65, y: 0.55 },
    { x: 0.75, y: 0.8 },
    { x: 0.5, y: 0.65 },
    { x: 0.25, y: 0.8 },
    { x: 0.35, y: 0.55 },
    { x: 0.15, y: 0.4 },
    { x: 0.4, y: 0.4 },
  ],
});

const blob: Hold = Hold.restore({
  id: "22222222-2222-2222-2222-222222222222",
  color: RainbowTokens.cyan.bg,
  points: [
    { x: 0.2, y: 0.2 },
    { x: 0.5, y: 0.1 },
    { x: 0.8, y: 0.25 },
    { x: 0.85, y: 0.6 },
    { x: 0.55, y: 0.85 },
    { x: 0.2, y: 0.75 },
    { x: 0.1, y: 0.45 },
  ],
});

const meta = {
  title: "Organisms/HoldOverlay",
  component: HoldOverlay,
  args: {
    photoUri:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400",
    photoWidth: 400,
    photoHeight: 300,
    holds: [star],
    testID: "hold-overlay",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HoldOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleHold: Story = {};

export const MultipleHolds: Story = {
  args: { holds: [star, blob] },
};

export const NoHolds: Story = {
  args: { holds: [] },
};
