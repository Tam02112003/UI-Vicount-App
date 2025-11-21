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

// Auth API
export const authAPI = {
  register: (data: CreateUserRequest): Promise<AuthResponse> =>
    api.post('/users/register', data).then(res => {
      console.log('Register response:', res.data);
      // Extract data from the wrapper
      const responseData = res.data.data || res.data;
      return responseData;
    }),
  
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/users/login', data).then(res => {
      console.log('Login response:', res.data);
      // Extract data from the wrapper
      const responseData = res.data.data || res.data;
      return responseData;
    }),
};

// Groups API
export const groupsAPI = {
  create: (data: CreateGroupRequest): Promise<Group> =>
    api.post('/groups', data).then(res => res.data),
  
  getAll: (): Promise<Group[]> =>
    api.get('/groups').then(res => res.data),
  
  getById: (id: string): Promise<Group> =>
    api.get(`/groups/${id}`).then(res => res.data),
  
  update: (id: string, data: Partial<CreateGroupRequest>): Promise<Group> =>
    api.put(`/groups/${id}`, data).then(res => res.data),
};

// Expenses API
export const expensesAPI = {
  create: (data: CreateExpenseRequest): Promise<Expense> =>
    api.post('/expenses', data).then(res => res.data),
  
  getByGroup: (groupId: string): Promise<Expense[]> =>
    api.get(`/expenses?groupId=${groupId}`).then(res => res.data),
};

// Debts API
export const debtsAPI = {
  getByGroup: (groupId: string): Promise<Debt[]> =>
    api.get(`/debts?groupId=${groupId}`).then(res => res.data),
  
  markPaid: (debtId: string): Promise<void> =>
    api.post(`/debts/${debtId}/pay`).then(res => res.data),
};

// Users API
export const usersAPI = {
  getAll: (): Promise<User[]> =>
    api.get('/users').then(res => res.data),
  
  getById: (id: string): Promise<User> =>
    api.get(`/users/${id}`).then(res => res.data),
};