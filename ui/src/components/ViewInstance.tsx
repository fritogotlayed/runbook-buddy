import { Button, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { getInstanceById, IInstanceItem, updateInstance } from "../repos/templates";

interface IUIInstanceItem extends IInstanceItem { 
  originalState: boolean,
}

export default function ViewInstance() {
  const params = useParams();
  const { instanceId } = params;

  const [id, setId] = useState<string>();
  const [data, setData] = useState<Array<IUIInstanceItem>>();
  const [isDirty, setIsDirty] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      if (instanceId) {
        const result = await getInstanceById(instanceId);
        const workingData = result.map((e) => ({ ...e, originalState: e.completed }));
        setIsDirty(false);
        setData(workingData);
      }
    };

    if (id !== instanceId) {
      setId(instanceId);
      loadData();
    }

  }, [data, id, instanceId]);

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
      await updateInstance(instanceId, data);
      await setId(undefined);
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
    <main>
      <h2>Template: {instanceId?.replace(/_/g, ' ')}</h2>
      {items}
      <div>
        <Button variant="contained" onClick={save} disabled={!isDirty}>Save</Button>
      </div>
    </main>
  );
}