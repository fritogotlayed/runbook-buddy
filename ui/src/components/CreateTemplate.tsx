import { Button, Paper, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";

export type CreateCallback = (templateId: string, data: string) => void;

export interface ListTemplateProps {
  onCreateButtonClick?: CreateCallback,
}

export default function CreateTemplate(props: ListTemplateProps) {
  const [templateId, setTemplateId] = useState<string>();
  const [id, setId] = useState<string>();
  const [data, setData] = useState<string>();

  const updateName = (name: string) => {
    const newName = name.replace(/ /g, '_');
    setTemplateId(newName);
    setId(name);
  };

  const create = () => {
    if (templateId && data && props.onCreateButtonClick) {
      props.onCreateButtonClick(templateId, data);
    }
  };

  return(
    <Paper sx={{ margin: "1em" }}>
      <Box sx={{ padding: "1em" }}>
        <Typography variant="h4">
          New Template
        </Typography>
        <div>
          You can use a double-curly-brace to create replaceable elements. Ex: {'{{foo}}'} 
        </div>
        <div>
          <TextField
            label="Name"
            value={id}
            sx={{width: '100%'}}
            onChange={event => updateName(event.target.value)}
            variant="standard" />
        </div>
        <div>
          <TextField
            label="Body"
            value={data}
            multiline={true}
            rows={Math.max(5, (data?.split(/\r\n|\r|\n/).length || 0))}
            sx={{width: '100%'}}
            onChange={event => setData(event.target.value)}
            variant="standard"></TextField>
        </div>
        <div>
          <Button variant="contained" onClick={create} sx={{
            marginTop: '1em',
          }}>Create</Button>
        </div>
      </Box>
    </Paper>
  );
}