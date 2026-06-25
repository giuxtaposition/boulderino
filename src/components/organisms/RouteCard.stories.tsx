import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";

import { RouteCard } from "./RouteCard";
import { Rainbow } from "@/constants/theme";
import { Route } from "@/domain/route/Route";

const route: Route = Route.restore({
  id: "11111111-1111-1111-1111-111111111111",
  name: "Midnight Lightning",
  description: "Iconic Camp 4 highball.",
  tags: ["highball", "classic"],
  discipline: "bouldering",
  grade: { systemId: "V-scale", name: "V8" },
  photo: {
    url: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400",
    width: 400,
    height: 300,
  },
  createdAt: new Date("2025-08-12T10:30:00Z"),
});

const meta = {
  title: "Organisms/RouteCard",
  component: RouteCard,
  args: {
    route,
    index: 0,
    background: Rainbow[1],
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RouteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RendersRouteSummary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Midnight Lightning")).toBeVisible();
    await expect(await canvas.findByText(/V-scale \/ V8/)).toBeVisible();
    await expect(await canvas.findByText("bouldering")).toBeVisible();
  },
};

export const Sport: Story = {
  args: {
    route: Route.restore({
      id: "22222222-2222-2222-2222-222222222222",
      name: "Realization",
      description: null,
      tags: [],
      discipline: "lead-sport",
      grade: { systemId: "French", name: "9a+" },
      photo: {
        url: "https://images.unsplash.com/photo-1521410676103-bf7d5add6f08?w=400",
        width: 400,
        height: 300,
      },
      createdAt: new Date("2025-09-04T08:15:00Z"),
    }),
    background: Rainbow[3],
  },
};
