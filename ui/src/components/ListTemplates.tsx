import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { removeTemplateById, searchTemplates } from '../repos/templates';

export default function ListTemplates() {
  const [templates, setTemplates] = useState<Array<string>>();

  const removeTemplate = async (key: string) => {
    await removeTemplateById(key);
    setTemplates(undefined);
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await searchTemplates('');
      setTemplates(data);
    }

    if (!templates) {
      loadData();
    }
  }, [templates]);

  // TODO: Update to be a list with options for view, edit and/or delete
  return(
    <main style={{ padding: "1rem 0" }}>
      <h2>Templates</h2>
      <div>
        <Link to="/templates/new" >Create New Template</Link>
      </div>
      <table style={{ margin: "1rem 0"}} >
        <tbody>
          {templates?.map((item) => (
            <tr key={item}>
              <td>
                {item.replace(/_/g, ' ')}
              </td>
              <td>
                <Link
                  to={`/templates/${item}`}
                  key={item}
                >
                  View
                </Link>
              </td>
              <td>
                <Link
                  to={`/templates/${item}`}
                  key={item}
                >
                  Edit
                </Link>
              </td>
              <td>
                <button onClick={() => removeTemplate(item)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Outlet />
    </main>
  );
}