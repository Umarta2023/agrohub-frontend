// hooks/useGetPurchases.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Purchase } from '../types';

const getPurchases = async (): Promise<Purchase[]> => {
  // ПРИМЕЧАНИЕ: На бэкенде пока нет эндпоинта.
  // const { data } = await axios.get(`${API_URL}/purchases`);
  // return data;
  return Promise.resolve([]); // Временная заглушка
};

export const useGetPurchases = () => {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: getPurchases,
  });
};