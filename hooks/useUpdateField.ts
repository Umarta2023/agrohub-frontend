// hooks/useUpdateField.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Field, FieldUpdatePayload } from '../types';

const updateField = async ({ fieldId, fieldData }: { fieldId: number; fieldData: FieldUpdatePayload }): Promise<Field> => {
  const { data } = await axios.patch(`${API_URL}/fields/${fieldId}`, fieldData);
  return data;
};

export const useUpdateField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateField,
    onSuccess: (data) => {
      // Обновляем кеш этого конкретного поля и общий список полей
      queryClient.invalidateQueries({ queryKey: ['field', data.id] });
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
  });
};