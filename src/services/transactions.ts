import api from './api';
import type { TransactionLog, NotificationResponseDTO, ResponseMeta } from '../types';

export const transactionsAPI = {
  getUserTransactionLogs: async (): Promise<TransactionLog[]> => {
    const response = await api.get<ResponseMeta<NotificationResponseDTO[]>>('/notifications');
    
    // Map NotificationResponseDTO to TransactionLog
    const transactionLogs: TransactionLog[] = response.data.data.map(notification => ({
        id: notification.id,
        userId: notification.userId,
        description: notification.message, // Map message to description
        type: notification.type as any, // The types might not match exactly, but it's a start
        createdAt: notification.createdAt,
    }));

    return transactionLogs;
  },

  getGroupTransactionLogs: async (groupId: string): Promise<TransactionLog[]> => {
    // This endpoint likely doesn't exist, but if it did, it should probably be `/groups/${groupId}/notifications`
    const response = await api.get<ResponseMeta<TransactionLog[]>>(`/groups/${groupId}/transactions`); 
    return response.data.data;
  },
};
