import { useContext } from "react";
import { UserContext } from "../contexts/user-context";

export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("UserContext must be used within a UserContextProvider");
  }

  return context;
}
