import { useEffect, useState } from "react";
import { SimplePool } from "nostr-tools";
import { defaultRelays } from "../../nostr";
import { Event } from "nostr-tools/lib/types/core";
import { Filter } from "nostr-tools/lib/types/filter";
import { PollFeed } from "./PollFeed";
import { useAppContext } from "../../hooks/useAppContext";

export const PrepareFeed = () => {
  const [pollEvents, setPollEvents] = useState<Event[] | undefined>();
  const [userResponses, setUserResponses] = useState<Event[] | undefined>();
  const { user } = useAppContext();

  const handleFeedEvents = (event: Event) => {
    //console.log("GOT EVENT", event);
    setPollEvents((prevEvents) => [...(prevEvents || []), event]);
  };

  const getUniqueLatestEvents = (events: Event[]) => {
    const eventMap = new Map<string, Event>();

    events.forEach((event) => {
      let pollId = event.tags.find((t) => t[0] === "e")?.[1];
      if (!pollId) return;
      if (
        !eventMap.has(pollId) ||
        event.created_at > eventMap.get(pollId)!.created_at
      ) {
        eventMap.set(pollId, event);
      }
    });
    return eventMap;
  };

  const handleResponseEvents = (event: Event) => {
    console.log("prev responses", userResponses, "new response", event);
    setUserResponses((prevResponses: Event[] | undefined) => [
      ...(prevResponses || []),
      event,
    ]);
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
    if (user && !userResponses) {
      fetchResponseEvents()
        .then((fetchedPool) => {
          pool = fetchedPool as SimplePool;
        })
        .catch(console.error);
    }
    return () => {
      console.log("Closing Response Pool");
      if (pool) {
        pool.close(defaultRelays);
        console.log("Pool closed");
      }
    };
  }, [user]);

  return (
    <PollFeed
      events={pollEvents || []}
      userResponses={getUniqueLatestEvents(userResponses || [])}
    />
  );
};
