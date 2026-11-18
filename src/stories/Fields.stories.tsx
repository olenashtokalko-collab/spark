import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, Search, Tag } from 'lucide-react';
import { useState } from 'react';
import { Field } from '../components/ui/primitives';
import { GlassTabs } from '../components/ui/GlassTabs';
import './stories.css';

// Fields and tabs (18 Nov, the audit). Fields in two sizes of one family: 48 px with 16 px corners in forms, 36 px with
// 12 px corners for search and filters; white with a fine Ink ring in focus. Labels in sentence case, "(optional)"
// beside them. One tab control: a glass pill, the open tab pressed in.
const meta: Meta = { title: 'Components/Fields and tabs' };
export default meta;
type Story = StoryObj;

export const FormFields: Story = {
  render: () => (
    <div className="dlg-spark" style={{ maxWidth: 456 }}>
      <div className="stack">
        <Field label="Title" htmlFor="sb-title">
          <input id="sb-title" className="input" placeholder="e.g. Trademark check for Riyadh" />
        </Field>
        <div className="row">
          <Field label="Type" htmlFor="sb-type">
            <div className="select">
              <select id="sb-type" defaultValue="Strategy">
                <option>Strategy</option>
                <option>Creative</option>
                <option>Research</option>
              </select>
            </div>
          </Field>
          <Field label="Timing" htmlFor="sb-when">
            <div className="select">
              <select id="sb-when" defaultValue="Within 2 weeks">
                <option>ASAP</option>
                <option>Within 2 weeks</option>
              </select>
            </div>
          </Field>
        </div>
        <Field label="What do you need?" htmlFor="sb-desc">
          <textarea id="sb-desc" className="input textarea" rows={4} placeholder="Context, what a good result looks like, any constraints." />
        </Field>
        <Field label="Budget" htmlFor="sb-budget" optional hint="A range helps Spark scope the right proposal.">
          <input id="sb-budget" className="input" placeholder="e.g. AED 20–40k" />
        </Field>
      </div>
    </div>
  ),
};

export const SearchAndFilters: Story = {
  render: () => (
    <div className="sb-row">
      <label className="rq-search" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 220 }}>
        <Search size={15} />
        <input placeholder="Search" aria-label="Search" style={{ border: 0, outline: 0, flex: 1, font: 'inherit' }} />
      </label>
      <button type="button" className="filter-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Tag size={14} /> Type <ChevronDown size={14} />
      </button>
    </div>
  ),
};

function TabsDemo() {
  const [v, setV] = useState<'all' | 'you' | 'work' | 'closed'>('all');
  return (
    <GlassTabs
      label="Requests"
      value={v}
      onChange={setV}
      items={[
        { value: 'all', label: 'All', count: 8 },
        { value: 'you', label: 'Needs you', count: 3, you: true },
        { value: 'work', label: 'In progress', count: 3 },
        { value: 'closed', label: 'Closed', count: 2 },
      ]}
    />
  );
}

export const Tabs: Story = { render: () => <TabsDemo /> };
