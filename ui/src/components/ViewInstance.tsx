import { Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

import { IInstanceItem } from "../repos/instances";
import SearchInput from "./SearchInput";
import { Save } from "@mui/icons-material";
import { UIInstanceItem } from "../types/UIInstanceItem";

export type SaveCallback = (data: Array<IInstanceItem>) => void;
export type ItemToggledCallback = (item: UIInstanceItem) => void;
export type SearchTermUpdatedCallback = (term: string | undefined) => void;

interface IViewInstanceProps {
  instanceTitle: string,
  data: Array<UIInstanceItem>,
  onCloseClicked: Function,
  onSaveClicked: SaveCallback,
  onItemUpdated: ItemToggledCallback,
  onSearchTermUpdated: SearchTermUpdatedCallback,
};

export default function ViewInstance(props: IViewInstanceProps) {
  const { instanceTitle, data, onCloseClicked, onSaveClicked, onItemUpdated, onSearchTermUpdated } = props;

  const toggleItemCompleted = (key: string) => {
    data?.map((item) => {
      if (key === item.data) {
        return { ...item, completed: !item.completed}
      }
      return item;
    });

    if (onItemUpdated) {
      const item = data.find((e) => e.data === key);
      if (item) {
        onItemUpdated({ ...item, completed: !item.completed})
      }
    }
  };

  const save = async () => {
    if (data) {
      onSaveClicked(data.map(e => ({data: e.data, completed: e.completed})));
    }
  };

  const isDirty = data.length === 0 ? false : data.map((e) => e.completed !== e.originalState).reduce((prev, curr) => prev || curr);

  let items;

  if (data) {
    const subData = data.filter((e) => e.visible).map((item, i) => (
      <FormControlLabel
        key={i}
        checked={item.completed}
        onChange={() => toggleItemCompleted(item.data)}
        control={<Checkbox />}
        label={item.data}
        sx={{
          color: item.completed !== item.originalState ? '#FF0000' : '',
          fontWeight: item.completed !== item.originalState ? 'bolder' : 'normal',
        }}
      />
    ));
    items = (
      <FormGroup>{subData}</FormGroup>
    );
  }


  return(
    <Paper style={{ margin: '1em' }}>
      <Box sx={{ padding: '1em' }} >
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant='h5' component="div">
            {instanceTitle}
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
          <SearchInput onSearchTermUpdated={onSearchTermUpdated} />
        </Box>
        {items}
        <Box>
          <Button variant="contained" onClick={save} disabled={!isDirty}>
            <Save />
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}