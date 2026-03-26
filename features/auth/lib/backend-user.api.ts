import { api } from '@/lib/api';
import axios from 'axios';

import type { BackendUser } from '@/features/auth/lib/backend-user';

export async function syncBackendUser(token: string) {
  try {
    const response = await api.get<BackendUser>('/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('UNAUTHORIZED');
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Backend sync timed out. Check EXPO_PUBLIC_API_URL and backend availability.');
      }

      if (!error.response) {
        throw new Error('Failed to reach the backend. Check EXPO_PUBLIC_API_URL.');
      }
    }

    throw new Error('Failed to sync backend user.');
  }
}
