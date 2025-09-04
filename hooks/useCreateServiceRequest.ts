// hooks/useCreateServiceRequest.ts
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../constants.tsx';
import { ServiceRequestPayload } from '../types'; // Убедитесь, что этот тип существует

const createServiceRequest = async (requestData: ServiceRequestPayload) => {
  const { data } = await axios.post(`${API_URL}/service-requests`, requestData);
  return data;
};

export const useCreateServiceRequest = () => {
  return useMutation({
    mutationFn: createServiceRequest,
  });
};