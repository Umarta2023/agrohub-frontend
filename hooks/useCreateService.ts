// hooks/useCreateService.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Service } from '../types';

type CreateServiceData = Omit<Service, 'id'>;

const createService = async (serviceData: CreateServiceData): Promise<Service> => {
  const { data } = await axios.post(`${API_URL}/services`, serviceData);
  return data;
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: (data) => {
      // Обновляем список услуг этого поставщика и общий список
      queryClient.invalidateQueries({ queryKey: ['servicesByProvider', data.providerId] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};