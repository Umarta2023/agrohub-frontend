// hooks/useGetServiceById.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Service } from '../types';

const getServiceById = async (serviceId: number): Promise<Service> => {
  const { data } = await axios.get(`${API_URL}/services/${serviceId}`);
  return data;
};

export const useGetServiceById = (serviceId: number | undefined) => {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => getServiceById(serviceId!),
    enabled: !!serviceId,
  });
};