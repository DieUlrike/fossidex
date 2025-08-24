import React, { createContext, useContext, useState, ReactNode } from "react";

export type Fund = {
  id: string;
  fossil: string;
  regionId: string;
  locationId?: string | null;
  newLocationName?: string | null;
  date?: string;
  note?: string;
};

type FundContextType = {
  funds: Fund[];
  addFund: (fund: Omit<Fund, "id">) => void;
};

const FundContext = createContext<FundContextType | undefined>(undefined);

export const FundProvider = ({ children }: { children: ReactNode }) => {
  const [funds, setFunds] = useState<Fund[]>([]);

  const addFund = (fund: Omit<Fund, "id">) => {
    const newFund: Fund = { ...fund, id: Date.now().toString() };
    setFunds((prev) => [...prev, newFund]);
  };

  return (
    <FundContext.Provider value={{ funds, addFund }}>
      {children}
    </FundContext.Provider>
  );
};

export const useFundContext = () => {
  const ctx = useContext(FundContext);
  if (!ctx) {
    throw new Error("useFundContext must be used inside a FundProvider");
  }
  return ctx;
};
