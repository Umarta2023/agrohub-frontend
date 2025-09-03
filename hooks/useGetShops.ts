// hooks/useGetShops.ts

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx'; // Добавляем расширение .tsx

// Описываем, как выглядит один магазин, который приходит с сервера.
// Если у вас уже есть такой тип в файле types.ts, эту часть можно будет удалить
// и импортировать тип оттуда.
export interface Shop {
  id: number;
  name: string;
  description: string;
  // добавьте сюда другие поля, если они есть
}

// Эта функция непосредственно выполняет запрос к API
const getShops = async (): Promise<Shop[]> => {
  const response = await axios.get(`${API_URL}/shops`);
  return response.data;
};

// Это сам хук, который мы будем использовать в компонентах.
// Он использует react-query для управления состоянием, кеширования и т.д.
export const useGetShops = () => {
  return useQuery({
    queryKey: ['shops'], // Уникальный ключ для этого запроса
    queryFn: getShops,   // Функция, которая будет вызвана для получения данных
  });
};