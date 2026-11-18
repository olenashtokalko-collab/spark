import type { Preview } from '@storybook/react';
import { StoreProvider } from '../src/state/store';
import { UIProvider } from '../src/state/ui';
import { ToastProvider } from '../src/components/ui/toast';
// the portal's layers in the order main.tsx loads them, then the ones Health's pages bring in, then the system last
import '../src/styles/fonts.css';
import '../src/styles/tokens.css';
import '../src/styles/base.css';
import '../src/styles/features.css';
import '../src/styles/brand-a.css';
import '../src/styles/glass.css';
import '../src/styles/ui-b.css';
import '../src/styles/ui-c.css';
import '../src/styles/status-dot.css';
import '../src/styles/metal.css';
import '../src/styles/health.css';
import '../src/styles/health-system.css';
import './preview.css';

// Health's theme, as the portal sets it on <html>
const root = document.documentElement;
root.dataset.theme = 'sand';
root.dataset.ui = 'a';
root.dataset.dkDrawer = 'b';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    backgrounds: { disable: true },
    options: { storySort: { order: ['Foundations', 'Components', 'Overlays'] } },
  },
  decorators: [
    (Story) => (
      <StoreProvider>
        <ToastProvider>
          <UIProvider>
            <div className="sb-stage">
              <Story />
            </div>
          </UIProvider>
        </ToastProvider>
      </StoreProvider>
    ),
  ],
};
export default preview;
