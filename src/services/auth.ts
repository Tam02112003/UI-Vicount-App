import api from './api';

export const authAPI = {
  logout: async (refreshToken?: string): Promise<void> => {
    // Backend expects refreshToken as a plain string in request body
    // Authorization header is automatically added by interceptor
    await api.post('/auth/logout', refreshToken || '', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // Backend returns ResponseMeta with null data for logout
  },
};

