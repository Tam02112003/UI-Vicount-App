import api from './api';
import type { ExpenseRequestDTO, ExpenseResponseDTO } from '../types';

export const expensesAPI = {
  create: async (expenseData: ExpenseRequestDTO): Promise<ExpenseResponseDTO> => {
    const response = await api.post('/expenses', expenseData);
    // Backend returns ResponseMeta with data containing ExpenseResponseDTO
    const expense: ExpenseResponseDTO = response.data.data;
    if (!expense) {
      throw new Error('Invalid expense response: missing expense data');
    }
    return expense;
  },
  getByGroupId: async (groupId: string): Promise<ExpenseResponseDTO[]> => {
    const response = await api.get(`/expenses?groupId=${groupId}`);
    // Backend returns ResponseMeta with data containing array of ExpenseResponseDTO
    const expenses: ExpenseResponseDTO[] = response.data.data;
    if (!Array.isArray(expenses)) {
      throw new Error('Invalid expenses response: expected array');
    }
    return expenses;
  },
  getById: async (expenseId: string): Promise<ExpenseResponseDTO> => {
    const response = await api.get(`/expenses/${expenseId}`);
    // Backend returns ResponseMeta with data containing ExpenseResponseDTO
    const expense: ExpenseResponseDTO = response.data.data;
    if (!expense) {
      throw new Error('Invalid expense response: missing expense data');
    }
    return expense;
  },
  update: async (expenseId: string, expenseData: ExpenseRequestDTO): Promise<ExpenseResponseDTO> => {
    const response = await api.put(`/expenses/${expenseId}`, expenseData);
    // Backend returns ResponseMeta with data containing ExpenseResponseDTO
    const expense: ExpenseResponseDTO = response.data.data;
    if (!expense) {
      throw new Error('Invalid update expense response: missing expense data');
    }
    return expense;
  },
  delete: async (expenseId: string): Promise<void> => {
    await api.delete(`/expenses/${expenseId}`);
    // Backend returns ResponseMeta with null data for delete operations
  },
};
