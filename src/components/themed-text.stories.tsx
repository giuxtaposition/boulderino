import type { Meta, StoryObj } from "@storybook/react";

import { ThemedText } from "./themed-text";

const meta = {
  title: "Themed/ThemedText",
  component: ThemedText,
  argTypes: {
    variant: {
      control: "select",
      options: ["title", "subtitle", "body", "small", "caption", "code"],
    },
    tone: {
      control: "radio",
      options: ["default", "link", "code"],
    },
  },
  args: {
    children: "The quick brown fox",
    variant: "body",
    tone: "default",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ThemedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = {};
export const Title: Story = { args: { variant: "title", children: "Routes" } };
export const Subtitle: Story = {
  args: { variant: "subtitle", children: "New send" },
};
export const Small: Story = { args: { variant: "small" } };
export const Caption: Story = { args: { variant: "caption" } };
export const Link: Story = {
  args: { tone: "link", children: "See all" },
};
export const Code: Story = {
  args: { variant: "code", tone: "code", children: "const x = 1;" },
};
