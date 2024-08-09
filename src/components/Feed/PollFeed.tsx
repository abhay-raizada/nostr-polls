// PollFeed.tsx
import { Event } from "nostr-tools/lib/types/core";
import React, { useEffect, useState } from "react";
import PollResponseForm from "../PollResponse/PollResponseForm";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "20px auto",
    width: "100%",
    maxWidth: "600px",
  },
}));

interface PollFeedProps {
  events: Event[];
  userResponses: Map<string, Event>;
}

export const PollFeed: React.FC<PollFeedProps> = ({ events, userResponses }) => {
  const classes = useStyles();
  const [eventIdsMap, setEventIdsMap] = useState<{ [key: string]: Event }>({});

  useEffect(() => {
    let newEventIdsMap = { ...eventIdsMap };
    events.forEach((event) => {
      newEventIdsMap[event.id] = event;
    });
    setEventIdsMap(newEventIdsMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  return (
    <div>
      {Object.keys(eventIdsMap).map((eventId: string) => {
        return (
          <div className={classes.root} key={eventId}>
            <PollResponseForm
              pollEvent={eventIdsMap[eventId]}
              key={eventId}
              userResponse={userResponses.get(eventId)}
            />
          </div>
        );
      })}
    </div>
  );
};
