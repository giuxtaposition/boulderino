import type { Meta, StoryObj } from '@storybook/react';

import { EmptyBlock } from './EmptyBlock';

const meta = {
  title: 'Atoms/EmptyBlock',
  component: EmptyBlock,
  args: {
    message: 'No routes yet. Add your first send.',
  },
} satisfies Meta<typeof EmptyBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongMessage: Story = {
  args: {
    message:
      'Nothing here yet. Start logging climbs to see them organised by grading system and discipline.',
  },
};
