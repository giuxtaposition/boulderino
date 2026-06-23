import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Swatch } from "./Swatch";
import { Rainbow } from "@/constants/theme";

const meta = {
  title: "Atoms/Swatch",
  component: Swatch,
  args: {
    color: Rainbow[3],
    selected: false,
    accessibilityLabel: "green swatch",
    onPress: fn(),
  },
} satisfies Meta<typeof Swatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {};
export const Selected: Story = { args: { selected: true } };

export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(false);
    return (
      <Swatch
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
    const swatch = await canvas.findByRole("button", { name: /green swatch/i });
    await userEvent.click(swatch);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};
