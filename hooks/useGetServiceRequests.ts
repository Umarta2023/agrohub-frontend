// hooks/useGetServiceRequests.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { ServiceRequestData } from '../types';

const getServiceRequests = async (): Promise<ServiceRequestData[]> => {
  // ПРИМЕЧАНИЕ: На бэкенде пока нет эндпоинта.
  // const { data } = await axios.get(`${API_URL}/service-requests`);
  // return data;
  return Promise.resolve([]); // Временная заглушка
};

export const useGetServiceRequests = () => {
  return useQuery({
    queryKey: ['serviceRequests'],
    queryFn: getServiceRequests,
  });
};