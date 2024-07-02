import { useNavigate, useParams } from "react-router-dom";
import { Filter } from "nostr-tools/lib/types/filter";
import { Event } from "nostr-tools/lib/types/core";
import { SimplePool } from "nostr-tools";
import { defaultRelays } from "../../nostr";
import { useEffect, useState } from "react";
import { MenuItem, Select, Typography } from "@mui/material";
import { Analytics } from "../PollResults/Analytics";

interface FetchResultsProps {
  pollEvent: Event;
}
export const FetchResults: React.FC<FetchResultsProps> = ({ pollEvent }) => {
  const [respones, setResponses] = useState<Event[] | undefined>();
  const [listEvents, setListEvents] = useState<Event[] | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  let navigate = useNavigate();

  const getUniqueLatestEvents = (events: Event[]) => {
    const eventMap = new Map<string, any>();

    events.forEach((event) => {
      if (
        !eventMap.has(event.pubkey) ||
        event.created_at > eventMap.get(event.pubkey).created_at
      ) {
        eventMap.set(event.pubkey, event);
      }
    });

    return Array.from(eventMap.values());
  };

  const handleResultEvent = (event: Event) => {
    console.log("GOT EVENT", event, event.kind);
    if (event.kind === 1070) {
      setResponses((prevResponses) => [...(prevResponses || []), event]);
    }
    if (
      event.kind === 30018 &&
      event.tags.some((tag) => tag[0] === "e" && tag[1] === pollEvent.id)
    ) {
      setListEvents((prevListEvents) => [...(prevListEvents || []), event]);
    }
  };

  const fetchPollEvents = async () => {
    let resultFilter: Filter = {
      "#e": [pollEvent.id],
      kinds: [1070],
    };
    let listFilter: Filter = {
      "#e": [pollEvent.id],
      kinds: [30018],
    };
    let pool = new SimplePool();
    pool.subscribeMany(defaultRelays, [resultFilter, listFilter], {
      onevent: handleResultEvent,
    });
    return pool;
  };

  useEffect(() => {
    let pool: SimplePool;
    if (!respones) {
      fetchPollEvents().then((queryPool) => {
        pool = queryPool;
      });
    }
    return () => {
      if (pool) pool.close(defaultRelays);
    };
  }, [pollEvent]);

  console.log(pollEvent);

  return (
    <>
      <Select
        value={selectedEvent?.id}
        onChange={(e) =>
          setSelectedEvent(
            listEvents?.find((event) => event.id === e.target.value)
          )
        }
      >
        {listEvents?.map((event) => (
          <MenuItem key={event.id} value={event.id}>
            {event.content}
          </MenuItem>
        ))}
      </Select>
      <Analytics
        pollEvent={pollEvent}
        responses={getUniqueLatestEvents(respones || [])}
      />
    </>
  );
};
