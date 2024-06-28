// PollResults.tsx
import React from 'react';
import { Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import { Event } from "nostr-tools/lib/types/core";

interface PollResultsProps {
  pollEvent: Event
  events: any[]; // Replace with actual event data structure
}

const PollResults: React.FC<PollResultsProps> = ({ pollEvent, events }) => {
  const label = pollEvent.tags.find((t) => t[0] === "label")?.[1]
  const options = pollEvent.tags.filter((t) => t[0] === "option")
  const calculateResults = () => {
    let results: number[] = [];
    // Initialize results object with zero counts for each option
    results = new Array(options.length).fill(0);

    // Count responses from events
    events.forEach(event => {
      event.tags.forEach((tag: any) => {
        if (tag[0] === 'response') {
          const optionId = tag[1];
          const responseIndex = options.findIndex((optionTag) => optionTag[1] === optionId);
          if (responseIndex !== undefined && responseIndex !== -1) {
            results[responseIndex]++;
          }
        }
      });
    });

    console.log("Results are", results)

    return results;
  };

  const results = calculateResults();

  const calculatePercentages = (counts: number[]) => {
    const total = counts.reduce((acc, count) => acc + count, 0);
    return counts.map(count => ((count / total) * 100).toFixed(2));
  };

  return (
    <div className="poll-results">
      <Typography variant="h5" gutterBottom>Poll Results</Typography>

      {/* Raw Data Table */}
      <Typography variant="h6" gutterBottom>Raw Data</Typography>
      <TableContainer component={Paper}>
        <Table aria-label="poll results table">
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Response</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event, index) => (
              <TableRow key={index}>
                <TableCell>{label}</TableCell>
                <TableCell>{event.tags[1][1]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Analytics Section */}
      <Typography variant="h6" gutterBottom>Analytics</Typography>
      <Typography variant="subtitle1" gutterBottom>{label}</Typography>
      <TableContainer component={Paper}>
        <Table aria-label={`analytics for ${label}`}>
          <TableHead>
            <TableRow>
              <TableCell>Option</TableCell>
              <TableCell>Tally</TableCell>
              <TableCell>Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {options.map((option, index) => (
              <TableRow key={index}>
                <TableCell>{option}</TableCell>
                <TableCell>{results[index]}</TableCell>
                <TableCell>{calculatePercentages(results)[index]}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default PollResults;
