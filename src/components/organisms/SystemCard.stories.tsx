import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, within } from "storybook/test";

import { SystemCard } from "./SystemCard";
import { RainbowTokens } from "@/constants/theme";
import { GradingSystem } from "@/domain/grading/GradingSystem";

const vScale = GradingSystem.create({
  name: "V-scale",
  grades: [
    { name: "V0", color: RainbowTokens.cyan.bg, order: 1 },
    { name: "V1", color: RainbowTokens.yellow.bg, order: 2 },
    { name: "V2", color: RainbowTokens.navy.bg, order: 3 },
    { name: "V3", color: RainbowTokens.purple.bg, order: 4 },
    { name: "V4", color: RainbowTokens.green.bg, order: 5 },
    { name: "V5", color: RainbowTokens.red.bg, order: 6 },
  ],
});

const meta = {
  title: "Organisms/SystemCard",
  component: SystemCard,
  args: {
    system: vScale,
    background: RainbowTokens.yellow.bg,
    onDelete: fn(),
    onEdit: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SystemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blue: Story = {
  args: { background: RainbowTokens.white.bg },
};

export const LongName: Story = {
  args: {
    system: GradingSystem.create({
      name: "Super long grading system name that overflows",
      grades: [...vScale.grades],
    }),
  },
};

export const RendersAllGradeChips: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("V-scale")).toBeVisible();
    await expect(await canvas.findByText("6 grades")).toBeVisible();
    await expect(
      await canvas.findByTestId("system-grade-V-scale-V5"),
    ).toBeVisible();
  },
};
