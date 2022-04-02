import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import TemplatesPage from './pages/TemplatesPage';
import InstancesPage from './pages/InstancesPage';
import CreateInstanceWizard from './pages/CreateInstanceWizard';

// https://github.com/remix-run/react-router/blob/main/docs/getting-started/tutorial.md
ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="instances" element={<InstancesPage />} />
        <Route path="createInstance" element={<CreateInstanceWizard />} />
        <Route path="*" element={
          <main>There's nothing here!</main>
        } />
      </Route>
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
