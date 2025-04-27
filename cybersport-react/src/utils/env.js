/**
 * Утилитарные функции для работы с переменными окружения
 */

/**
 * Код администратора для авторизации
 * @type {string}
 */
export const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || 'admin';

/**
 * Базовый URL API сервера
 * @type {string}
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Название приложения
 * @type {string}
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Cybersport Platform';

/**
 * Проверка, является ли переданный код кодом администратора
 * @param {string} code - Проверяемый код
 * @returns {boolean} - true если код совпадает с кодом администратора
 */
export const isAdminCode = (code) => {
  return code === ADMIN_CODE;
};

// Другие настройки для деплоя
export const IS_PRODUCTION = import.meta.env.MODE === 'production'; 