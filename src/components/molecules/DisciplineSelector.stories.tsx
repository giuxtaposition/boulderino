import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { DisciplineSelector } from './DisciplineSelector';
import { Discipline } from '@/domain/route/Discipline';

const meta = {
  title: 'Molecules/DisciplineSelector',
  component: DisciplineSelector,
  args: {
    value: 'bouldering',
    onChange: fn(),
  },
} satisfies Meta<typeof DisciplineSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bouldering: Story = {};

export const Sport: Story = { args: { value: 'lead-sport' } };

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState<Discipline>('bouldering');
    return <DisciplineSelector {...args} value={value} onChange={setValue} />;
  },
};

export const SelectsDiscipline: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const sport = await canvas.findByTestId('select-discipline-lead-sport');
    await userEvent.click(sport);
    await expect(args.onChange).toHaveBeenCalledWith('lead-sport');
  },
};
