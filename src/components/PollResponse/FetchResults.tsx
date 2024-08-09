import { Filter } from "nostr-tools/lib/types/filter";
import { Event } from "nostr-tools/lib/types/core";
import { defaultRelays } from "../../nostr";
import { useEffect, useState } from "react";
import { Analytics } from "../PollResults/Analytics";
import { useAppContext } from "../../hooks/useAppContext";
import { SubCloser } from "nostr-tools/lib/types/abstract-pool";

interface FetchResultsProps {
  pollEvent: Event;
}
export const FetchResults: React.FC<FetchResultsProps> = ({ pollEvent }) => {
  const [respones, setResponses] = useState<Event[] | undefined>();

  const { poolRef } = useAppContext();
  const getUniqueLatestEvents = (events: Event[]) => {
    const eventMap = new Map<string, Event>();

    events.forEach((event) => {
      if (
        !eventMap.has(event.pubkey) ||
        event.created_at > eventMap.get(event.pubkey)!.created_at
      ) {
        eventMap.set(event.pubkey, event);
      }
    });

    return Array.from(eventMap.values());
  };

  const handleResultEvent = (event: Event) => {
    console.log("GOT EVENT", event, event.kind);
    setResponses((prevResponses) => [...(prevResponses || []), event]);
  };

  const fetchVoteEvents = () => {
    let resultFilter: Filter = {
      "#e": [pollEvent.id],
      kinds: [1070, 1018],
    };
    let closer = poolRef.current.subscribeMany(defaultRelays, [resultFilter], {
      onevent: handleResultEvent,
    });
    return closer
  };

  useEffect(() => {
    let closer: SubCloser
    if (!respones) {
      closer = fetchVoteEvents()
    }
    return () => {
      if (closer) closer.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolRef]);

  console.log(pollEvent);

  return (
    <>
      <Analytics
        pollEvent={pollEvent}
        responses={getUniqueLatestEvents(respones || [])}
      />
    </>
  );
};
