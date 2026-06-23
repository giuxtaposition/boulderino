import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { GradingSystemPicker } from "./GradingSystemPicker";
import { Rainbow } from "@/constants/theme";
import { GradingSystem } from "@/domain/grading/GradingSystem";

const vScale = GradingSystem.create({
  name: "V-scale",
  grades: [
    { value: "V0", label: "V0", color: Rainbow[3], order: 1 },
    { value: "V1", label: "V1", color: Rainbow[1], order: 2 },
    { value: "V2", label: "V2", color: Rainbow[5], order: 3 },
  ],
});

const french = GradingSystem.create({
  name: "French",
  grades: [
    { value: "6a", label: "6a", color: Rainbow[3], order: 1 },
    { value: "6b", label: "6b", color: Rainbow[1], order: 2 },
    { value: "7a", label: "7a", color: Rainbow[4], order: 3 },
  ],
});

const fontainebleau = GradingSystem.create({
  name: "Fontainebleau",
  grades: [
    { value: "5", label: "5", color: Rainbow[3], order: 1 },
    { value: "6A", label: "6A", color: Rainbow[1], order: 2 },
    { value: "7A", label: "7A", color: Rainbow[4], order: 3 },
    { value: "8A", label: "8A", color: Rainbow[2], order: 4 },
  ],
});

const meta = {
  title: "Organisms/GradingSystemPicker",
  component: GradingSystemPicker,
  args: {
    systems: [vScale, french, fontainebleau],
    selected: "V-scale",
    onSelect: () => {},
  },
} satisfies Meta<typeof GradingSystemPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string | null>("French");
    return (
      <GradingSystemPicker
        {...args}
        selected={selected}
        onSelect={setSelected}
      />
    );
  },
};
