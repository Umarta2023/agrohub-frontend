// hooks/useGetServiceProviders.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { ServiceProvider } from '../types';

const getServiceProviders = async (): Promise<ServiceProvider[]> => {
  const { data } = await axios.get(`${API_URL}/service-providers`);
  return data;
};

export const useGetServiceProviders = () => {
  return useQuery({
    queryKey: ['serviceProviders'],
    queryFn: getServiceProviders,
  });
};