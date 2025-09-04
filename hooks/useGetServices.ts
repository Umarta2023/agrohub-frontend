// hooks/useGetServices.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Service } from '../types';

const getServices = async (): Promise<Service[]> => {
  const { data } = await axios.get(`${API_URL}/services`);
  return data;
};

export const useGetServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });
};