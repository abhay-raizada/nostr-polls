import React from 'react';
import { Card, CardContent, TextField, Button } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { Option } from "../../interfaces"
 
interface OptionsCardProps {
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onEditOptions: (newOptions: Option[]) => void;
  options: Option[]
}

const OptionsCard: React.FC<OptionsCardProps> = ({
  onAddOption,
  onRemoveOption,
  onEditOptions,
  options,
}) => {
  const handleEditOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index][1] = value;
    onEditOptions(newOptions);
  };

  return (
    <Card variant="elevation">
      <CardContent>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddOption}
          sx={{ mt: 1, mb: 1 }}
        >
          Add Option
        </Button>
        {options.map((option, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label={`Option ${index + 1}`}
              fullWidth
              value={option[1]}
              onChange={(e) => handleEditOption(index, e.target.value)}
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
      </CardContent>
    </Card>
  );
};

export default OptionsCard;
