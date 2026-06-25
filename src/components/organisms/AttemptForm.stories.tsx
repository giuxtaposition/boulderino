import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { AttemptForm } from "./AttemptForm";

const meta = {
  title: "Organisms/AttemptForm",
  component: AttemptForm,
  args: {
    photoUri:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400",
    photoWidth: 400,
    photoHeight: 300,
    onSubmit: fn(),
    onCancel: fn(),
    testID: "attempt-form",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AttemptForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SelectsOutcome: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const sent = await canvas.findByTestId("attempt-form-outcome-sent");
    await userEvent.click(sent);
    const save = await canvas.findByTestId("attempt-form-save");
    await userEvent.click(save);
    await expect(args.onSubmit).toHaveBeenCalledWith({
      outcome: "sent",
      notes: "",
      fallHold: null,
    });
  },
};

export const SubmitsAttempt: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const save = await canvas.findByTestId("attempt-form-save");
    await userEvent.click(save);
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(args.onSubmit).toHaveBeenCalledWith({
      outcome: "fell",
      notes: "",
      fallHold: null,
    });
  },
};

export const CancelsForm: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const cancel = await canvas.findByTestId("attempt-form-cancel");
    await userEvent.click(cancel);
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};
