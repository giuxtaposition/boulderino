import type { Meta, StoryObj } from "@storybook/react";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

const meta = {
  title: "Themed/ThemedView",
  component: ThemedView,
  argTypes: {
    surface: {
      control: "select",
      options: ["background", "surface1", "surface2", "surface3"],
    },
  },
  args: {
    surface: "background",
    style: { padding: 24, borderRadius: 10 },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ThemedView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Background: Story = {
  args: { children: <ThemedText>background</ThemedText> },
};

export const Surface1: Story = {
  args: {
    surface: "surface1",
    children: <ThemedText>surface1</ThemedText>,
  },
};

export const Surface2: Story = {
  args: {
    surface: "surface2",
    children: <ThemedText>surface2</ThemedText>,
  },
};

export const Surface3: Story = {
  args: {
    surface: "surface3",
    children: <ThemedText>surface3</ThemedText>,
  },
};
