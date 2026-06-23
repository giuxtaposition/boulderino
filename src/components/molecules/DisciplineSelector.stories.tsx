import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { DisciplineSelector } from './DisciplineSelector';
import { Discipline } from '@/domain/route/Discipline';

const meta = {
  title: 'Molecules/DisciplineSelector',
  component: DisciplineSelector,
  args: {
    value: 'bouldering',
    onChange: () => {},
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
