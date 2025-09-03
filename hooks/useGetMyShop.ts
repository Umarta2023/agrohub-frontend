// hooks/useGetMyShop.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';

// Предполагаем, что у вас есть тип Shop в types.ts
// Если нет, раскомментируйте и используйте этот:
/*
export interface Shop {
  id: number;
  name: string;
  description: string;
  logoUrl: string; // Убедитесь, что это поле есть на бэкенде
}
*/
import { Shop } from '../types';

// Функция для получения одного магазина.
// Пока мы захардкодим ID магазина = 1, так как у пользователя пока может быть только один магазин.
// Позже это можно будет привязать к ID пользователя.
const getMyShop = async (): Promise<Shop> => {
  const response = await axios.get(`${API_URL}/shops/1`); // ЗАПРАШИВАЕМ МАГАЗИН С ID=1
  return response.data;
};

export const useGetMyShop = () => {
  return useQuery({
    queryKey: ['myShop'], // Уникальный ключ
    queryFn: getMyShop,
  });
};