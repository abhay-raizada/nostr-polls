import { ReactNode, createContext, useEffect, useState } from "react";
import { fetchUserProfile } from "../nostr";
import { Event } from "nostr-tools/lib/types/core";
import { getPubKeyFromLocalStorage } from "../utils/localStorage";
import { Profile } from "../nostr/types";

type User = { name?: string; picture?: string; pubkey: string };

type AppContextInterface = {
  user: User | null;
  setUser: (user: User | null) => void;
  profiles: Map<string, Profile> | undefined;
  addEventToProfiles: (event: Event) => void;
};
export const AppContext = createContext<AppContextInterface | null>(null);

// Provider component
export function AppContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());

  const addEventToProfiles = (event: Event) => {
    if(profiles?.has(event.pubkey)) return;
    try {
      let content = JSON.parse(event.content)
      profiles?.set(event.pubkey, content)
    } catch(e)  { console.error("Error parsing event", e); }
  }

  useEffect(() => {
    // Fetch user profile when component mounts
    const pubkey = getPubKeyFromLocalStorage();
    if (pubkey) {
      fetchUserProfile(pubkey).then((kind0: Event | null) => {
        console.log("Fetched user is", kind0);
        if (!kind0) {
          setUser({
            name: "Anon..",
            picture:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Anonymous.svg/200px-Anonymous.svg.png",
            pubkey: pubkey,
          });
          return;
        }
        let profile = JSON.parse(kind0.content);
        setUser({ name: profile.name, picture: profile.picture, pubkey });
      });
    } else {
      setUser(null);
    }
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, profiles, addEventToProfiles }}>
      {children}
    </AppContext.Provider>
  );
}
