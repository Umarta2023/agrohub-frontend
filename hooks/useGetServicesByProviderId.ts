// hooks/useGetServicesByProviderId.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Service } from '../types';

const getServicesByProviderId = async (providerId: number): Promise<Service[]> => {
  // ПРИМЕЧАНИЕ: Убедитесь, что ваш бэкенд поддерживает фильтрацию услуг по providerId
  const { data } = await axios.get(`${API_URL}/services?providerId=${providerId}`);
  return data;
};

export const useGetServicesByProviderId = (providerId: number | undefined) => {
  return useQuery({
    queryKey: ['servicesByProvider', providerId],
    queryFn: () => getServicesByProviderId(providerId!),
    enabled: !!providerId,
  });
};