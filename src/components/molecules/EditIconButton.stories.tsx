import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { EditIconButton } from "./EditIconButton";

const meta = {
  title: "Molecules/EditIconButton",
  component: EditIconButton,
  argTypes: {},
  args: {
    onPress: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EditIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InvokesOnPress: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const EditIconButton = await canvas.findByRole("button");
    await userEvent.click(EditIconButton);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};
