import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Shop } from '../types';

type CreateShopData = Omit<Shop, 'id'>;

const createShop = async (shopData: CreateShopData): Promise<Shop> => {
  const response = await axios.post(`${API_URL}/shops`, shopData);
  return response.data;
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
};