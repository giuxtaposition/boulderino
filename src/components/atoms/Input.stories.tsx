import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Input } from "./Input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  args: {
    placeholder: "Route name",
    onChangeText: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: { value: "Midnight Lightning" },
};

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return <Input {...args} value={value} onChangeText={setValue} />;
  },
};

export const InvokesOnChangeText: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByPlaceholderText("Route name");
    await userEvent.type(input, "Hi");
    await expect(args.onChangeText).toHaveBeenLastCalledWith("Hi");
  },
};
