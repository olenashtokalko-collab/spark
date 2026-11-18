import type { Meta, StoryObj } from '@storybook/react';
import { MetalParts, metalClass } from '../components/ui/MetalButton';
import './stories.css';

// The AI button (18 Nov, the audit): the liquid metal rim, for Ask Dr.AI only, at most one on a screen, so the metal
// stays the sign of Dr.AI. Shown here as the sidebar has it.
const meta: Meta = { title: 'Components/AI button' };
export default meta;
type Story = StoryObj;

export const AskDrAi: Story = {
  render: () => (
    <nav className="rail" style={{ position: 'relative', width: 240, padding: 16, inset: 'auto', height: 'auto' }}>
      <a href="#" className={`rail__drai-metal ${metalClass('spark', 'menu')}`} aria-label="Ask Dr.AI" onClick={(e) => e.preventDefault()}>
        <MetalParts tone="spark" profile="menu" />
        <span className="metal__label">Ask Dr.AI</span>
      </a>
    </nav>
  ),
};
