import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { GradeRowEditor, GradeRowValue } from "./GradeRowEditor";
import { Rainbow } from "@/constants/theme";

const meta = {
  title: "Organisms/GradeRowEditor",
  component: GradeRowEditor,
  args: {
    index: 0,
    row: { name: "V2", color: Rainbow[1], order: "3" },
    removable: true,
    onChange: fn(),
    onRemove: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GradeRowEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotRemovable: Story = {
  args: { removable: false },
};

export const Interactive: Story = {
  render: (args) => {
    const [row, setRow] = useState<GradeRowValue>(args.row);
    return (
      <GradeRowEditor
        {...args}
        row={row}
        onChange={(patch) => setRow((prev) => ({ ...prev, ...patch }))}
        onRemove={() => {}}
      />
    );
  },
};

export const RemovesRow: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const removeButton = await canvas.findByTestId("remove-grade-row-0");
    await userEvent.click(removeButton);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

export const EditsName: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByTestId("input-grade-name0");
    await userEvent.type(input, "x");
    await expect(args.onChange).toHaveBeenCalledWith({ name: "V2x" });
  },
};
