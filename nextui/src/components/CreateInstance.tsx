import { Save } from "@mui/icons-material";
import { Button, Paper, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";

export type CreateCallback = (name: string) => void;
export type FieldUpdatedCallback = (key: string, value: string) => void;
export interface ICreateInstanceProps {
  keys?: string[],
  onFieldUpdated?: FieldUpdatedCallback,
  onCreateButtonClick?: CreateCallback,
}

export default function CreateInstance(props: ICreateInstanceProps) {
  const { keys, onFieldUpdated, onCreateButtonClick } = props;
  const [name, setName] = useState<string>();

  const updateField = (key: string, value: string) => {
    if (onFieldUpdated) {
      onFieldUpdated(key, value);
    }
  };

  const createClicked = () => {
    if (name && onCreateButtonClick) {
      onCreateButtonClick(name);
    }
  }

  let inputFields;
  if (keys && keys.length > 0) {
    inputFields = keys.map((k) => (
      <div key={k}>
        <TextField
          label={k}
          sx={{width: '100%'}}
          onChange={event => updateField(k, event.target.value)}
          variant="standard" />
      </div>
    ));
  } else {
    inputFields = (
      <div>
        No fields to replace!
      </div>
    )
  }

  return(
    <Paper sx={{ margin: "1em" }}>
      <Box sx={{ padding: "1em" }}>
        <Typography variant="h5">
          New Template
        </Typography>
        <Box>
          <TextField
            label="Name"
            sx={{width: '100%'}}
            onChange={event => setName(event.target.value)}
            variant="standard" />
        </Box>
        {inputFields}
        <Box>
          <Button variant="contained" onClick={createClicked} sx={{
            marginTop: '1em',
          }}><Save /></Button>
        </Box>
      </Box>
    </Paper>
  );
}