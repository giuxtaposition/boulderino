import type { Meta, StoryObj } from "@storybook/react";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

const meta = {
  title: "Themed/ThemedView",
  component: ThemedView,
  argTypes: {
    type: {
      control: "select",
      options: [
        "background",
        "backgroundElement",
        "backgroundSelected",
        "inputBackground",
      ],
    },
  },
  args: {
    type: "background",
    style: { padding: 24, borderRadius: 10 },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ThemedView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Background: Story = {
  args: { children: <ThemedText>background</ThemedText> },
};

export const Element: Story = {
  args: {
    type: "backgroundElement",
    children: <ThemedText>backgroundElement</ThemedText>,
  },
};

export const Selected: Story = {
  args: {
    type: "backgroundSelected",
    children: <ThemedText>backgroundSelected</ThemedText>,
  },
};
