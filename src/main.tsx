import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { StoreProvider } from './state/store';
import { UIProvider } from './state/ui';
import { ToastProvider } from './components/ui/toast';
import './styles/tokens.css';
import './styles/base.css';
import './styles/features.css';
import './styles/brand-a.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <ToastProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </ToastProvider>
    </StoreProvider>
  </StrictMode>,
);
