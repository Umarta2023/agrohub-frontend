// hooks/useGetCommunityChannels.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { CommunityChannel } from '../types';

const getCommunityChannels = async (): Promise<CommunityChannel[]> => {
  // ПРИМЕЧАНИЕ: На вашем бэкенде пока нет эндпоинта для этого.
  // Мы создадим хук, но он будет возвращать пустой массив, пока вы не создадите роут на бэкенде.
  // const { data } = await axios.get(`${API_URL}/community-channels`);
  // return data;
  return Promise.resolve([]); // Временная заглушка
};

export const useGetCommunityChannels = () => {
  return useQuery({
    queryKey: ['communityChannels'],
    queryFn: getCommunityChannels,
  });
};