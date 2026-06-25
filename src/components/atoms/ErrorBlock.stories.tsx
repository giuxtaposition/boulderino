import type { Meta, StoryObj } from "@storybook/react";

import { ErrorBlock } from "./ErrorBlock";

const meta = {
  title: "Atoms/ErrorBlock",
  component: ErrorBlock,
  args: {
    message: "Failed to load routes. Check your connection.",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ValidationError: Story = {
  args: { message: "Grade value cannot be empty" },
};
