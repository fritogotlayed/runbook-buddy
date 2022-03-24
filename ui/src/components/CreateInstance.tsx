import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createInstance, getTemplateById } from "../repos/templates";

export default function CreateInstance() {
  const params = useParams();
  const { templateId } = params;

  const [id, setId] = useState<string>();
  const [data, setData] = useState<string>();
  const [instanceName, setInstanceName] = useState<string>();

  useEffect(() => {
    const loadData = async () => {
      if (!data && templateId) {
        const result = await getTemplateById(templateId);
        setData(result);
      }
    };

    loadData();

  }, [data, templateId]);

  const create = () => {
    if (data) {
      const content = data.split('\n').map((item) => ({ completed: false, data: item }));
      createInstance(instanceName as string, content);
    }
  };

  const updateName = (name: string) => {
    const newName = name.replace(/ /g, '_')
    setInstanceName(newName);
    setId(name);
  };

  let items;
  if (data) {
    items = data.split('\n').map((line, i) => (<span key={i}>{line}<br /></span>));
  }

  return(
    <main>
      <h2>Template: {templateId?.replace(/_/g, ' ')}</h2>
      <h2>Name: {instanceName?.replace(/_/g, ' ')}</h2>
      <div>
        Name:
        <input
          type="text"
          value={id}
          onChange={event => updateName(event.target.value)}></input>
      </div>
      <div>
        Body:
        <div>
          {items}
        </div>
      </div>
      <div>
        <button onClick={create}>Create</button>
      </div>
    </main>
  );
}