import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "./Chip";
import { Rainbow } from "@/constants/theme";

const meta = {
  title: "Atoms/Chip",
  component: Chip,
  args: {
    children: "Boulder",
    selected: false,
    selectedColor: Rainbow[1],
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(false);
    return (
      <Chip
        {...args}
        selected={selected}
        onPress={() => setSelected((prev) => !prev)}
      />
    );
  },
};
