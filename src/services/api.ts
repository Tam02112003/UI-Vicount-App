import axios from 'axios';
import type {
  User,
  Group,
  Expense,
  Debt,
  AuthResponse,
  CreateGroupRequest,
  CreateUserRequest,
  LoginRequest,
  CreateExpenseRequest,
} from '../types';

const API_BASE_URL = 'http://localhost:8686/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to extract data from wrapped response
const extractData = <T>(response: any): T => {
  // If response has a 'data' property, extract it; otherwise return response as-is
  return response.data || response;
};

// Auth API
export const authAPI = {
  register: async (data: CreateUserRequest): Promise<AuthResponse> => {
    const res = await api.post('/users/register', data);
    console.log('Register response:', res.data);
    
    const responseData = extractData(res.data);
    
    // If user is not in response, fetch it using the token
    if (!responseData.user && responseData.token) {
      try {
        const userRes = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${responseData.token}` }
        });
        responseData.user = extractData(userRes.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Không thể lấy thông tin người dùng');
      }
    }
    
    if (!responseData.token || !responseData.user) {
      throw new Error('Phản hồi từ server không hợp lệ');
    }
    
    return responseData;
  },
  
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post('/users/login', data);
    console.log('Login response:', res.data);
    
    const responseData = extractData(res.data);
    
    // If user is not in response, fetch it using the token
    if (!responseData.user && responseData.token) {
      try {
        const userRes = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${responseData.token}` }
        });
        responseData.user = extractData(userRes.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Không thể lấy thông tin người dùng');
      }
    }
    
    if (!responseData.token || !responseData.user) {
      throw new Error('Phản hồi từ server không hợp lệ');
    }
    
    return responseData;
  },
};

// Groups API
export const groupsAPI = {
  create: (data: CreateGroupRequest): Promise<Group> =>
    api.post('/groups', data).then(res => extractData(res.data)),
  
  getAll: (): Promise<Group[]> =>
    api.get('/groups').then(res => extractData(res.data)),
  
  getById: (id: string): Promise<Group> =>
    api.get(`/groups/${id}`).then(res => extractData(res.data)),
  
  update: (id: string, data: Partial<CreateGroupRequest>): Promise<Group> =>
    api.put(`/groups/${id}`, data).then(res => extractData(res.data)),
};

// Expenses API
export const expensesAPI = {
  create: (data: CreateExpenseRequest): Promise<Expense> =>
    api.post('/expenses', data).then(res => extractData(res.data)),
  
  getByGroup: (groupId: string): Promise<Expense[]> =>
    api.get(`/expenses?groupId=${groupId}`).then(res => extractData(res.data)),
};

// Debts API
export const debtsAPI = {
  getByGroup: (groupId: string): Promise<Debt[]> =>
    api.get(`/debts?groupId=${groupId}`).then(res => extractData(res.data)),
  
  markPaid: (debtId: string): Promise<void> =>
    api.post(`/debts/${debtId}/pay`).then(res => extractData(res.data)),
};

// Users API
export const usersAPI = {
  getAll: (): Promise<User[]> =>
    api.get('/users').then(res => extractData(res.data)),
  
  getById: (id: string): Promise<User> =>
    api.get(`/users/${id}`).then(res => extractData(res.data)),
  
  getMe: (): Promise<User> =>
    api.get('/users/me').then(res => extractData(res.data)),
};