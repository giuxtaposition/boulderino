import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Chip } from "./Chip";
import { Rainbow } from "@/constants/theme";

const meta = {
  title: "Atoms/Chip",
  component: Chip,
  args: {
    children: "Boulder",
    selected: false,
    selectedColor: Rainbow[1],
    onPress: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(false);
    return (
      <Chip
        {...args}
        selected={selected}
        onPress={() => setSelected((prev) => !prev)}
      />
    );
  },
};

export const InvokesOnPress: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = await canvas.findByRole("button", { name: /boulder/i });
    await userEvent.click(chip);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};
