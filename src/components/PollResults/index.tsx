import { useNavigate, useParams } from "react-router-dom";
import PollResultsTable from "./PollResultsTable";
import { Filter } from "nostr-tools/lib/types/filter";
import { Event } from "nostr-tools/lib/types/core";
import { SimplePool } from "nostr-tools";
import { defaultRelays } from "../../nostr";
import { useEffect, useState } from "react";
import { MenuItem, Select, Typography } from "@mui/material";

export const PollResults = () => {
  let { eventId } = useParams();
  const [pollEvent, setPollEvent] = useState<Event | undefined>();
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
    if (event.kind === 1068) {
      console.log("Setting poll event");
      setPollEvent(event);
    }
    if (event.kind === 1070) {
      setResponses((prevResponses) => [...(prevResponses || []), event]);
    }
    if (
      event.kind === 30018 &&
      event.tags.some((tag) => tag[0] === "e" && tag[1] === eventId)
    ) {
      setListEvents((prevListEvents) => [...(prevListEvents || []), event]);
    }
  };

  const fetchPollEvents = async () => {
    if (!eventId) {
      alert("Invalid url");
      navigate("/");
    }
    let resultFilter: Filter = {
      "#e": [eventId!],
      kinds: [1070],
    };

    let pollFilter: Filter = {
      ids: [eventId!],
    };

    let listFilter: Filter = {
      "#e": [eventId!],
      kinds: [30018],
    };
    let pool = new SimplePool();
    pool.subscribeMany(defaultRelays, [resultFilter, pollFilter, listFilter], {
      onevent: handleResultEvent,
    });
  };

  useEffect(() => {
    if (!pollEvent) {
      fetchPollEvents();
    }
  }, [pollEvent]);

  console.log(pollEvent);

  if (pollEvent === undefined) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <Select
        value={selectedEvent}
        onChange={(e) =>
          setSelectedEvent(
            listEvents?.find((event) => event.id === e.target.value)
          )
        }
      >
        {listEvents?.map((event) => (
          <MenuItem key={event.id}>{event.content}</MenuItem>
        ))}
      </Select>
      <PollResultsTable
        pollEvent={pollEvent}
        events={getUniqueLatestEvents(respones || [])}
      />
    </>
  );
};
