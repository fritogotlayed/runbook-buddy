import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { getInstanceById, IInstanceItem, updateInstance } from "../repos/templates";

export default function ViewInstance() {
  const params = useParams();
  const { instanceId } = params;

  const [id, setId] = useState<string>();
  const [data, setData] = useState<Array<IInstanceItem>>();

  useEffect(() => {
    const loadData = async () => {
      if (instanceId) {
        const result = await getInstanceById(instanceId);
        setData(result);
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
  };

  const save = async () => {
    if (instanceId && data) {
      await updateInstance(instanceId, data);
    }
  };

  let items;
  if (data) {
    items = data.map((item, i) => (
      <span key={i}>
        <input
          type="checkbox"
          name={item.data}
          value={item.data}
          id={item.data}
          checked={item.completed}
          onChange={() => toggleItemCompleted(item.data)} />
        <label htmlFor={item.data}>{item.data}</label>
        <br />
      </span>
    ));
  }
  return(
    <main>
      <h2>Template: {instanceId?.replace(/_/g, ' ')}</h2>
      {items}
      <div>
        <button onClick={save}>Save</button>
      </div>
    </main>
  );
}