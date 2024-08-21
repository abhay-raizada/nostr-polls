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
  commentsMap: Map<string, Event[]> | undefined;
  addEventToProfiles: (event: Event) => void;
  poolRef: React.MutableRefObject<SimplePool>;
  addCommentToMap: (event: Event) => void;
  fetchUserProfileThrottled: (pubkey: string) => void
  fetchCommentsThrottled: (pollEventId: string) => void
};
export const AppContext = createContext<AppContextInterface | null>(null);

// Provider component
export function AppContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [commentsMap, setCommentsMap] = useState<Map<string, Event[]>>(new Map());
  const poolRef = useRef(new SimplePool());

  const addEventToProfiles = (event: Event) => {
    if (profiles.has(event.pubkey)) return;
    try {
      let content = JSON.parse(event.content)
      profiles.set(event.pubkey, content)
      setProfiles(profiles)
    } catch (e) { console.error("Error parsing event", e); }
  }

  const addEventsToProfiles = (events: Event[]) => {
    events.map((event: Event) => {
      addEventToProfiles(event)
    })
  }

  const addCommentToMap = (event: Event) => {
    let pollId = event.tags.filter((t) => t[0] === "e")[0][1]
    if (!commentsMap.get(pollId)?.map((e) => e.id).includes(event.id)) {
      setCommentsMap((prev) => new Map(prev.set(pollId, [...(prev.get(pollId) || []), event])))
    }
  }

  const addCommentsToMap = (events: Event[]) => {
    events.map((event: Event) => {
      addCommentToMap(event)
    })
  }

  const ProfileThrottler = useRef(new Throttler(10, poolRef.current, addEventsToProfiles, "profiles"));
  const CommentsThrottler = useRef(new Throttler(10, poolRef.current, addCommentsToMap, "comments"));

  const fetchUserProfileThrottled = (pubkey: string) => {
    ProfileThrottler.current.addId(pubkey);
  };

  const fetchCommentsThrottled = (pollEventId: string) => {
    CommentsThrottler.current.addId(pollEventId)
  }

  useEffect(() => {
    // Fetch user profile when component mounts
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
        setUser({ name: profile.name, picture: profile.picture, pubkey, ...profile });
        addEventToProfiles(kind0)
      });
    } else {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  return (
    <AppContext.Provider value={{
      user,
      setUser, profiles, addEventToProfiles, commentsMap, poolRef, fetchUserProfileThrottled, fetchCommentsThrottled, addCommentToMap
    }}>
      {children}
    </AppContext.Provider>
  );
}
