import type { Meta, StoryObj } from "@storybook/react";

import { SystemCard } from "./SystemCard";
import { Rainbow } from "@/constants/theme";
import { GradingSystem } from "@/domain/grading/GradingSystem";

const vScale = GradingSystem.create({
  name: "V-scale",
  grades: [
    { value: "V0", label: "V0", color: Rainbow[3], order: 1 },
    { value: "V1", label: "V1", color: Rainbow[1], order: 2 },
    { value: "V2", label: "V2", color: Rainbow[5], order: 3 },
    { value: "V3", label: "V3", color: Rainbow[6], order: 4 },
    { value: "V4", label: "V4", color: Rainbow[2], order: 5 },
    { value: "V5", label: "V5", color: Rainbow[4], order: 6 },
  ],
});

const meta = {
  title: "Organisms/SystemCard",
  component: SystemCard,
  args: {
    system: vScale,
    background: Rainbow[1],
  },
} satisfies Meta<typeof SystemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blue: Story = {
  args: { background: Rainbow[0] },
};
