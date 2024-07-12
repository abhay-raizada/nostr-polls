import React, { useState } from 'react';
import { Button, Card, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import OptionsCard from './OptionsCard';
import { Option } from "../../interfaces"
import { SimplePool } from 'nostr-tools';
import { defaultRelays } from '../../nostr';
import { useNavigate } from 'react-router-dom';

export type PollTypes = 'singlechoice' | 'multiplechoice' | 'rankedchoice' | undefined

const PollTemplateForm = () => {
  const [pollContent, setPollContent] = useState<string>('');
  const [options, setOptions] = useState<Option[]>([]);
  const [pollType, setPollType] = useState<PollTypes>("singlechoice");
  let navigate = useNavigate();

  function generateOptionId() {
    return Math.random().toString(36).substr(2, 9);
  }

  const addOption = () => {
    let newOptions = [...options, [generateOptionId(), '']]
    setOptions(newOptions as Option[])
  };

  const onEditOptions = (newOptions: Option[]) => {
    setOptions(newOptions);
  }

  const removeOption = (index: number) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!window.nostr) {
      alert("Could not find a nostr extension on your browser");
      return;
    }
    e.preventDefault();
    const pollEvent = {
      kind: 1068,
      content: "",
      tags: [
        ["label", pollContent],
        ...options.map((option: Option) => (["option", option[0], option[1]]))
      ],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: await window.nostr.getPublicKey(),
    };
    if(pollType) {
      pollEvent.tags.push(["polltype", pollType])
    }
    console.log("Event that will be sent is", pollEvent)
    const signedPollEvent = await window.nostr.signEvent(pollEvent);
    const pool = new SimplePool();
    const messages = await Promise.allSettled(pool.publish(defaultRelays, signedPollEvent));
    pool.close(defaultRelays)

    console.log("Poll event published, relay response:", messages);
    console.log("final poll event is", pollEvent)
    navigate("/");
  };

  const handleChange = (event: SelectChangeEvent) => {
    setPollType(event.target.value as PollTypes);
  };


  return (
    <div style={{ alignItems: "center", width: "100%", maxWidth: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: "100%", alignItems: "center" }}>
        <Typography variant="h5" gutterBottom>Create A Poll</Typography>
        <form onSubmit={handleSubmit} style={{ border: "none", boxShadow: "none" }} >
          <Card style={{ boxShadow: "none", width: "100%", maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "left" }} >
            <TextField
              label="Poll questions or content?"
              value={pollContent}
              onChange={(e) => setPollContent(e.target.value)}
              required
              multiline
              style={{ borderBottom: "none", margin: 10 }}
              size='medium'
            />
            <OptionsCard
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onEditOptions={onEditOptions}
              options={options}
            />
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={pollType}
              label="Age"
              onChange={handleChange}
              style={{maxWidth: "200px", margin: 10}}
            >
              <MenuItem value={"singlechoice"}>Single Choice Poll</MenuItem>
              <MenuItem value={"multiplechoice"}>Multiple Choice Poll</MenuItem>
              <MenuItem value={"rankedchoice"} disabled>Ranked Choice Poll</MenuItem>
            </Select>
            <Button type="submit" variant="contained" color="primary" style={{maxWidth: 100}}>Submit</Button>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default PollTemplateForm;
