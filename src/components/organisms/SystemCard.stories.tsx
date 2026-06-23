import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";

import { SystemCard } from "./SystemCard";
import { Rainbow } from "@/constants/theme";
import { GradingSystem } from "@/domain/grading/GradingSystem";

const vScale = GradingSystem.create({
  name: "V-scale",
  grades: [
    { name: "V0", color: Rainbow[3], order: 1 },
    { name: "V1", color: Rainbow[1], order: 2 },
    { name: "V2", color: Rainbow[5], order: 3 },
    { name: "V3", color: Rainbow[6], order: 4 },
    { name: "V4", color: Rainbow[2], order: 5 },
    { name: "V5", color: Rainbow[4], order: 6 },
  ],
});

const meta = {
  title: "Organisms/SystemCard",
  component: SystemCard,
  args: {
    system: vScale,
    background: Rainbow[1],
  },
} satisfies Meta<typeof SystemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blue: Story = {
  args: { background: Rainbow[0] },
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
