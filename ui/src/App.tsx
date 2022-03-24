import { Link, Outlet } from 'react-router-dom';

function App() {
  return (
    <div>
      <h1>Runbook Buddy</h1>
      <nav
      style={{
        borderBottom: "solid 1px",
        paddingBottom: "1rem",
      }}>
        {/* TODO: Make this a proper nav */}
        <Link to="/">Home</Link> |{" "}
        <Link to="/templates">Templates</Link> |{" "}
        <Link to="/instances">Instances</Link>
      </nav>
      <Outlet />
    </div>
  );
}

export default App;
