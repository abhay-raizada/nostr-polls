import React, { useState } from 'react';
import { Button, Grid, TextField, Typography } from '@mui/material';
import FieldCard from './FieldCard'; // Adjust the import path accordingly

interface PollTemplateFormProps {
  onSubmit: (eventData: any) => void;
}

const PollTemplateForm: React.FC<PollTemplateFormProps> = ({ onSubmit }) => {
  const [pollName, setPollName] = useState<string>('');
  const [fields, setFields] = useState<any[]>([]);
  const [currentField, setCurrentField] = useState<any>({
    fieldId: generateFieldId(),
    label: '',
    options: [],
    settings: ''
  });

  function generateFieldId() {
    // Generate a random field ID (can be improved for uniqueness if needed)
    return Math.random().toString(36).substr(2, 9);
  }

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentField({
      ...currentField,
      [e.target.name]: e.target.value
    });
  };

  const addOption = () => {
    setCurrentField({
      ...currentField,
      options: [...currentField.options, '']
    });
  };

  const removeOption = (index: number) => {
    const updatedOptions = [...currentField.options];
    updatedOptions.splice(index, 1);
    setCurrentField({
      ...currentField,
      options: updatedOptions
    });
  };

  const addField = () => {
    setFields([...fields, currentField]);
    setCurrentField({
      fieldId: generateFieldId(),
      label: '',
      options: [],
      settings: ''
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const eventData = {
      kind: 1068,
      content: pollName,
      tags: [
        ["name", pollName],
        ...fields.map(field => (["field", field.fieldId, "option", field.label, JSON.stringify(field.options), field.settings]))
      ],
      pubkey: "<Author of the poll>" // Replace with actual pubkey logic
    };
    onSubmit(eventData);
    setPollName('');
    setFields([]);
  };

  return (
    <div className="poll-template-form">
      <Typography variant="h5" gutterBottom>Create Poll Template</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item>
            <TextField
              label="Poll Name"
              fullWidth
              value={pollName}
              onChange={(e) => setPollName(e.target.value)}
              required
            />
          </Grid>
          <Grid item>
            <FieldCard
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onFieldChange={handleFieldChange}
              fieldData={currentField}
            />
          </Grid>
          <Grid item>
            <Button type="button" onClick={addField} variant="contained">Add Field</Button>
          </Grid>
          <Grid item>
            <Button type="submit" variant="contained" color="primary">Create Poll Template</Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default PollTemplateForm;
