import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '../components/ui/primitives';
import './stories.css';

// Buttons by how much the action weighs (18 Nov, the audit): primary, secondary, tertiary (the "ghost" variant).
// Three sizes: xs 32 / 12, sm 36 / 13, md 48 / 14. On a dark surface the primary turns white.
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Request proposal', variant: 'primary', size: 'sm' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md'] },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Primary: Story = {
  render: () => (
    <div className="sb-row">
      <Button variant="primary" size="xs">
        Review proposal
      </Button>
      <Button variant="primary" size="sm">
        Request proposal
      </Button>
      <Button variant="primary" size="md">
        Send request
      </Button>
      <Button variant="primary" size="sm" disabled>
        Top up
      </Button>
    </div>
  ),
};

export const Secondary: Story = {
  render: () => (
    <div className="sb-row">
      <Button variant="secondary" size="xs">
        Later
      </Button>
      <Button variant="secondary" size="sm">
        Chats
      </Button>
      <Button variant="secondary" size="md">
        Cancel
      </Button>
    </div>
  ),
};

export const Tertiary: Story = {
  render: () => (
    <div className="sb-row">
      <Button variant="ghost" size="sm" icon={Plus}>
        New
      </Button>
      <Button variant="ghost" size="sm">
        Skip for now
      </Button>
    </div>
  ),
};

/** The one main action leads, the rest step down: as in New request's foot and Dr.AI's answer. */
export const Together: Story = {
  render: () => (
    <div className="sb-col">
      <div className="sb-row" style={{ maxWidth: 456 }}>
        <Button variant="secondary" size="md">
          Cancel
        </Button>
        <Button variant="primary" size="md" style={{ flex: 1 }}>
          Send request
        </Button>
      </div>
      <div className="sb-row">
        <Button variant="primary" size="sm" iconRight={ArrowRight}>
          Request proposal
        </Button>
        <Button variant="secondary" size="sm">
          Ask about this
        </Button>
        <Button variant="ghost" size="sm">
          Not now
        </Button>
      </div>
    </div>
  ),
};

/** On Dr.AI's Ink tip: the primary a white pill, xs, in one row with the tertiary. */
export const OnDark: Story = {
  render: () => (
    <div className="dt-say dt-say--ink is-on sb-dark" style={{ position: 'static', maxWidth: 360, opacity: 1, transform: 'none' }}>
      <p className="dt-say__a" style={{ margin: 0, color: '#f8f6f2' }}>
        Don’t forget: your decision on Riyadh launch campaign is due 14 Oct.
      </p>
      <div className="dt-say__acts is-on">
        <Button variant="primary" size="xs">
          Review proposal
        </Button>
        <button type="button" className="dt-say__skip">
          Skip this advice
        </button>
      </div>
    </div>
  ),
};
