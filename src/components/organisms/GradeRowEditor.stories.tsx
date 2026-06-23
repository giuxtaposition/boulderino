import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { GradeRowEditor, GradeRowValue } from "./GradeRowEditor";
import { Rainbow } from "@/constants/theme";

const meta = {
  title: "Organisms/GradeRowEditor",
  component: GradeRowEditor,
  args: {
    index: 0,
    row: { value: "V2", label: "V2", color: Rainbow[1], order: "3" },
    removable: true,
    onChange: () => {},
    onRemove: () => {},
  },
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
