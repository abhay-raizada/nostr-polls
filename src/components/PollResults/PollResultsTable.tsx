// PollResults.tsx
import React, { useEffect } from 'react';
import { Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Avatar, Divider } from '@mui/material';
import { Event } from "nostr-tools/lib/types/core";
import { Analytics } from './Analytics';
import { useAppContext } from '../../hooks/useAppContext';
import { DEFAULT_IMAGE_URL } from '../../utils/constants';
import { openProfileTab } from '../../nostr';
import { nip19 } from 'nostr-tools';

interface PollResultsProps {
  pollEvent: Event
  events: Event[]; // Replace with actual event data structure
}

const PollResults: React.FC<PollResultsProps> = ({ pollEvent, events }) => {
  const label = pollEvent.content
  const options = pollEvent.tags.filter((t) => t[0] === "option")
  const { fetchUserProfileThrottled, profiles } = useAppContext();

  useEffect(() => {
    events.forEach(event => {
      fetchUserProfileThrottled(event.pubkey);
    });
  })


  const getResponseIds = (responses: string[][]) => {
    let responseIds = responses.map((r) => r[1])
    let responseIdSet = new Set(responseIds)
    return Array.from(responseIdSet)
  }

  const getOptionLabel = (optionId: string) => {
    return options.find(option => option[1] === optionId)?.[2];
  }
  return (
    <div className="poll-results" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <Typography variant="h6" gutterBottom>Detailed Responses</Typography>
      <TableContainer component={Paper} style={{margin: 10, maxWidth: "70%"}}>
        <Table aria-label="poll results table">
          <TableHead>
            <TableRow>
              <TableCell>Author</TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Response</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event, index) => {
              let responses = event.tags.filter((t) => t[0] === "response")
              let responseIds = getResponseIds(responses);
              return (
                <TableRow key={index}>
                  <TableCell><Avatar src={profiles?.get(event.pubkey)?.picture || DEFAULT_IMAGE_URL} 
                  onClick={() => { openProfileTab(nip19.npubEncode(event.pubkey))}}/></TableCell>
                  <TableCell>{label}</TableCell>
                  <TableCell>{responseIds.map((r) => getOptionLabel(r)).join(", ")}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <div style={{margin: "10", width: "70%" }} >
      <Analytics pollEvent={pollEvent} responses={events} />
      </div>
    </div>
  );
};

export default PollResults;
