import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "./Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline"],
    },
    size: {
      control: "select",
      options: ["medium", "small"],
    },
  },
  args: {
    children: "Press me",
    variant: "solid",
    size: "medium",
    onPress: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { action: "primary" },
};

export const Secondary: Story = {
  args: { action: "secondary" },
};

export const Positive: Story = {
  args: { action: "positive" },
};

export const Negative: Story = {
  args: { action: "negative" },
};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Small: Story = {
  args: { size: "small" },
};

export const InvokesOnPress: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole("button", { name: /press me/i });
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};
