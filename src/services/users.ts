import api from './api';
import type { User, RegisterRequest, LoginRequest, LoginResponse, UserUpdateRequest, ChangePasswordRequest, UserResponseDTO } from '../types';
import { mapUserDTOToUser } from '../types';

export const usersAPI = {
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    // Backend returns ResponseMeta with data containing UserResponseDTO
    const userDTO: UserResponseDTO = response.data.data;
    if (!userDTO) {
      throw new Error('Invalid user response: missing user data');
    }
    return mapUserDTOToUser(userDTO);
  },
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    // Backend returns ResponseMeta with data containing UserResponseDTO
    const userDTO: UserResponseDTO = response.data.data;
    if (!userDTO) {
      throw new Error('Invalid profile response: missing user data');
    }
    return mapUserDTOToUser(userDTO);
  },
  updateProfile: async (userData: UserUpdateRequest, currentUser: User): Promise<User> => {
    // Backend UserRequestDTO requires all fields (name, email, password, currency)
    // But updateProfile only updates name, avatarUrl, currency
    // So we need to send the current email and a placeholder password
    const requestData = {
      name: userData.name || currentUser.name,
      email: currentUser.email, // Keep current email
      password: 'PLACEHOLDER_PASSWORD', // Backend requires password but doesn't use it in updateProfile
      avatarUrl: userData.avatarUrl,
      currency: userData.currency || currentUser.currency,
    };
    const response = await api.put('/users/me', requestData);
    // Backend returns ResponseMeta with data containing UserResponseDTO
    const userDTO: UserResponseDTO = response.data.data;
    if (!userDTO) {
      throw new Error('Invalid update profile response: missing user data');
    }
    return mapUserDTOToUser(userDTO);
  },
  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    await api.put('/users/me/password', passwordData);
    // Backend returns ResponseMeta with null data for password change
  },
  register: async (userData: RegisterRequest): Promise<void> => {
    await api.post('/users/register', userData);
  },
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/users/login', credentials);
    // Backend returns ResponseMeta with data containing LoginResponseDTO (token, refreshToken)
    const loginData = response.data.data;
    if (!loginData || !loginData.token || !loginData.refreshToken) {
      throw new Error('Invalid login response: missing token or refreshToken');
    }
    // Map backend's 'token' field to frontend's 'accessToken' field
    return {
      accessToken: loginData.token,
      refreshToken: loginData.refreshToken,
    };
  },
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    // Backend expects refreshToken as a plain string in request body, not as JSON object
    const response = await api.post('/auth/refresh-token', refreshToken, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // Backend returns ResponseMeta with data containing LoginResponseDTO (token, refreshToken)
    const loginData = response.data.data;
    if (!loginData || !loginData.token || !loginData.refreshToken) {
      throw new Error('Invalid refresh token response: missing token or refreshToken');
    }
    // Map backend's 'token' field to frontend's 'accessToken' field
    return {
      accessToken: loginData.token,
      refreshToken: loginData.refreshToken,
    };
  },
};
