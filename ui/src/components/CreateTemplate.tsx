import { useEffect, useState } from "react";
import { createTemplate } from "../repos/templates";

export default function CreateTemplate() {
  const [templateId, setTemplateId] = useState<string>();
  const [id, setId] = useState<string>();
  const [data, setData] = useState<string>();

  useEffect(() => {
    // const loadData = async () => {
    //   if (templateId) {
    //     const result = await getTemplateById(templateId);
    //     setData(result);
    //   }
    // };

    // if (id !== templateId) {
    //   setId(templateId);
    //   loadData();
    // }

  }, [data, id, templateId]);

  const updateName = (name: string) => {
    const newName = name.replace(/ /g, '_');
    setTemplateId(newName);
    setId(name);
  };

  const create = () => {
    createTemplate(templateId as string, data as string);
  };

  return(
    <main>
      <h2>Template: {templateId?.replace(/_/g, ' ')}</h2>
      <div>
        Name:
        <input
          type="text"
          value={id}
          onChange={event => updateName(event.target.value)}></input>
      </div>
      <div>
        Body:
        <textarea
          value={data}
          onChange={event => setData(event.target.value)}></textarea>
      </div>
      <div>
        <button onClick={create}>Create</button>
      </div>
    </main>
  );
}