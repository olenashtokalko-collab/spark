import type { Meta, StoryObj } from '@storybook/react';
import { Maximize2, Mic, MoreHorizontal, Plus, X, Copy } from 'lucide-react';
import { IconButton } from '../components/ui/IconButton';
import './stories.css';

// The round glass icon button (18 Nov, the audit): 40 on surfaces, 36 in the chat box and under answers, 28 in rows.
// See-through, so it shows the light of what it sits on; white on hover; a close turns a quarter.
const meta: Meta<typeof IconButton> = {
  title: 'Components/Icon button',
  component: IconButton,
  args: { icon: X, label: 'Close', size: 40, turn: true },
  argTypes: { size: { control: 'inline-radio', options: [28, 36, 40] }, icon: { control: false } },
  decorators: [
    (Story) => (
      <div className="sb-light">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="sb-row">
      <IconButton icon={Maximize2} label="Open in Chats" size={40} />
      <IconButton icon={X} label="Close" size={40} turn />
      <IconButton icon={Plus} label="Attach" size={36} />
      <IconButton icon={Mic} label="Record a voice message" size={36} />
      <IconButton icon={Copy} label="Copy answer" size={36} />
      <IconButton icon={MoreHorizontal} label="Options" size={28} />
    </div>
  ),
};
