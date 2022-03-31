import { Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { getInstanceById, IInstanceItem, updateInstance } from "../repos/instances";

export type SaveCallback = (instanceId: string, data: Array<IInstanceItem>) => void;

interface IUIInstanceItem extends IInstanceItem { 
  originalState: boolean,
}

interface IViewInstanceProps {
  instanceId: string,
  data: Array<IInstanceItem>,
  onCloseClicked: Function,
  onSaveClicked: SaveCallback,
};

export default function ViewInstance(props: IViewInstanceProps) {
  const { instanceId, data: inData, onCloseClicked, onSaveClicked } = props;

  const [data, setData] = useState<Array<IUIInstanceItem>>(inData.map((e) => ({ ...e, originalState: e.completed })));
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
      //await updateInstance(instanceId, data);
    }
  };

  let items;
  // if (data) {
  //   items = data.map((item, i) => (
  //     <span key={i}>
  //       <input
  //         type="checkbox"
  //         name={item.data}
  //         value={item.data}
  //         id={item.data}
  //         checked={item.completed}
  //         onChange={() => toggleItemCompleted(item.data)} />
  //       <label htmlFor={item.data}>{item.data}</label>
  //       <br />
  //     </span>
  //   ));
  // }

  if (data) {
    const subData = data.map((item, i) => (
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
      <Box sx={{ padding: '1em' }}>
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
        {items}
        <div>
          <Button variant="contained" onClick={save} disabled={!isDirty}>Save</Button>
        </div>
      </Box>
    </Paper>
  );
}