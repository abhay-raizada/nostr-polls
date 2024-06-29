import React, { useState } from 'react';
import { Button, Card, TextField, Typography } from '@mui/material';
import OptionsCard from './OptionsCard';
import { Option } from "../../interfaces"
import { SimplePool } from 'nostr-tools';
import { UnsignedEvent } from 'nostr-tools/lib/types/core'
import { defaultRelays } from '../../nostr';
import { Navigate, useNavigate } from 'react-router-dom';

const PollTemplateForm = () => {
  const [pollContent, setPollContent] = useState<string>('');
  const [options, setOptions] = useState<Option[]>([]);
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
    if(!window.nostr) {
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
    console.log("Event that will be sent is", pollEvent)
    const signedPollEvent = await window.nostr.signEvent(pollEvent);
    const pool = new SimplePool();
    const messages = await Promise.allSettled(pool.publish(defaultRelays, signedPollEvent));
    pool.close(defaultRelays)

    console.log("Poll event published, relay response:", messages);
    navigate("/");
  };

  return (
    <div className="poll-template-form">
      <Typography variant="h5" gutterBottom>Create A Poll</Typography>
      <form onSubmit={handleSubmit}>
        <Card>
              <TextField
                label="What is the poll about?"
                fullWidth
                value={pollContent}
                onChange={(e) => setPollContent(e.target.value)}
                required
              />
              <OptionsCard
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onEditOptions={onEditOptions}
                options={options}
              />
              <Button type="submit" variant="contained" color="primary">Submit</Button>
        </Card>
      </form>
    </div>
  );
};

export default PollTemplateForm;
