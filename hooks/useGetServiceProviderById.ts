// hooks/useGetServiceProviderById.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { ServiceProvider } from '../types';

const getServiceProviderById = async (providerId: number): Promise<ServiceProvider> => {
  const { data } = await axios.get(`${API_URL}/service-providers/${providerId}`);
  return data;
};

export const useGetServiceProviderById = (providerId: number | undefined) => {
  return useQuery({
    queryKey: ['serviceProvider', providerId],
    queryFn: () => getServiceProviderById(providerId!),
    enabled: !!providerId,
  });
};