import api from './api';
import type { Notification } from '../types';

export const notificationsAPI = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/me'); // Assuming endpoint for current user's notifications
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};
