import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { DeleteIconButton } from "./DeleteIconButton";

const meta = {
  title: "Molecules/DeleteIconButton",
  component: DeleteIconButton,
  argTypes: {},
  args: {
    onPress: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DeleteIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InvokesOnPress: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const DeleteIconButton = await canvas.findByRole("button");
    await userEvent.click(DeleteIconButton);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};
