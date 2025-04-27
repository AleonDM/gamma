import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import './index.css';
import { API_BASE_URL } from './utils/env';

// Настройка базового URL для всех запросов axios
axios.defaults.baseURL = API_BASE_URL;

// Логируем API URL для отладки
console.log('API URL:', API_BASE_URL);

// Проверяем, если запрос начинается с /api, то используем полный URL
// Обязательно нужен перехватчик запросов для переадресации относительных путей на API сервер
axios.interceptors.request.use(config => {
  if (config.url.startsWith('/api')) {
    // Приводим URL к абсолютному виду
    config.url = `${API_BASE_URL}${config.url}`;
    console.log('Перенаправление запроса на:', config.url);
  }
  return config;
});

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