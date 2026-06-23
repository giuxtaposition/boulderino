import type { Meta, StoryObj } from '@storybook/react';

import { FormCard } from './FormCard';
import { ThemedText } from '../themed-text';

const meta = {
  title: 'Atoms/FormCard',
  component: FormCard,
} satisfies Meta<typeof FormCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <ThemedText type="subtitle">New route</ThemedText>
        <ThemedText>Drop form fields inside this card.</ThemedText>
      </>
    ),
  },
};
