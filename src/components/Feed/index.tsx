import { useEffect, useState } from 'react';
import { SimplePool } from 'nostr-tools';
import { defaultRelays } from '../../nostr';
import { Event } from 'nostr-tools/lib/types/core'
import { Filter } from 'nostr-tools/lib/types/filter'
import { PollFeed } from './PollFeed';

export const PrepareFeed = () => {
  const [pollEvents, setPollEvents] = useState<Event[]>([]);

  const handleFeedEvents = (event: Event) => {
    setPollEvents((prevEvents) => [...prevEvents, event])
  }

  const fetchPollEvents = () => {
    let pool = new SimplePool();
    const relays = defaultRelays
  
    const filter: Filter = {
      kinds: [1068],
      limit: 100,
    };
  
    return new Promise((resolve) => {
      pool.subscribeMany(relays, [filter], {
          onevent: handleFeedEvents
      })
      return pool
    });
  };


  useEffect(() => {
    let pool: SimplePool | undefined;
    fetchPollEvents()
      .then((fetchedPool) => {
        pool = fetchedPool as SimplePool;
      })
      .catch(console.error);

    return () => {
      if (pool) pool.close(defaultRelays)
    };
  }, []);

  return <><PollFeed events={pollEvents} /></>;
};