// PollResponseForm.tsx
import React, { useState } from 'react';
import { Button, Card, CardContent, Grid, Typography, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup, MenuItem, Menu } from '@mui/material';
import { Event } from 'nostr-tools/lib/types/core'
import { SimplePool } from 'nostr-tools';
import { defaultRelays } from '../../nostr';
import { FetchResults } from './FetchResults';
import { useNavigate } from 'react-router-dom';
interface PollResponseFormProps {
    pollEvent: Event;
    showDetailsMenu?: boolean
}

const PollResponseForm: React.FC<PollResponseFormProps> = ({ pollEvent, showDetailsMenu }) => {
    const [response, setResponse] = useState<string>("");
    const [showResults, setShowResults] = useState<boolean>(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const navigate = useNavigate();

    const handleResponseChange = (response: string) => {
        setResponse(response);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        if (!window.nostr) { alert("Nostr Signer Extension Is Required."); return; }
        e.preventDefault();
        const responseEvent = {
            kind: 1018,
            content: "",
            tags: [
                ["e", pollEvent.id],
                ["response", response]
            ],
            pubkey: await window.nostr.getPublicKey(),
            created_at: Math.floor(Date.now() / 1000)
        };
        const signedResponse = await window.nostr.signEvent(responseEvent);
        const pool = new SimplePool();
        console.log("Final Response before sending.", signedResponse)
        const messages = await Promise.allSettled(pool.publish(defaultRelays, signedResponse));
        console.log("reply from relays", messages)
    };

    const toggleResults = () => {
        setShowResults(!showResults)
    }

    let label = pollEvent.tags.find((t) => t[0] === "label")?.[1];
    let options = pollEvent.tags.filter((t) => t[0] === "option")

    return (
        <Card variant="elevation" className="poll-response-form" style={{ margin: 10 }} >
            <div>
            {showDetailsMenu ? <Button onClick={(e) => {
                setIsDetailsOpen(!isDetailsOpen);
                setAnchorEl(e.currentTarget)
             }}>deets</Button> : null}
            <Menu open={isDetailsOpen} anchorEl={anchorEl} onClose={() => {setAnchorEl(null); setIsDetailsOpen(false)}}>
                <MenuItem onClick={() => navigate(`/respond/${pollEvent.id}`)}>Open Url</MenuItem>
            </Menu>
            </div>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Card variant="outlined">
                        <CardContent>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">{label}</FormLabel>
                                <RadioGroup
                                    aria-label={label}
                                    name={pollEvent.id}
                                    value={response}
                                    onChange={(e) => handleResponseChange(e.target.value)}
                                >
                                    {options.map(option => (
                                        <FormControlLabel key={option[1]} value={option[1]} control={<Radio />} label={option[2]} />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            <Button onClick={toggleResults}>
                                {showResults ? <>Hide Results</> : <>Show Results</>}
                            </Button>

                            {showResults ? <FetchResults pollEvent={pollEvent} /> : null}
                        </CardContent>
                    </Card>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">Submit Response</Button>
                    </Grid>
                </Grid>
            </form>
        </Card>
    );
};

export default PollResponseForm;
