import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';

// Создаем роутер с флагом для будущей совместимости
const router = createBrowserRouter(
  [{ path: '*', element: <App /> }],
  { future: { v7_startTransition: true } }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);