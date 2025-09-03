// hooks/useUpdateShop.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Shop } from '../types';

type UpdateShopData = Partial<Omit<Shop, 'id'>>;

const updateShop = async ({ shopId, shopData }: { shopId: number; shopData: UpdateShopData }): Promise<Shop> => {
  const response = await axios.patch(`${API_URL}/shops/${shopId}`, shopData);
  return response.data;
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateShop,
    onSuccess: () => {
      // Обновляем данные в кеше, чтобы на странице отобразилась актуальная информация
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
};