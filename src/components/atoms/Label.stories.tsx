import type { Meta, StoryObj } from '@storybook/react';

import { Label } from './Label';

const meta = {
  title: 'Atoms/Label',
  component: Label,
  argTypes: {
    variant: { control: 'radio', options: ['default', 'small'] },
  },
  args: {
    children: 'Discipline',
    variant: 'default',
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { variant: 'small' } };
