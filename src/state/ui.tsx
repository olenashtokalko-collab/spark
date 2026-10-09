// Global UI surfaces that any screen can open: the "new request" dialog and
// the document preview.
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CreateRequestDialog, type RequestPrefill } from '../features/requests/CreateRequestDialog';
import { DocPreviewDialog } from '../features/documents/DocPreview';

interface UI {
  openRequest: (prefill?: RequestPrefill) => void;
  openDoc: (docId: string) => void;
}

const UIContext = createContext<UI>({ openRequest: () => {}, openDoc: () => {} });

export function UIProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<{ open: boolean; prefill?: RequestPrefill }>({ open: false });
  const [doc, setDoc] = useState<string | null>(null);
  const openRequest = useCallback((prefill?: RequestPrefill) => setReq({ open: true, prefill }), []);
  const openDoc = useCallback((id: string) => setDoc(id), []);
  const close = useCallback(() => setReq((r) => ({ ...r, open: false })), []);

  return (
    <UIContext.Provider value={{ openRequest, openDoc }}>
      {children}
      <CreateRequestDialog open={req.open} prefill={req.prefill} onClose={close} />
      <DocPreviewDialog docId={doc} onClose={() => setDoc(null)} />
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
