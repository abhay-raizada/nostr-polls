// PollFeed.tsx
import { Event } from "nostr-tools/lib/types/core";
import React, { useEffect, useState } from "react";
import PollResponseForm from "../PollResponse/PollResponseForm";
import { makeStyles } from "@mui/styles";
import { Notes } from "../Notes";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "20px auto",
    width: "100%",
    maxWidth: "600px",
  },
}));

interface FeedProps {
  events: Event[];
  userResponses: Map<string, Event>;
}

export const Feed: React.FC<FeedProps> = ({ events, userResponses }) => {
  const classes = useStyles();
  const [eventIdsMap, setEventIdsMap] = useState<{ [key: string]: Event }>({});

  useEffect(() => {
    let newEventIdsMap: { [key: string]: Event } = {};
    events.forEach((event) => {
      newEventIdsMap[event.id] = event;
    });
    setEventIdsMap(newEventIdsMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  return (
    <div>
      {Object.keys(eventIdsMap)
        .sort((a, b) => {
          return eventIdsMap[b].created_at - eventIdsMap[a].created_at;
        })
        .map((eventId: string) => {
          if (eventIdsMap[eventId].kind === 1) {
            return (
              <div className={classes.root} key={eventId}>
                <Notes event={eventIdsMap[eventId]} key={eventId} />
              </div>
            );
          } else if (eventIdsMap[eventId].kind === 1068) {
            return (
              <div className={classes.root} key={eventId}>
                <PollResponseForm
                  pollEvent={eventIdsMap[eventId]}
                  key={eventId}
                  userResponse={userResponses.get(eventId)}
                />
              </div>
            );
          } else {
            return null;
          }
        })}
    </div>
  );
};
