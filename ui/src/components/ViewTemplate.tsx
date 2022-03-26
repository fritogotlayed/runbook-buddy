import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { getTemplateById } from "../repos/templates";

export default function ViewTemplate() {
  const params = useParams();
  const { templateId } = params;

  const [id, setId] = useState<string>();
  const [data, setData] = useState<string>();

  useEffect(() => {
    const loadData = async () => {
      if (templateId) {
        const result = await getTemplateById(templateId);
        setData(result);
      }
    };

    if (id !== templateId) {
      setId(templateId);
      loadData();
    }

  }, [data, id, templateId]);

  let items;
  if (data) {
    items = data.split('\n').map((line, i) => (<span key={i}>{line}<br /></span>));
  }
  return(
    <main>
      <h2>Template: {templateId?.replace(/_/g, ' ')}</h2>
      {items}
    </main>
  );
}