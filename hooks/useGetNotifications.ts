// hooks/useGetNotifications.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { AgroNotification } from '../types';

const getNotifications = async (): Promise<AgroNotification[]> => {
  // Аналогично, пока нет эндпоинта на бэкенде
  // const { data } = await axios.get(`${API_URL}/notifications`);
  // return data;
  return Promise.resolve([]); // Временная заглушка
};

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });
};