import type { Meta, StoryObj } from '@storybook/react';
import { Link } from '../components/ui/Link';
import './stories.css';

// Links (18 Nov): in text, a word that leads somewhere, a fine underline always there; navigation, grey words with an
// arrow that steps its way on hover.
const meta: Meta<typeof Link> = { title: 'Components/Link', component: Link };
export default meta;
type Story = StoryObj<typeof Link>;

export const InText: Story = {
  render: () => (
    <p className="sb-note" style={{ color: 'rgba(14,17,22,.72)', fontSize: 15 }}>
      Spark sent a proposal, AED 54,000 · 6 weeks.{' '}
      <Link onClick={() => undefined}>See proposal</Link>
    </p>
  ),
};

export const Navigation: Story = {
  render: () => (
    <div className="sb-row">
      <Link kind="nav" back href="#">
        Requests
      </Link>
      <Link kind="nav" href="#">
        You and 2 colleagues
      </Link>
    </div>
  ),
};

export const OnDark: Story = {
  render: () => (
    <div className="sb-dark" style={{ maxWidth: 360 }}>
      <Link onDark onClick={() => undefined}>
        Skip this advice
      </Link>
    </div>
  ),
};
