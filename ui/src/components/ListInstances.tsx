import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { removeInstanceById, searchInstances } from "../repos/templates";

export default function ListInstances() {
  const [instances, setInstances] = useState<Array<string>>();

  const removeInstance = async (key: string) => {
    await removeInstanceById(key);
    setInstances(undefined);
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await searchInstances('');
      setInstances(data);
    }

    if (!instances) {
      loadData();
    }
  }, [instances]);

  return(
    <main style={{ padding: "1rem 0" }}>
      <h2>Instances</h2>
      <div>
        <Link to="/instances/new" >Create New Instance</Link>
      </div>
      <table style={{ margin: "1rem 0"}} >
        <tbody>
          {instances?.map((item) => (
            <tr key={item}>
              <td>
                {item.replace(/_/g, ' ')}
              </td>
              <td>
                <Link
                  to={`/instances/${item}`}
                  key={item}
                >
                  View
                </Link>
              </td>
              <td>
                <Link
                  to={`/instances/${item}`}
                  key={item}
                >
                  Edit
                </Link>
              </td>
              <td>
                <button onClick={() => removeInstance(item)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Outlet />
    </main>
  );
}