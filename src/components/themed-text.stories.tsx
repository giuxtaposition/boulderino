import type { Meta, StoryObj } from "@storybook/react";

import { ThemedText } from "./themed-text";

const meta = {
  title: "Themed/ThemedText",
  component: ThemedText,
  argTypes: {
    type: {
      control: "select",
      options: [
        "default",
        "title",
        "subtitle",
        "small",
        "smallBold",
        "link",
        "linkPrimary",
        "code",
      ],
    },
  },
  args: {
    children: "The quick brown fox",
    type: "default",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ThemedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Title: Story = { args: { type: "title", children: "Routes" } };
export const Subtitle: Story = {
  args: { type: "subtitle", children: "New send" },
};
export const ExtraSmall: Story = { args: { type: "extraSmall" } };
export const ExtraSmallBold: Story = { args: { type: "extraSmallBold" } };
export const Small: Story = { args: { type: "small" } };
export const SmallBold: Story = { args: { type: "smallBold" } };
export const Link: Story = { args: { type: "link", children: "See all" } };
export const LinkPrimary: Story = {
  args: { type: "linkPrimary", children: "Open route" },
};
export const Code: Story = { args: { type: "code", children: "const x = 1;" } };
