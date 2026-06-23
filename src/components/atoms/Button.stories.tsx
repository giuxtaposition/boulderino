import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'ghost', 'danger', 'dashed'],
    },
    size: {
      control: 'select',
      options: ['medium', 'small'],
    },
  },
  args: {
    children: 'Press me',
    variant: 'primary',
    size: 'medium',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete' },
};

export const Dashed: Story = {
  args: { variant: 'dashed', children: 'Add item' },
};

export const Small: Story = {
  args: { size: 'small' },
};
