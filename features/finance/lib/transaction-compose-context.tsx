import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type TransactionComposeContextValue = {
  selectedAccountId: string | null;
  setSelectedAccountId: (value: string | null) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (value: string | null) => void;
  resetCompose: () => void;
};

const TransactionComposeContext = createContext<TransactionComposeContextValue | undefined>(
  undefined,
);

export function TransactionComposeProvider({ children }: { children: ReactNode }) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const resetCompose = () => {
    setSelectedAccountId(null);
    setSelectedCategoryId(null);
  };

  const value = useMemo(
    () => ({
      selectedAccountId,
      setSelectedAccountId,
      selectedCategoryId,
      setSelectedCategoryId,
      resetCompose,
    }),
    [selectedAccountId, selectedCategoryId],
  );

  return (
    <TransactionComposeContext.Provider value={value}>
      {children}
    </TransactionComposeContext.Provider>
  );
}

export function useTransactionCompose() {
  const context = useContext(TransactionComposeContext);

  if (!context) {
    throw new Error('useTransactionCompose must be used within a TransactionComposeProvider.');
  }

  return context;
}
