import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Fab } from "./Fab";

const meta = {
  title: "Atoms/Fab",
  component: Fab,
  argTypes: {
    color: {
      control: "color",
    },
  },
  args: {
    onPress: fn(),
  },
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InvokesOnPress: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole("button");
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};
