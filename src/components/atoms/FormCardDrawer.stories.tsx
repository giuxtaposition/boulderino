import type { Meta, StoryObj } from "@storybook/react";

import { FormCardDrawer } from "./FormCardDrawer";
import { ThemedText } from "../themed-text";

const meta = {
  title: "Atoms/FormCardDrawer",
  component: FormCardDrawer,
} satisfies Meta<typeof FormCardDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <ThemedText type="subtitle">New route</ThemedText>
        <ThemedText>Drop form fields inside this card.</ThemedText>
      </>
    ),
    visible: true,
    setVisible: () => {},
    title: "Form Card Drawer",
  },
};
