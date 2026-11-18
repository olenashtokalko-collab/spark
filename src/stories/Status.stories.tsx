import type { Meta, StoryObj } from '@storybook/react';
import { RequestStatus } from '../components/domain';
import './stories.css';

// A request's status (18 Nov, the audit): a dot and a word, the dot in one palette wherever it shows. With Spark a
// ring; a proposal waiting on you Cobalt with its halo; in progress amber; approved green; delivered a ring; declined
// a pale ring. The word keeps its line's own type.
const meta: Meta = { title: 'Components/Status' };
export default meta;
type Story = StoryObj;

const ALL = ['submitted', 'in_review', 'proposal', 'approved', 'in_progress', 'delivered', 'declined'] as const;

export const RequestStatuses: Story = {
  render: () => (
    <div className="sb-col" style={{ gap: 14 }}>
      {ALL.map((s) => (
        <RequestStatus key={s} status={s} />
      ))}
    </div>
  ),
};

/** Home's health verdicts are a different thing: an outline pill in the verdict's colour. */
export const Verdicts: Story = {
  render: () => (
    <div className="br hh">
      <div className="bx">
        <div className="bx-grid--health sb-row">
          <span className="hh-status is-work">Fix first</span>
          <span className="hh-status is-good">On track</span>
          <span className="hh-status is-watch">Watch</span>
        </div>
      </div>
    </div>
  ),
};

/** Your role in the brand, as a tag beside its name. */
export const RoleTags: Story = {
  render: () => (
    <div className="sb-row">
      <span className="hb-mode-sm is-admin">Admin</span>
      <span className="hb-mode-sm is-user">Member</span>
      <span className="hb-mode-sm is-spark">Spark</span>
    </div>
  ),
};
