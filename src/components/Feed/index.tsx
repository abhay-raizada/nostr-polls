import { useEffect, useState } from "react";
import { defaultRelays } from "../../nostr";
import { Event } from "nostr-tools/lib/types/core";
import { Filter } from "nostr-tools/lib/types/filter";
import { Feed } from "./Feed";
import { useAppContext } from "../../hooks/useAppContext";
import { SubCloser } from "nostr-tools/lib/types/abstract-pool";
import { verifyEvent } from "nostr-tools";
import { useUserContext } from "../../hooks/useUserContext";
import { Typography } from "@mui/material";

export const PrepareFeed = () => {
  const [pollEvents, setPollEvents] = useState<Event[] | undefined>();
  const [userResponses, setUserResponses] = useState<Event[] | undefined>();
  let filter = "Polls";
  const [feedSubscritpion, setFeedSubscription] = useState<
    SubCloser | undefined
  >();
  const { poolRef } = useAppContext();
  const { user } = useUserContext();

  const handleFeedEvents = (event: Event, closer: SubCloser) => {
    if (verifyEvent(event) && !pollEvents?.includes(event)) {
      setPollEvents((prevEvents) => [...(prevEvents || []), event]);
    }
    if (pollEvents?.length || 0 >= 100) closer.close();
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
    setUserResponses((prevResponses: Event[] | undefined) => [
      ...(prevResponses || []),
      event,
    ]);
  };

  const fetchFeedEvents = () => {
    const relays = defaultRelays;
    const filters: Filter[] = [
      {
        kinds: filter === "All" ? [1, 1068] : [1068],
        limit: 20,
      },
    ];
    let newCloser = poolRef.current.subscribeMany(relays, filters, {
      onevent: (event) => {
        handleFeedEvents(event, newCloser);
      },
    });
    return newCloser;
  };

  const fetchResponseEvents = () => {
    const relays = defaultRelays;
    const filters: Filter[] = [
      {
        kinds: [1018, 1070],
        authors: [user!.pubkey],
        limit: 40,
      },
    ];
    let closer = poolRef.current.subscribeMany(relays, filters, {
      onevent: handleResponseEvents,
    });
    return closer;
  };

  useEffect(() => {
    if (feedSubscritpion) feedSubscritpion.close();
    if (pollEvents?.length) setPollEvents([]);
    let newCloser: SubCloser | undefined = undefined;
    newCloser = fetchFeedEvents();
    setFeedSubscription(newCloser);
    return () => {
      if (newCloser) newCloser.close();
      if (feedSubscritpion) feedSubscritpion.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, poolRef]);

  useEffect(() => {
    let closer: SubCloser | undefined;
    if (user && !userResponses && poolRef && !closer) {
      closer = fetchResponseEvents();
    }
    return () => {
      if (closer) {
        closer.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, poolRef]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center",
      }}
    >
      {/* <Select
        value={filter}
        variant="standard"
        onChange={(e) => {
          setFilter(e.target.value as string);
        }}
        style={{ maxWidth: 600 }}
      >
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="Pol
      ls">Polls</MenuItem>
      </Select> */}
      <div style={{ margin: 10 }}>
        <Typography sx={{ fontSize: 18 }}>global polls</Typography>
      </div>
      <Feed
        events={pollEvents || []}
        userResponses={getUniqueLatestEvents(userResponses || [])}
      />
    </div>
  );
};
