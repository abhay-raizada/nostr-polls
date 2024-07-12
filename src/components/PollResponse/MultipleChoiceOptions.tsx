import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

interface MultipleChoiceOptionsProps {
  options: Array<[string, string, string]>; 
  response: string[];
  handleResponseChange: (value: string) => void;
}


export const MultipleChoiceOptions: React.FC<MultipleChoiceOptionsProps> = ({ options, response, handleResponseChange }) => (
  <FormGroup>
    {options.map((option) => (
      <FormControlLabel
        key={option[1]}
        control={<Checkbox />}
        label={option[2]}
        value={option[1]}
        checked={response.includes(option[1])}
        onChange={() => handleResponseChange(option[1])}
      />
    ))}
  </FormGroup>
);