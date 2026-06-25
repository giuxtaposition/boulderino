import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { GradePicker } from "./GradePicker";
import { RainbowTokens } from "@/constants/theme";
import { GradeDefinition } from "@/domain/grading/GradeDefinition";

const grades: GradeDefinition[] = [
  { name: "V0", color: RainbowTokens.cyan.bg, order: 1 },
  { name: "V1", color: RainbowTokens.yellow.bg, order: 2 },
  { name: "V2", color: RainbowTokens.navy.bg, order: 3 },
  { name: "V3", color: RainbowTokens.purple.bg, order: 4 },
  { name: "V4", color: RainbowTokens.green.bg, order: 5 },
  { name: "V5", color: RainbowTokens.red.bg, order: 6 },
];

const meta = {
  title: "Organisms/GradePicker",
  component: GradePicker,
  args: { grades, selected: "V2", onSelect: fn() },
  tags: ["autodocs"],
} satisfies Meta<typeof GradePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string | null>("V1");
    return <GradePicker {...args} selected={selected} onSelect={setSelected} />;
  },
};

export const Empty: Story = { args: { selected: null } };

export const SelectsGradeOnClick: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("clicks V4 option", async () => {
      const option = await canvas.findByTestId("select-grade-V4");
      await userEvent.click(option);
    });

    await step("invokes onSelect with grade name", async () => {
      await expect(args.onSelect).toHaveBeenCalledWith("V4");
    });
  },
};
