import type { Meta, StoryObj } from '@storybook/react';

import { FormField } from './FormField';
import { Input } from '../atoms/Input';
import { ThemedText } from '../themed-text';

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  args: {
    label: 'Route name',
    variant: 'default',
  },
  argTypes: {
    variant: { control: 'radio', options: ['default', 'small'] },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <Input placeholder="Midnight Lightning" /> },
};

export const WithHelper: Story = {
  args: {
    helper: <ThemedText type="small">required</ThemedText>,
    children: <Input placeholder="Midnight Lightning" />,
  },
};

export const Small: Story = {
  args: {
    variant: 'small',
    label: 'Order',
    children: <Input keyboardType="numeric" placeholder="1" />,
  },
};
