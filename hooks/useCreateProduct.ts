// hooks/useCreateProduct.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Product } from '../types';

// Тип данных для создания товара. Обратите внимание, что shopId должен быть числом
// hooks/useCreateProduct.ts
type CreateProductData = Omit<Product, 'id'>;

const createProduct = async (productData: CreateProductData): Promise<Product> => {
  const { data } = await axios.post(`${API_URL}/products`, productData);
  return data;
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // После создания товара, обновляем списки товаров и товаров конкретного магазина
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['myProducts'] }); // Мы создадим этот ключ позже
    },
  });
};