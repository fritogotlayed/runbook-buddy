import { Box, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { convertTemplateToHuman } from "utils/converters";
import { getDepthAndData } from "utils/converters/common";

interface IViewTemplateProps {
  templateId: string,
  data: string,
  onCloseClicked?: Function,
};

export default function ViewTemplate(props: IViewTemplateProps) {
  const { templateId, data, onCloseClicked } = props;

  let items;
  if (data) {
    const body = convertTemplateToHuman(data);
    items = body.split('\n').map((line, i) => {
      const { depth, data } = getDepthAndData(line);
      const marginLeft = `${depth * 1}em`;
      return <span key={i} style={{marginLeft: marginLeft}} >{data}<br /></span>
    });
  }
  return(
    <Paper style={{ margin: "1em" }}>
      <Box sx={{ padding: "1em"}}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h5" component="div">
            {templateId.replace(/_/g, ' ')}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => onCloseClicked && onCloseClicked()}
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