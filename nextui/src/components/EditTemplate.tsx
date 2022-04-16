import { Button, IconButton, Paper, TextField, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";
import { Save } from "@mui/icons-material";

export type UpdateCallback = (templateId: string, data: string) => void;

export interface EditTemplateProps {
  templateId: string,
  body: string,
  onUpdateButtonClick: UpdateCallback,
  onCloseClicked: Function,
}

export default function EditTemplate(props: EditTemplateProps) {
  const { templateId, body, onUpdateButtonClick, onCloseClicked } = props;

  const [data, setData] = useState<string>(body);

  const update = () => {
    if (templateId && data && onUpdateButtonClick) {
      onUpdateButtonClick(templateId, data);
    }
  };

  return(
    <Paper sx={{ margin: "1em" }}>
      <Box sx={{ padding: "1em" }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h5" component="div">
            Update Template
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => onCloseClicked()}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Box>
          <TextField
            label="Name"
            value={templateId.replace(/_/g, ' ')}
            sx={{width: '100%'}}
            disabled={true}
            variant="standard" />
        </Box>
        <Box>
          <TextField
            label="Body"
            value={data}
            multiline={true}
            rows={Math.max(5, (data?.split(/\r\n|\r|\n/).length || 0))}
            sx={{width: '100%'}}
            onChange={event => setData(event.target.value)}
            variant="standard"></TextField>
        </Box>
        <Box>
          <Button variant="contained" onClick={update} sx={{
            marginTop: '1em',
          }}><Save /></Button>
        </Box>
      </Box>
    </Paper>
  );
}