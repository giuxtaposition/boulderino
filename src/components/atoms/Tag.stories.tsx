import type { Meta, StoryObj } from "@storybook/react";

import { Tag } from "./Tag";
import { Rainbow } from "@/constants/theme";

const meta = {
  title: "Atoms/Tag",
  component: Tag,
  args: {
    color: Rainbow[3],
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fall: Story = {
  args: {
    color: Rainbow[4],
    children: "Fall",
  },
};

export const Flash: Story = {
  args: {
    color: Rainbow[2],
    children: "Flash",
  },
};

export const Sent: Story = {
  args: {
    color: Rainbow[1],
    children: "Sent",
  },
};

export const Border: Story = {
  args: {
    color: Rainbow[0],
    border: true,
    children: "Border",
  },
};
