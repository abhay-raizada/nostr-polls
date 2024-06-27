// FieldCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, TextField, Button } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

interface FieldCardProps {
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fieldData: {
    label: string;
    options: string[];
    settings: string;
  };
}

const FieldCard: React.FC<FieldCardProps> = ({
  onAddOption,
  onRemoveOption,
  onFieldChange,
  fieldData,
}) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <TextField
          label="Label"
          fullWidth
          name="label"
          value={fieldData.label}
          onChange={onFieldChange}
          required
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddOption}
          sx={{ mt: 1, mb: 1 }}
        >
          Add Option
        </Button>
        {fieldData.options.map((option, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label={`Option ${index + 1}`}
              fullWidth
              value={option}
              onChange={(e) => onRemoveOption(index)}
              sx={{ mr: 1 }}
            />
            <Button
              variant="outlined"
              color="error"
              onClick={() => onRemoveOption(index)}
              startIcon={<Delete />}
            >
              Remove
            </Button>
          </div>
        ))}
        <TextField
          label="Settings (JSON string)"
          fullWidth
          name="settings"
          value={fieldData.settings}
          onChange={onFieldChange}
          sx={{ mt: 1 }}
        />
      </CardContent>
    </Card>
  );
};

export default FieldCard;
