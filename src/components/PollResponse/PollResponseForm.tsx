// PollResponseForm.tsx
import React, { useState } from 'react';
import { Button, Card, CardContent, Grid, Typography, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { Event } from 'nostr-tools/lib/types/core'
import { SimplePool } from 'nostr-tools';
import { defaultRelays } from '../../nostr';
interface PollResponseFormProps {
    pollEvent: Event
    onSubmit: (response: any) => void;
}

const PollResponseForm: React.FC<PollResponseFormProps> = ({ pollEvent, onSubmit }) => {
    const [response, setResponse] = useState<string>("");

    const handleResponseChange = (response: string) => {
        setResponse(response);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        if(!window.nostr) { alert("Nostr Signer Extension Is Required."); return; }
        e.preventDefault();
        const responseEvent = {
            kind: 1070,
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

    let label = pollEvent.tags.find((t) => t[0] === "label")?.[1];
    let options = pollEvent.tags.filter((t) => t[0] === "option")

    return (
        <div className="poll-response-form">
            <Typography variant="h5" gutterBottom>Respond to Poll</Typography>
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
                        </CardContent>
                    </Card>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">Submit Response</Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
};

export default PollResponseForm;
