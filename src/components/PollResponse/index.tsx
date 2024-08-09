import { useNavigate, useParams } from "react-router-dom";
import PollResponseForm from "./PollResponseForm";
import { useEffect, useState } from "react";
import { Event } from 'nostr-tools/lib/types/core';
import { Filter } from 'nostr-tools/lib/types/filter';
import { defaultRelays } from "../../nostr";
import { Button, Typography } from "@mui/material";
import { useAppContext } from "../../hooks/useAppContext";

export const PollResponse = () => {
  const { eventId } = useParams();
  const [pollEvent, setPollEvent] = useState<Event | undefined>();
  const navigate = useNavigate();

  const { poolRef } = useAppContext();

  const fetchPollEvent = async () => {
    if (!eventId) {
      alert("Invalid URL");
      navigate("/");
      return;
    }
    const filter: Filter = {
      ids: [eventId!],
    };
    try {
      const events = await poolRef.current.querySync(defaultRelays, filter);
      if (events.length === 0) {
        alert("Could not find the given poll");
        navigate("/");
        return;
      }
      setPollEvent(events[0]);
    } catch (error) {
      console.error("Error fetching poll event:", error);
      alert("Error fetching poll event.");
      navigate("/");
    }
  };


  useEffect(() => {
    fetchPollEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (pollEvent === undefined) return <Typography>Loading...</Typography>;

  return (
    <>
      <PollResponseForm pollEvent={pollEvent} />
      <Button onClick={() => navigate("/")}>Feed</Button>
    </>
  );
};
