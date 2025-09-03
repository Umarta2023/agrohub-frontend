// hooks/useGetShopById.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Shop } from '../types';

const getShopById = async (shopId: number): Promise<Shop> => {
  const { data } = await axios.get(`${API_URL}/shops/${shopId}`);
  return data;
};

export const useGetShopById = (shopId: number | undefined) => {
  return useQuery({
    // Ключ запроса теперь включает ID, чтобы кешировать каждый магазин отдельно
    queryKey: ['shop', shopId],
    queryFn: () => getShopById(shopId!),
    // Запрос будет выполнен, только если shopId - это валидное число
    enabled: !!shopId,
  });
};