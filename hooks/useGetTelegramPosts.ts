// hooks/useGetTelegramPosts.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { TelegramPost } from '../types';

const getTelegramPosts = async (): Promise<TelegramPost[]> => {
  // Аналогично, пока нет эндпоинта на бэкенде
  // const { data } = await axios.get(`${API_URL}/telegram-posts`);
  // return data;
  return Promise.resolve([]); // Временная заглушка
};

export const useGetTelegramPosts = () => {
  return useQuery({
    queryKey: ['telegramPosts'],
    queryFn: getTelegramPosts,
  });
};