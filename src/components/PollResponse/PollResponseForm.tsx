// PollResponseForm.tsx
import React, { useState } from 'react';
import { Button, Card, CardContent, Grid, TextField, Typography, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup } from '@mui/material';

interface PollResponseFormProps {
    pollData: {
        pollId: string; // Replace with actual poll ID logic
        fields: {
            fieldId: string;
            label: string;
            options: string[];
            settings: string;
        }[];
    };
    onSubmit: (response: any) => void;
}

const PollResponseForm: React.FC<PollResponseFormProps> = ({ pollData, onSubmit }) => {
    const [responses, setResponses] = useState<any>({});

    const handleResponseChange = (fieldId: string, response: string) => {
        setResponses({
            ...responses,
            [fieldId]: response
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const eventData = {
            kind: 1069,
            content: "", // Replace with actual content if needed
            tags: [
                ["e", pollData.pollId],
                ...Object.entries(responses).map(([fieldId, response]) => (["response", fieldId, response, ""])) // Assuming metadata is empty for now
            ],
            pubkey: "Author of Response" // Replace with actual pubkey logic
        };
        onSubmit(eventData);
        setResponses({});
    };

    return (
        <div className="poll-response-form">
            <Typography variant="h5" gutterBottom>Respond to Poll</Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {pollData.fields.map(field => (
                        <Grid item xs={12} key={field.fieldId}>
                            <Card variant="outlined">
                                <CardContent>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">{field.label}</FormLabel>
                                        <RadioGroup
                                            aria-label={field.label}
                                            name={field.fieldId}
                                            value={responses[field.fieldId] || ''}
                                            onChange={(e) => handleResponseChange(field.fieldId, e.target.value)}
                                        >
                                            {field.options.map(option => (
                                                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">Submit Response</Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
};

export default PollResponseForm;
