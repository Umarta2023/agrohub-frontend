// hooks/useCreateFieldOperation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { FieldOperation, FieldOperationPayload } from '../types';

const createFieldOperation = async (operationData: FieldOperationPayload): Promise<FieldOperation> => {
  const { data } = await axios.post(`${API_URL}/field-operations`, operationData);
  return data;
};

export const useCreateFieldOperation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFieldOperation,
    onSuccess: (data) => {
      // Обновляем список операций для конкретного поля
      queryClient.invalidateQueries({ queryKey: ['fieldOperations', data.fieldId] });
    },
  });
};