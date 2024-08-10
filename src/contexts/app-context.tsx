import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import { fetchUserProfile } from "../nostr";
import { Event } from "nostr-tools/lib/types/core";
import { getPubKeyFromLocalStorage } from "../utils/localStorage";
import { Profile } from "../nostr/types";
import { SimplePool } from "nostr-tools";
import { DEFAULT_IMAGE_URL } from "../utils/constants";
import { Throttler } from "../nostr/requestThrottler";

type User = { name?: string; picture?: string; pubkey: string };

type AppContextInterface = {
  user: User | null;
  setUser: (user: User | null) => void;
  profiles: Map<string, Profile> | undefined;
  addEventToProfiles: (event: Event) => void;
  poolRef: React.MutableRefObject<SimplePool>;
  fetchUserProfileThrottled: (pubkey: string) => void
};
export const AppContext = createContext<AppContextInterface | null>(null);

// Provider component
export function AppContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const poolRef = useRef(new SimplePool());

  const addEventToProfiles = (event: Event) => {
    if (profiles?.has(event.pubkey)) return;
    try {
      let content = JSON.parse(event.content)
      profiles?.set(event.pubkey, content)
      setProfiles(profiles)
    } catch (e) { console.error("Error parsing event", e); }
  }

  const throttler = useRef(new Throttler(10, poolRef.current, addEventToProfiles));

  const fetchUserProfileThrottled = (pubkey: string) => {
    throttler.current.add(pubkey);
  };

  useEffect(() => {
    // Fetch user profile when component mounts
    console.log("Profiles are ", profiles)
    const pubkey = getPubKeyFromLocalStorage();
    if (pubkey && !user) {
      fetchUserProfile(pubkey, poolRef.current).then((kind0: Event | null) => {
        console.log("Fetched user is", kind0);
        if (!kind0) {
          setUser({
            name: "Anon..",
            picture: DEFAULT_IMAGE_URL,
            pubkey: pubkey,
          });
          return;
        }
        let profile = JSON.parse(kind0.content);
        setUser({ name: profile.name, picture: profile.picture, pubkey });
        addEventToProfiles(kind0)
      });
    } else {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  return (
    <AppContext.Provider value={{ user, setUser, profiles, addEventToProfiles, poolRef, fetchUserProfileThrottled }}>
      {children}
    </AppContext.Provider>
  );
}
