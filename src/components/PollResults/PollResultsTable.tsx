// PollResults.tsx
import React from 'react';
import { Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';

interface PollResultsProps {
  pollData: {
    pollId: string;
    fields: {
      fieldId: string;
      label: string;
      options: string[];
    }[];
  };
  events: any[]; // Replace with actual event data structure
}

const PollResults: React.FC<PollResultsProps> = ({ pollData, events }) => {
  const calculateResults = () => {
    const results: Record<string, number[]> = {};

    // Initialize results object with zero counts for each option
    pollData.fields.forEach(field => {
      results[field.fieldId] = new Array(field.options.length).fill(0);
    });

    // Count responses from events
    events.forEach(event => {
      if (event.kind === 1069 && event.tags) { // Assuming kind 1069 is for responses
        event.tags.forEach((tag: any) => {
          if (tag[0] === 'response' && tag.length === 4) {
            const fieldId = tag[1];
            const responseIndex = pollData.fields.find(field => field.fieldId === fieldId)?.options.indexOf(tag[2]);
            if (responseIndex !== undefined && responseIndex !== -1) {
              results[fieldId][responseIndex]++;
            }
          }
        });
      }
    });

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
                <TableCell>{pollData.pollId}</TableCell>
                <TableCell>{event.tags[1][2]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Analytics Section */}
      <Typography variant="h6" gutterBottom>Analytics</Typography>
      {pollData.fields.map(field => (
        <div key={field.fieldId}>
          <Typography variant="subtitle1" gutterBottom>{field.label}</Typography>
          <TableContainer component={Paper}>
            <Table aria-label={`analytics for ${field.label}`}>
              <TableHead>
                <TableRow>
                  <TableCell>Option</TableCell>
                  <TableCell>Tally</TableCell>
                  <TableCell>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {field.options.map((option, index) => (
                  <TableRow key={index}>
                    <TableCell>{option}</TableCell>
                    <TableCell>{results[field.fieldId][index]}</TableCell>
                    <TableCell>{calculatePercentages(results[field.fieldId])[index]}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}
    </div>
  );
};

export default PollResults;
