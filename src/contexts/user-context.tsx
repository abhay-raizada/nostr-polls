import { createContext, ReactNode, useEffect, useState } from "react";
import { getKeysFromLocalStorage } from "../utils/localStorage";
import { fetchUserProfile} from "../nostr";
import { DEFAULT_IMAGE_URL } from "../utils/constants";
import { useAppContext } from "../hooks/useAppContext";
import { Event } from "nostr-tools";

export type User = {
  name?: string;
  picture?: string;
  pubkey: string;
  privateKey?: string;
  follows?: string[];
};

interface UserContextInterface {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const ANONYMOUS_USER_NAME = 'Anon...'

export const UserContext = createContext<UserContextInterface | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { poolRef, profiles, addEventToProfiles } = useAppContext();

  useEffect(() => {
    // Fetch user profile when component mounts
    const keys = getKeysFromLocalStorage();
    if (Object.keys(keys).length !== 0 && !user) {
      fetchUserProfile(keys.pubkey, poolRef.current).then(
        (kind0: Event | null) => {
          if (!kind0) {
            setUser({
              name: ANONYMOUS_USER_NAME,
              picture: DEFAULT_IMAGE_URL,
              pubkey: keys.pubkey,
              privateKey: keys.secret,
            });
            return;
          }
          let profile = JSON.parse(kind0.content);
          setUser({
            name: profile.name,
            picture: profile.picture,
            pubkey: keys.pubkey,
            privateKey: keys.secret,
            ...profile,
          });
          addEventToProfiles(kind0);
        }
      );
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
