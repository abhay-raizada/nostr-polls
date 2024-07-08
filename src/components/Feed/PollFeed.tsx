import { Event } from "nostr-tools/lib/types/core";
import React from "react";
import PollResponseForm from "../PollResponse/PollResponseForm";
import { Card } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "20px auto", // adds gap from the edge and centers the card horizontally
    width: "100%", // controls the size of your card
    maxWidth: "600px", // sets a maximum width for larger screens to prevent it getting too wide
  },
}));

interface PollFeedProps {
  events: Event[];
}

export const PollFeed: React.FC<PollFeedProps> = ({ events }) => {
  const classes = useStyles();
  return (
    <div>
      {events.map((event: Event) => {
        return (
          <div className={classes.root}>
            <PollResponseForm showDetailsMenu={true} pollEvent={event} />
          </div>
        );
      })}
    </div>
  );
};
