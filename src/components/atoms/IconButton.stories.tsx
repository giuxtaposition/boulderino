import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { IconButton } from "./IconButton";
import { X } from "lucide-react-native";

const meta = {
  title: "Atoms/IconButton",
  component: IconButton,
  argTypes: {},
  args: {
    children: <X size={24} color="black" />,
    onPress: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InvokesOnPress: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const IconButton = await canvas.findByRole("button");
    await userEvent.click(IconButton);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};
