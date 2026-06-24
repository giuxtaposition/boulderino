import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import HoldEditor from "./HoldEditor";
import { Rainbow } from "@/constants/theme";
import { Hold } from "@/domain/route/Hold";

const seed: Hold = Hold.restore({
  id: "11111111-1111-1111-1111-111111111111",
  color: Rainbow[2],
  points: [
    { x: 0.25, y: 0.25 },
    { x: 0.75, y: 0.25 },
    { x: 0.75, y: 0.75 },
    { x: 0.25, y: 0.75 },
  ],
});

const meta = {
  title: "Organisms/HoldEditor",
  component: HoldEditor,
  args: {
    photoUri:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400",
    photoWidth: 400,
    photoHeight: 300,
    holds: [],
    color: Rainbow[0],
    onChange: () => {},
    testID: "hold-editor",
  },
} satisfies Meta<typeof HoldEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithExistingHold: Story = {
  args: { holds: [seed] },
};

export const Interactive: Story = {
  render: (args) => {
    const [holds, setHolds] = useState<readonly Hold[]>(args.holds);
    return <HoldEditor {...args} holds={holds} onChange={setHolds} />;
  },
};
