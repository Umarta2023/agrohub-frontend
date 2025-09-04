// hooks/useMarkNotificationAsRead.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';

// ID уведомления будет числом
const markAsRead = (notificationId: number) => {
  return axios.patch(`${API_URL}/agro-notifications/${notificationId}/read`);
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};