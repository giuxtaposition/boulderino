import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { GradeRowList, GradeRowValue } from "./GradeRowList";
import { Rainbow } from "@/constants/theme";

const initialRows: GradeRowValue[] = [
  { value: "V0", label: "V0", color: Rainbow[0], order: "1" },
  { value: "V1", label: "V1", color: Rainbow[1], order: "2" },
  { value: "V2", label: "V2", color: Rainbow[2], order: "3" },
];

const meta = {
  title: "Organisms/GradeRowList",
  component: GradeRowList,
  args: {
    rows: initialRows,
    onChangeRow: () => {},
    onRemoveRow: () => {},
    onAddRow: () => {},
  },
} satisfies Meta<typeof GradeRowList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleRow: Story = {
  args: { rows: [initialRows[0]] },
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
              value: "",
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
