import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { GradeRowList, GradeRowValue } from "./GradeRowList";
import { Rainbow } from "@/constants/theme";

const initialRows: GradeRowValue[] = [
  { name: "V0", color: Rainbow[0], order: "1" },
  { name: "V1", color: Rainbow[1], order: "2" },
  { name: "V2", color: Rainbow[2], order: "3" },
];

const meta = {
  title: "Organisms/GradeRowList",
  component: GradeRowList,
  args: {
    rows: initialRows,
    onChangeRow: fn(),
    onRemoveRow: fn(),
    onAddRow: fn(),
  },
} satisfies Meta<typeof GradeRowList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleRow: Story = {
  args: { rows: [initialRows[0]] },
};

export const AddsRow: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = await canvas.findByTestId("add-grade-row");
    await userEvent.click(addButton);
    await expect(args.onAddRow).toHaveBeenCalledTimes(1);
  },
};

export const RemovesSecondRow: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const removeButton = await canvas.findByTestId("remove-grade-row-1");
    await userEvent.click(removeButton);
    await expect(args.onRemoveRow).toHaveBeenCalledWith(1);
  },
};

export const Interactive: Story = {
  render: () => {
    const [rows, setRows] = useState<GradeRowValue[]>(initialRows);
    return (
      <GradeRowList
        rows={rows}
        onChangeRow={(index, patch) =>
          setRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
          )
        }
        onRemoveRow={(index) =>
          setRows((prev) => prev.filter((_, i) => i !== index))
        }
        onAddRow={() =>
          setRows((prev) => [
            ...prev,
            {
              name: "",
              label: "",
              color: Rainbow[2],
              order: String(prev.length + 1),
            },
          ])
        }
      />
    );
  },
};
