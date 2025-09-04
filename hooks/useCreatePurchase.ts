// hooks/useCreatePurchase.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Purchase, PurchasedItem } from '../types';

// Тип данных, который мы отправляем на сервер
type CreatePurchaseData = {
  items: PurchasedItem[];
  totalAmount: number;
}

const createPurchase = async (purchaseData: CreatePurchaseData): Promise<Purchase> => {
  const { data } = await axios.post(`${API_URL}/purchases`, purchaseData);
  return data;
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      // После успешной покупки, обновляем историю покупок
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
};