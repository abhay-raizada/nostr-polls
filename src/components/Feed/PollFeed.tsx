import { Event } from "nostr-tools/lib/types/core";
import React, { useEffect, useState } from "react";
import PollResponseForm from "../PollResponse/PollResponseForm";
import { makeStyles } from "@mui/styles";
import { SimplePool } from "nostr-tools";
import { Filter } from "nostr-tools/lib/types/filter";
import { defaultRelays } from "../../nostr";
import { useAppContext } from "../../hooks/useAppContext";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "20px auto", // adds gap from the edge and centers the card horizontally
    width: "100%", // controls the size of your card
    maxWidth: "600px", // sets a maximum width for larger screens to prevent it getting too wide
  },
}));

interface PollFeedProps {
  events: Event[];
  userResponses: { [key: string]: string };
}

export const PollFeed: React.FC<PollFeedProps> = ({
  events,
  userResponses,
}) => {
  const classes = useStyles();
  const [eventIdsMap, setEventIdsMap] = useState<{ [key: string]: Event }>({});
  useEffect(() => {
    let newEventIdsMap = { ...eventIdsMap };
    events.map((event) => {
      newEventIdsMap[event.id] = event;
    });
    setEventIdsMap(newEventIdsMap);
  }, [events]);
  return (
    <div>
      {Object.keys(eventIdsMap).map((eventId: string) => {
        return (
          <div className={classes.root} key={eventId}>
            <PollResponseForm
              showDetailsMenu={true}
              pollEvent={eventIdsMap[eventId]}
              key={eventId}
              userResponse={userResponses[eventId]}
            />
          </div>
        );
      })}
    </div>
  );
};
