// hooks/useGetMyProducts.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Product } from '../types';

// shopId будет числом
const getMyProducts = async (shopId: number): Promise<Product[]> => {
  // Предполагаем, что API поддерживает фильтрацию по shopId
  const { data } = await axios.get(`${API_URL}/products?shopId=${shopId}`);
  return data;
};

export const useGetMyProducts = (shopId: number | undefined) => {
  return useQuery({
    queryKey: ['myProducts', shopId], // Ключ зависит от shopId
    queryFn: () => getMyProducts(shopId!),
    enabled: !!shopId, // Запрос будет выполнен только если shopId существует
  });
};