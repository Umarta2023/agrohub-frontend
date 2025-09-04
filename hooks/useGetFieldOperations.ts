// hooks/useGetFieldOperations.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { FieldOperation } from '../types';

const getFieldOperations = async (fieldId: number): Promise<FieldOperation[]> => {
  // Предполагаем, что бэкенд поддерживает фильтрацию по fieldId
  const { data } = await axios.get(`${API_URL}/field-operations?fieldId=${fieldId}`);
  return data;
};

export const useGetFieldOperations = (fieldId: number | undefined) => {
  return useQuery({
    queryKey: ['fieldOperations', fieldId],
    queryFn: () => getFieldOperations(fieldId!),
    enabled: !!fieldId,
  });
};