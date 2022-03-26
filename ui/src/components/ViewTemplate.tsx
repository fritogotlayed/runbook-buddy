import { AppBar, Box, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

interface IViewTemplateProps {
  templateId: string,
  data: string,
  onCloseClicked: Function,
};

export default function ViewTemplate(props: IViewTemplateProps) {
  const { templateId, data, onCloseClicked } = props;

  let items;
  if (data) {
    items = data.split('\n').map((line, i) => (<span key={i}>{line}<br /></span>));
  }
  return(
    <Paper style={{ margin: "1em" }}>
      <Box sx={{ padding: "1em"}}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h4" component="div">
            {templateId.replace(/_/g, ' ')}
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
        {items}
      </Box>
    </Paper>
  );
}