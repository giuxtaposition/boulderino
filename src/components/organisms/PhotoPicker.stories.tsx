import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { PhotoPicker, PickedPhoto } from "./PhotoPicker";

const samplePhoto: PickedPhoto = {
  uri: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400",
  width: 400,
  height: 300,
};

const meta = {
  title: "Organisms/PhotoPicker",
  component: PhotoPicker,
  args: {
    photo: null,
    onPick: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PhotoPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithPhoto: Story = {
  args: { photo: samplePhoto },
};

export const Interactive: Story = {
  render: () => {
    const [photo, setPhoto] = useState<PickedPhoto | null>(null);
    return (
      <PhotoPicker
        photo={photo}
        onPick={() => setPhoto(photo ? null : samplePhoto)}
      />
    );
  },
};

export const InvokesOnPick: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByTestId("pick-photo-button");
    await userEvent.click(button);
    await expect(args.onPick).toHaveBeenCalledTimes(1);
  },
};
