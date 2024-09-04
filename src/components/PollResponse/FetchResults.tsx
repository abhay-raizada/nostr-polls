import { Filter } from "nostr-tools/lib/types/filter";
import { Event } from "nostr-tools/lib/types/core";
import { defaultRelays } from "../../nostr";
import { useEffect, useState } from "react";
import { Analytics } from "../PollResults/Analytics";
import { useAppContext } from "../../hooks/useAppContext";
import { SubCloser } from "nostr-tools/lib/types/abstract-pool";

interface FetchResultsProps {
  pollEvent: Event;
  filterPubkeys?: string[];
}
export const FetchResults: React.FC<FetchResultsProps> = ({
  pollEvent,
  filterPubkeys,
}) => {
  const [respones, setResponses] = useState<Event[] | undefined>();
  const [closer, setCloser] = useState<SubCloser | undefined>();

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
    setResponses((prevResponses) => [...(prevResponses || []), event]);
  };

  const fetchVoteEvents = (filterPubkeys: string[]) => {
    if (closer) {
      closer.close();
      setResponses(undefined);
    }
    let resultFilter: Filter = {
      "#e": [pollEvent.id],
      kinds: [1070, 1018],
    };
    if (filterPubkeys?.length) {
      resultFilter.authors = filterPubkeys;
    }
    let newCloser = poolRef.current.subscribeMany(
      defaultRelays,
      [resultFilter],
      {
        onevent: handleResultEvent,
      }
    );
    setCloser(newCloser);
  };

  useEffect(() => {
    console.log("Filter pubkeys are", filterPubkeys);
    fetchVoteEvents(filterPubkeys || []);
    return () => {
      if (closer) closer.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolRef, filterPubkeys]);

  return (
    <>
      <Analytics
        pollEvent={pollEvent}
        responses={getUniqueLatestEvents(respones || [])}
      />
    </>
  );
};
