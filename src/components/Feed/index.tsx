import { useEffect, useState } from "react";
import { defaultRelays } from "../../nostr";
import { Event } from "nostr-tools/lib/types/core";
import { Filter } from "nostr-tools/lib/types/filter";
import { PollFeed } from "./PollFeed";
import { useAppContext } from "../../hooks/useAppContext";
import { SubCloser } from "nostr-tools/lib/types/abstract-pool";

export const PrepareFeed = () => {
  const [pollEvents, setPollEvents] = useState<Event[] | undefined>();
  const [userResponses, setUserResponses] = useState<Event[] | undefined>();
  const { user, poolRef } = useAppContext();

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
    const relays = defaultRelays;
    const filters: Filter[] = [
      {
        kinds: [1068],
        limit: 100,
      },
    ];
    console.log("final filters are", filters);
    let closer = poolRef.current.subscribeMany(relays, filters, {
      onevent: handleFeedEvents,
    });
    return closer;
  };

  const fetchResponseEvents = () => {
    const relays = defaultRelays;
    const filters: Filter[] = [
      {
        kinds: [1018, 1070],
        authors: [user!.pubkey],
        limit: 100
      },
    ];
    let closer = poolRef.current.subscribeMany(relays, filters, {
      onevent: handleResponseEvents,
    });
    return closer
  };

  useEffect(() => {
    let closer: SubCloser | undefined = undefined
    if (!pollEvents && poolRef && !closer) {
      closer = fetchPollEvents()
    }
    return () => {
      if (closer) closer.close()
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolRef]);

  useEffect(() => {
    let closer: SubCloser | undefined;
    if (user && !userResponses && poolRef && !closer) {
      closer = fetchResponseEvents()
    }
    return () => {
      if (closer) {
        closer.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, poolRef]);

  return (
    <PollFeed
      events={pollEvents || []}
      userResponses={getUniqueLatestEvents(userResponses || [])}
    />
  );
};
