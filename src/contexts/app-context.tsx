import React, { Dispatch, ReactNode, SetStateAction, createContext, useState } from 'react';

const defaultRelays = [

]
type AppContextInterface = {
  listId: string;
  setListId: Dispatch<SetStateAction<string>>;
  fetchPubkeysInList: () => Promise<string[]>;
}
export const AppContext = createContext<AppContextInterface | null>(null);

// Provider component
export function AppContextProvider({ children }: { children: ReactNode}) {
  const [listId, setListId] = useState("All");
  async function fetchPubkeysInList() {
    return []
  }

  return (
    <AppContext.Provider value={{ listId, setListId, fetchPubkeysInList }}>
      {children}
    </AppContext.Provider>
  );
}