// hooks/useGetCropHistory.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { CropHistory } from '../types';

const getCropHistory = async (fieldId: number): Promise<CropHistory[]> => {
  // Предполагаем, что бэкенд поддерживает фильтрацию по fieldId
  const { data } = await axios.get(`${API_URL}/crop-history?fieldId=${fieldId}`);
  return data;
};

export const useGetCropHistory = (fieldId: number | undefined) => {
  return useQuery({
    queryKey: ['cropHistory', fieldId],
    queryFn: () => getCropHistory(fieldId!),
    enabled: !!fieldId,
  });
};