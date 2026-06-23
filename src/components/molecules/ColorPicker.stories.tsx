import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { ColorPicker } from "./ColorPicker";
import { Rainbow } from "@/constants/theme";

const meta = {
  title: "Molecules/ColorPicker",
  component: ColorPicker,
  args: {
    value: Rainbow[3] as string,
    testIDPrefix: "sb-color",
    onChange: fn(),
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState<string>(Rainbow[3]);
    return <ColorPicker {...args} value={value} onChange={setValue} />;
  },
};

export const CustomHex: Story = {
  args: { value: "#A855F7" },
};

export const SelectsSwatch: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const swatch = await canvas.findByTestId("sb-color-1");
    await userEvent.click(swatch);
    await expect(args.onChange).toHaveBeenCalledWith(Rainbow[1]);
  },
};
