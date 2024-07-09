import { useEffect, useState } from "react";
import { SimplePool } from "nostr-tools";
import { defaultRelays } from "../../nostr";
import { Event } from "nostr-tools/lib/types/core";
import { Filter } from "nostr-tools/lib/types/filter";
import { PollFeed } from "./PollFeed";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";

export const PrepareFeed = () => {
  const [pollEvents, setPollEvents] = useState<Event[] | undefined>();
  const [userResponses, setUserResponses] = useState<Record<string, string>>(
    {}
  );
  const { user } = useAppContext();

  const handleFeedEvents = (event: Event) => {
    //console.log("GOT EVENT", event);
    setPollEvents((prevEvents) => [...(prevEvents || []), event]);
  };

  const handleResponseEvents = (event: Event) => {
    console.log("Response Event", event);
    const pollId = event.tags.find((t) => t[0] === "e")?.[1];
    const userResponse = event.tags.find((t) => t[0] === "response")?.[1];
    setUserResponses((prevResponses: Record<string, string>) => ({
      ...prevResponses,
      [pollId!]: userResponse!,
    }));
  };

  const fetchPollEvents = () => {
    let pool = new SimplePool();
    const relays = defaultRelays;
    const filters: Filter[] = [
      {
        kinds: [1068],
        limit: 100,
      },
    ];
    console.log("final filters are", filters);
    return new Promise((resolve) => {
      pool.subscribeMany(relays, filters, {
        onevent: handleFeedEvents,
      });
      return pool;
    });
  };

  const fetchResponseEvents = () => {
    let pool = new SimplePool();
    const relays = defaultRelays;
    const filters: Filter[] = [
      {
        kinds: [1018, 1070],
        authors: [user!.pubkey],
        limit: 100,
      },
    ];
    return new Promise((resolve) => {
      pool.subscribeMany(relays, filters, {
        onevent: handleResponseEvents,
      });
      return pool;
    });
  };

  useEffect(() => {
    let pool: SimplePool | undefined;
    if (pollEvents === undefined) {
      fetchPollEvents()
        .then((fetchedPool) => {
          pool = fetchedPool as SimplePool;
        })
        .catch(console.error);
    }
    return () => {
      if (pool) pool.close(defaultRelays);
    };
  }, []);

  useEffect(() => {
    let pool: SimplePool | undefined;
    console.log(
      "User IS",
      user,
      "Responses is",
      Object.keys(userResponses).length
    );
    if (user && Object.keys(userResponses).length === 0) {
      fetchResponseEvents()
        .then((fetchedPool) => {
          pool = fetchedPool as SimplePool;
        })
        .catch(console.error);
    }
    return () => {
      if (pool) pool.close(defaultRelays);
    };
  }, [user]);

  return <PollFeed events={pollEvents || []} userResponses={userResponses} />;
};
