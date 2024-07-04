import { useNavigate, useParams } from "react-router-dom";
import PollResponseForm from "./PollResponseForm"
import { useEffect, useState } from "react";
import { Event } from 'nostr-tools/lib/types/core'
import { Filter } from 'nostr-tools/lib/types/filter'
import { SimplePool } from "nostr-tools";
import { defaultRelays } from "../../nostr";
import { Button, Typography } from "@mui/material"

export const PollResponse = () => {
    let { eventId  } = useParams();
    const [pollEvent, setPollEvent] = useState<Event | undefined>();
    let navigate = useNavigate();

    const fetchPollEvent = async () => {
      if(!eventId) {
        alert("Invalid url")
        navigate("/")
      }
      let filter: Filter = {
        ids: [eventId!]
      }
      let pool = new SimplePool();
      let pollEvent = await pool.get(defaultRelays, filter);
      pool.close(defaultRelays)
      if(!pollEvent) { alert("Could not find given poll"); navigate("/"); }
      setPollEvent(pollEvent!)
    }

    useEffect(() => {
      if(!pollEvent) {
        fetchPollEvent();
      }
    }, [pollEvent])

    if(pollEvent === undefined) return (<Typography>Loading...</Typography>)

    return <><PollResponseForm pollEvent={pollEvent}/><Button onClick={()=>navigate("/")}>Feed</Button></>
}