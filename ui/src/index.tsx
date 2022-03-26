import React from 'react'
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import './index.css';
import App from './App';
import ListInstances from './components/ListInstances';
import SelectTemplate from './components/SelectTemplate';
import CreateInstance from './components/CreateInstance';
import ViewInstance from './components/ViewInstance';
import reportWebVitals from './reportWebVitals';
import TemplatesPage from './pages/TemplatesPage';

// https://github.com/remix-run/react-router/blob/main/docs/getting-started/tutorial.md
ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="templates" element={<TemplatesPage />} />
        {/* <Route path="templates" element={<ListTemplates />}>
          <Route path="new" element={<CreateTemplate />} />
          <Route path=":templateId" element={<ViewTemplate />} />
        </Route> */}
        <Route path="instances" element={<ListInstances />}>
          <Route path="new" element={<SelectTemplate />}>
            {/* <Route path=":templateId" element={<CreateInstance />} /> */}
          </Route>
          <Route path="new/:templateId" element={<CreateInstance />} />
          <Route path=":instanceId" element={<ViewInstance />} />
        </Route>
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
