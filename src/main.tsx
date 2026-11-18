// first, before anything reads what an earlier build saved: a new build opens as a first visit
import './lib/build';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { StoreProvider } from './state/store';
import { UIProvider } from './state/ui';
import { ToastProvider } from './components/ui/toast';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/features.css';
import './styles/brand-a.css';
import './styles/glass.css';
// The UI variants' layers (lib/uiVariant): the shared type and Direction A (b), then Direction B (c). Loaded last.
import './styles/ui-b.css';
import './styles/ui-c.css';
// Current UI's statuses as a dot and a word (11 Nov), after every other layer.
import './styles/status-dot.css';
// Health's system (18 Nov, the consistency audit): one button per role, one status, one icon button. Last of all.
import './styles/health-system.css';
import { UiVariantRoot } from './lib/uiVariant';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <ToastProvider>
        <UIProvider>
          <App />
          <UiVariantRoot />
        </UIProvider>
      </ToastProvider>
    </StoreProvider>
  </StrictMode>,
);
