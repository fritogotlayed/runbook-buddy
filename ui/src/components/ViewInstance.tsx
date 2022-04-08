import { Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

import { useState } from "react";
import { IInstanceItem } from "../repos/instances";
import SearchInput from "./SearchInput";
import { Save } from "@mui/icons-material";

export type SaveCallback = (instanceId: string, data: Array<IInstanceItem>) => void;

interface IUIInstanceItem extends IInstanceItem { 
  originalState: boolean,
  visible: boolean,
}

interface IViewInstanceProps {
  instanceId: string,
  data: Array<IInstanceItem>,
  onCloseClicked: Function,
  onSaveClicked: SaveCallback,
};

export default function ViewInstance(props: IViewInstanceProps) {
  const { instanceId, data: inData, onCloseClicked, onSaveClicked } = props;

  const [data, setData] = useState<Array<IUIInstanceItem>>(inData.map((e) => ({ ...e, originalState: e.completed, visible: true })));
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const toggleItemCompleted = (key: string) => {
    const newData = data?.map((item) => {
      if (key === item.data) {
        return { ...item, completed: !item.completed}
      }
      return item;
    });
    setData(newData);
    setIsDirty(true);
  };

  const save = async () => {
    if (instanceId && data) {
      onSaveClicked(instanceId, data.map(e => ({data: e.data, completed: e.completed})));
    }
  };

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

  const searchTermUpdated = (term?: string) => {
    if (term) {
      const isVisible = (value: string) => {
        // NOTE: JS has weird behavior with re-using a RegExp object and the test method
        // where checks will be a false negative. We can work around this by re-creating
        // the RegExp object for every check.
        const exp = new RegExp(term, 'gi');
        return exp.test(value);
      }
      setData(
        data.map((i) => ({
          ...i,
          visible: isVisible(i.data)
        }))
      );
    } else {
      setData(
        data.map((i) => ({...i, visible: true}))
      );
    }
  };

  return(
    <Paper style={{ margin: '1em' }}>
      <Box sx={{ padding: '1em' }} >
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant='h5' component="div">
            {instanceId?.replace(/_/g, ' ')}
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
          <SearchInput onSearchTermUpdated={searchTermUpdated} />
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