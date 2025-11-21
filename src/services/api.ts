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
  ResponseMeta,
  LoginResponseDTO,
  UserResponseDTO,
  GroupResponseDTO,
  ExpenseResponseDTO,
  DebtResponseDTO,
} from '../types';

import {
  mapUserDTOToUser,
  mapGroupDTOToGroup,
  mapExpenseDTOToExpense,
  mapDebtDTOToDebt,
  isResponseMeta,
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

// ============================================================================
// Helper Functions
// ============================================================================

const extractData = <T>(response: ResponseMeta<T> | T): T => {
  if (isResponseMeta<T>(response)) {
    return response.data;
  }
  return response;
};

const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// ============================================================================
// Auth API
// ============================================================================

export const authAPI = {
  register: async (data: CreateUserRequest): Promise<AuthResponse> => {
    const res = await api.post<ResponseMeta<LoginResponseDTO>>('/users/register', data);
    const responseData = extractData(res.data);
    
    if (!responseData.token) {
      throw new Error('Phản hồi từ server không hợp lệ');
    }
    
    const tokenPayload = decodeToken(responseData.token);
    
    if (!tokenPayload?.sub) {
      throw new Error('Token không hợp lệ');
    }
    
    let user: User;
    
    try {
      const userRes = await api.get<ResponseMeta<UserResponseDTO>>(`/users/${tokenPayload.sub}`, {
        headers: { Authorization: `Bearer ${responseData.token}` }
      });
      user = mapUserDTOToUser(extractData(userRes.data));
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Fallback
      user = {
        _id: tokenPayload.sub,
        name: data.name,
        email: data.email,
        currency: data.currency,
        avatarUrl: data.avatarUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    return { token: responseData.token, user };
  },
  
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<ResponseMeta<LoginResponseDTO>>('/users/login', data);
    const responseData = extractData(res.data);
    
    if (!responseData.token) {
      throw new Error('Phản hồi từ server không hợp lệ');
    }
    
    const tokenPayload = decodeToken(responseData.token);
    
    if (!tokenPayload?.sub) {
      throw new Error('Token không hợp lệ');
    }
    
    try {
      const userRes = await api.get<ResponseMeta<UserResponseDTO>>(`/users/${tokenPayload.sub}`, {
        headers: { Authorization: `Bearer ${responseData.token}` }
      });
      const user = mapUserDTOToUser(extractData(userRes.data));
      
      return { token: responseData.token, user };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error('Không thể lấy thông tin người dùng');
    }
  },
};

// ============================================================================
// Groups API
// ============================================================================

export const groupsAPI = {
  create: async (data: CreateGroupRequest): Promise<Group> => {
    const res = await api.post<ResponseMeta<GroupResponseDTO>>('/groups', data);
    return mapGroupDTOToGroup(extractData(res.data));
  },
  
  getAll: async (): Promise<Group[]> => {
    const res = await api.get<ResponseMeta<GroupResponseDTO[]>>('/groups');
    const groups = extractData(res.data);
    return Array.isArray(groups) ? groups.map(mapGroupDTOToGroup) : [];
  },
  
  getById: async (id: string): Promise<Group> => {
    const res = await api.get<ResponseMeta<GroupResponseDTO>>(`/groups/${id}`);
    return mapGroupDTOToGroup(extractData(res.data));
  },
  
  update: async (id: string, data: Partial<CreateGroupRequest>): Promise<Group> => {
    const res = await api.put<ResponseMeta<GroupResponseDTO>>(`/groups/${id}`, data);
    return mapGroupDTOToGroup(extractData(res.data));
  },
};

// ============================================================================
// Expenses API
// ============================================================================

export const expensesAPI = {
  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const res = await api.post<ResponseMeta<ExpenseResponseDTO>>('/expenses', data);
    return mapExpenseDTOToExpense(extractData(res.data));
  },
  
  getByGroup: async (groupId: string): Promise<Expense[]> => {
    const res = await api.get<ResponseMeta<ExpenseResponseDTO[]>>(`/expenses?groupId=${groupId}`);
    const expenses = extractData(res.data);
    return Array.isArray(expenses) ? expenses.map(mapExpenseDTOToExpense) : [];
  },
};

// ============================================================================
// Debts API
// ============================================================================

export const debtsAPI = {
  getByGroup: async (groupId: string): Promise<Debt[]> => {
    const res = await api.get<ResponseMeta<DebtResponseDTO[]>>(`/debts?groupId=${groupId}`);
    const debts = extractData(res.data);
    return Array.isArray(debts) ? debts.map(mapDebtDTOToDebt) : [];
  },
  
  markPaid: async (debtId: string): Promise<void> => {
    await api.post<ResponseMeta<void>>(`/debts/${debtId}/pay`);
  },
};

// ============================================================================
// Users API
// ============================================================================

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get<ResponseMeta<UserResponseDTO[]>>('/users');
    const users = extractData(res.data);
    return Array.isArray(users) ? users.map(mapUserDTOToUser) : [];
  },
  
  getById: async (id: string): Promise<User> => {
    const res = await api.get<ResponseMeta<UserResponseDTO>>(`/users/${id}`);
    return mapUserDTOToUser(extractData(res.data));
  },
};