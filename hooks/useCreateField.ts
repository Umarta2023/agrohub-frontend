// hooks/useCreateField.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Field } from '../types';

// Тип данных для создания поля. Берем все поля из типа Field, кроме id.
type CreateFieldData = Omit<Field, 'id'>;

const createField = async (fieldData: CreateFieldData): Promise<Field> => {
  const { data } = await axios.post(`${API_URL}/fields`, fieldData);
  return data;
};

export const useCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createField,
    onSuccess: () => {
      // После успешного создания поля, делаем невалидным кеш списка полей,
      // чтобы на странице MyFields отобразились актуальные данные.
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
  });
};