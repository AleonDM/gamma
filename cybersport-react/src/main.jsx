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
    // Убираем слеш в начале пути, чтобы избежать дублирования
    const apiPath = config.url.startsWith('/api') ? config.url.substring(1) : config.url;
    
    // Проверяем, заканчивается ли API_BASE_URL слешем
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    
    // Формируем URL без двойного слеша
    config.url = `${baseUrl}/${apiPath}`;
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