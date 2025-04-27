import axios from 'axios';
import { API_BASE_URL } from './env';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 секунд таймаут для запросов
  headers: {
    'Content-Type': 'application/json',
  }
});

// Перехватчик запросов - добавляет заголовки авторизации при необходимости
api.interceptors.request.use(
  config => {
    // Можно добавить токен авторизации если он есть
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов - обработка ошибок
api.interceptors.response.use(
  response => response,
  error => {
    // Логируем ошибки в консоль для отладки
    console.error('API Error:', error);
    
    // Проверяем, является ли ошибка ошибкой сети
    if (!error.response) {
      console.error('Ошибка сети или сервер недоступен');
    }

    // Возвращаем ошибку для дальнейшей обработки в компонентах
    return Promise.reject(error);
  }
);

export default api; 