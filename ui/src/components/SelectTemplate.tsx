import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { searchTemplates } from '../repos/templates';

export default function ListTemplates() {
  const [templates, setTemplates] = useState<Array<string>>();

  useEffect(() => {
    const loadData = async () => {
      const data = await searchTemplates('');
      setTemplates(data);
    }

    if (!templates) {
      loadData();
    }
  }, [templates]);

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
                  to={`/instances/new/${item}`}
                  key={item}
                >
                  Select
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Outlet />
    </main>
  );
}