import api from './api';
import type { TransactionLog } from '../types';

export const transactionsAPI = {
  getUserTransactionLogs: async (): Promise<TransactionLog[]> => {
    const response = await api.get('/transactions/me'); // Assuming endpoint for current user's transaction logs
    return response.data;
  },

  getGroupTransactionLogs: async (groupId: string): Promise<TransactionLog[]> => {
    const response = await api.get(`/groups/${groupId}/transactions`); // Assuming endpoint for a group's transaction logs
    return response.data;
  },
};
