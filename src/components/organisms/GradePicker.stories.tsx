import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { GradePicker } from "./GradePicker";
import { Rainbow } from "@/constants/theme";
import { GradeDefinition } from "@/domain/grading/GradeDefinition";

const grades: GradeDefinition[] = [
  { value: "V0", label: "V0", color: Rainbow[3], order: 1 },
  { value: "V1", label: "V1", color: Rainbow[1], order: 2 },
  { value: "V2", label: "V2", color: Rainbow[5], order: 3 },
  { value: "V3", label: "V3", color: Rainbow[6], order: 4 },
  { value: "V4", label: "V4", color: Rainbow[2], order: 5 },
  { value: "V5", label: "V5", color: Rainbow[4], order: 6 },
];

const meta = {
  title: "Organisms/GradePicker",
  component: GradePicker,
  args: { grades, selected: "V2", onSelect: () => {} },
} satisfies Meta<typeof GradePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string | null>("V1");
    return <GradePicker {...args} selected={selected} onSelect={setSelected} />;
  },
};

export const Empty: Story = { args: { selected: null } };
