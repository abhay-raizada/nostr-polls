import { createContext, ReactNode, useEffect, useState } from "react";
import { getKeysFromLocalStorage } from "../utils/localStorage";
import { fetchUserProfile } from "../nostr";
import { DEFAULT_IMAGE_URL } from "../utils/constants";
import { useAppContext } from "../hooks/useAppContext";
import { Event } from "nostr-tools";

type User = {
  name?: string;
  picture?: string;
  pubkey: string;
  privateKey?: string;
};

interface UserContextInterface {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextInterface | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { poolRef, profiles, addEventToProfiles } = useAppContext();

  useEffect(() => {
    // Fetch user profile when component mounts
    const keys = getKeysFromLocalStorage();
    const pubkey = keys.pubkey;
    if (pubkey && !user) {
      fetchUserProfile(pubkey, poolRef.current).then((kind0: Event | null) => {
        if (!kind0) {
          setUser({
            name: "Anon..",
            picture: DEFAULT_IMAGE_URL,
            pubkey: pubkey,
          });
          return;
        }
        let profile = JSON.parse(kind0.content);
        setUser({
          name: profile.name,
          picture: profile.picture,
          pubkey,
          ...profile,
        });
        addEventToProfiles(kind0);
      });
    } else {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}