import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { Event } from "nostr-tools/lib/types/core";

interface AnalyticsProps {
    pollEvent: Event
    responses: Event[]
}

export const Analytics: React.FC<AnalyticsProps> = ({
    pollEvent,
    responses
}) => {
    const label = pollEvent.tags.find((t) => t[0] === "label")?.[1]
    const options = pollEvent.tags.filter((t) => t[0] === "option")

    const calculateResults = () => {
        let results: number[] = [];
        // Initialize results object with zero counts for each option
        results = new Array(options.length).fill(0);

        // Count responses from events
        responses.forEach(event => {
            event.tags.forEach((tag: string[]) => {
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

    return (<>
    {/* <Typography variant="subtitle1" gutterBottom>{label}</Typography> */}
    <TableContainer component={Paper}>
        <Table aria-label={`Results for "${label}"`}>
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
                        <TableCell>{option[2]}</TableCell>
                        <TableCell>{results[index]}</TableCell>
                        <TableCell>{calculatePercentages(results)[index]}%</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer></>)
}