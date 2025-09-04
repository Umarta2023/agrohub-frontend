// hooks/useGetAds.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { Ad } from '../types';

const getAds = async (): Promise<Ad[]> => {
  const { data } = await axios.get(`${API_URL}/ads`);
  return data;
};

export const useGetAds = () => {
  return useQuery({
    queryKey: ['ads'],
    queryFn: getAds,
  });
};