import { Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

import { useState } from "react";
import { IInstanceItem } from "../repos/instances";
import SearchInput from "./SearchInput";

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
      onSaveClicked(instanceId, data);
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
      const exp = new RegExp(term, 'ig');
      /*
        const expression = `{{${replaceKeys[i]}}}`;
        workingData = workingData.replace(new RegExp(expression, 'g'), replacementMapping.get(replaceKeys[i]) || expression);
      */
      setData(
        data.map((i) => ({
          ...i,
          visible: exp.test(i.data)
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
          <Typography sx={{ ml: 2, flex: 1 }} variant='h4' component="div">
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
        <div>
          <SearchInput onSearchTermUpdated={searchTermUpdated} />
        </div>
        {items}
        <div>
          <Button variant="contained" onClick={save} disabled={!isDirty}>Save</Button>
        </div>
      </Box>
    </Paper>
  );
}