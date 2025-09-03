// hooks/useGetProducts.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Product } from '../types';

const getProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`${API_URL}/products`);
  return data;
};

export const useGetProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });
};