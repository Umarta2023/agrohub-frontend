// hooks/useGetFields.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Field } from '../types';

const getFields = async (): Promise<Field[]> => {
  const { data } = await axios.get(`${API_URL}/fields`);
  return data;
};

export const useGetFields = () => {
  return useQuery({
    queryKey: ['fields'],
    queryFn: getFields,
  });
};