import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Swatch } from "./Swatch";
import { Rainbow } from "@/constants/theme";

const meta = {
  title: "Atoms/Swatch",
  component: Swatch,
  args: {
    color: Rainbow[3],
    selected: false,
  },
} satisfies Meta<typeof Swatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {};
export const Selected: Story = { args: { selected: true } };

export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(false);
    return (
      <Swatch
        {...args}
        selected={selected}
        onPress={() => setSelected((prev) => !prev)}
      />
    );
  },
};
