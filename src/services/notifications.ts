import api from './api';
import type { NotificationResponseDTO, InviteResponseDTO } from '../types'; // Import NotificationResponseDTO

export const notificationsAPI = {
  getGeneralNotifications: async (): Promise<NotificationResponseDTO[]> => {
    const response = await api.get('/notifications'); // Calls the new backend /api/v1/notifications endpoint
    // Backend returns ResponseMeta with data containing array of NotificationResponseDTO
    const notifications: NotificationResponseDTO[] = response.data.data;
    if (!Array.isArray(notifications)) {
      throw new Error('Invalid notifications response: expected array');
    }
    return notifications;
  },

  getPendingInviteNotifications: async (): Promise<InviteResponseDTO[]> => {
    const response = await api.get('/users/me/invites/pending');
    // Backend returns ResponseMeta with data containing array of InviteResponseDTO
    const invites: InviteResponseDTO[] = response.data.data;
    if (!Array.isArray(invites)) {
      throw new Error('Invalid invites response: expected array');
    }
    return invites;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`); // Calls the new backend /api/v1/notifications/{id}/read endpoint
  },

  // The previous deleteNotification is not part of this specific task, keeping it for now.
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};
