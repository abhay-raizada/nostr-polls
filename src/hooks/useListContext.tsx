import { useContext } from "react";
import { ListContext } from "../contexts/lists-context";

export function useListContext() {
  const context = useContext(ListContext);

  if (!context) {
    throw new Error("useListContext must be used within a ListContextProvider");
  }

  return context;
}
