import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { GradingSystemPicker } from "./GradingSystemPicker";
import { RainbowTokens } from "@/constants/theme";
import { GradingSystem } from "@/domain/grading/GradingSystem";

const vScale = GradingSystem.create({
  name: "V-scale",
  grades: [
    { name: "V0", color: RainbowTokens.cyan.bg, order: 1 },
    { name: "V1", color: RainbowTokens.yellow.bg, order: 2 },
    { name: "V2", color: RainbowTokens.navy.bg, order: 3 },
  ],
});

const french = GradingSystem.create({
  name: "French",
  grades: [
    { name: "6a", color: RainbowTokens.cyan.bg, order: 1 },
    { name: "6b", color: RainbowTokens.yellow.bg, order: 2 },
    { name: "7a", color: RainbowTokens.red.bg, order: 3 },
  ],
});

const fontainebleau = GradingSystem.create({
  name: "Fontainebleau",
  grades: [
    { name: "5", color: RainbowTokens.cyan.bg, order: 1 },
    { name: "6A", color: RainbowTokens.yellow.bg, order: 2 },
    { name: "7A", color: RainbowTokens.red.bg, order: 3 },
    { name: "8A", color: RainbowTokens.green.bg, order: 4 },
  ],
});

const meta = {
  title: "Organisms/GradingSystemPicker",
  component: GradingSystemPicker,
  args: {
    systems: [vScale, french, fontainebleau],
    selected: "V-scale",
    onSelect: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GradingSystemPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string | null>("French");
    return (
      <GradingSystemPicker
        {...args}
        selected={selected}
        onSelect={setSelected}
      />
    );
  },
};

export const SelectsSystem: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const french = await canvas.findByTestId("select-system-French");
    await userEvent.click(french);
    await expect(args.onSelect).toHaveBeenCalledWith("French");
  },
};
