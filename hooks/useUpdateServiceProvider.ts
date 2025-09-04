// hooks/useUpdateServiceProvider.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { ServiceProvider, ServiceProviderUpdatePayload } from '../types';

const updateServiceProvider = async ({ providerId, providerData }: { providerId: number; providerData: ServiceProviderUpdatePayload }): Promise<ServiceProvider> => {
  const { data } = await axios.patch(`${API_URL}/service-providers/${providerId}`, providerData);
  return data;
};

export const useUpdateServiceProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateServiceProvider,
    onSuccess: (data) => {
      // Обновляем кеш конкретного поставщика и общий список
      queryClient.invalidateQueries({ queryKey: ['serviceProvider', data.id] });
      queryClient.invalidateQueries({ queryKey: ['serviceProviders'] });
    },
  });
};