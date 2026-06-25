import { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { DateTimePicker } from "./DateTimePicker";

const meta = {
  title: "Atoms/DateTimePicker",
  component: DateTimePicker,
  args: {
    onChange: fn(),
    value: new Date(2026, 5, 24, 14, 30),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [date, setDate] = useState(args.value);
    return (
      <View style={{ padding: 24, maxWidth: 360 }}>
        <DateTimePicker
          {...args}
          value={date}
          onChange={(next) => {
            setDate(next);
            args.onChange(next);
          }}
        />
      </View>
    );
  },
};
