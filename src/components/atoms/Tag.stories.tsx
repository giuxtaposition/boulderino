import type { Meta, StoryObj } from "@storybook/react";

import { Tag } from "./Tag";
import { RainbowTokens } from "../../constants/theme";

const meta = {
  title: "Atoms/Tag",
  component: Tag,
  args: {
    color: RainbowTokens.navy.bg,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fall: Story = {
  args: {
    color: RainbowTokens.red.bg,
    children: "Fall",
  },
};

export const Flash: Story = {
  args: {
    color: RainbowTokens.green.bg,
    children: "Flash",
  },
};

export const Sent: Story = {
  args: {
    color: RainbowTokens.yellow.bg,
    children: "Sent",
  },
};

export const Border: Story = {
  args: {
    color: RainbowTokens.white.bg,
    border: true,
    children: "Border",
  },
};
