// hooks/useGetFieldById.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Field } from '../types';

const getFieldById = async (fieldId: number): Promise<Field> => {
  const { data } = await axios.get(`${API_URL}/fields/${fieldId}`);
  return data;
};

export const useGetFieldById = (fieldId: number | undefined) => {
  return useQuery({
    queryKey: ['field', fieldId],
    queryFn: () => getFieldById(fieldId!),
    enabled: !!fieldId,
  });
};