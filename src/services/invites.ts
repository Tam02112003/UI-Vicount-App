import api from './api';
import type { InviteRequestDTO, InviteResponseDTO } from '../types';
import { InviteStatus } from '../types'; // Assuming InviteStatus is also defined in types.ts

export const invitesAPI = {
  sendInvite: async (groupId: string, inviteData: InviteRequestDTO, userId?: string): Promise<InviteResponseDTO> => {
    const config = userId ? {
      headers: {
        'X-User-Id': userId
      }
    } : undefined;
    const response = await api.post(`/groups/${groupId}/invite`, inviteData, config);
    // Backend returns ResponseMeta with data containing InviteResponseDTO
    const invite: InviteResponseDTO = response.data.data;
    if (!invite) {
      throw new Error('Invalid invite response: missing invite data');
    }
    return invite;
  },


  getGroupInvites: async (groupId: string, userId?: string): Promise<InviteResponseDTO[]> => {
    const config = userId ? {
      headers: {
        'X-User-Id': userId
      }
    } : undefined;
    const response = await api.get(`/groups/${groupId}/invites`, config);
    // Backend returns ResponseMeta with data containing array of InviteResponseDTO
    const invites: InviteResponseDTO[] = response.data.data;
    if (!Array.isArray(invites)) {
      throw new Error('Invalid invites response: expected array');
    }
    return invites;
  },

  acceptInvite: async (token: string, userId?: string): Promise<InviteResponseDTO> => {
    const config = userId ? {
      headers: {
        'X-User-Id': userId
      }
    } : undefined;
    const response = await api.post(`/groups/invites/${token}/accept`, {}, config);
    // Backend returns ResponseMeta with data containing InviteResponseDTO
    const invite: InviteResponseDTO = response.data.data;
    if (!invite) {
      throw new Error('Invalid invite response: missing invite data');
    }
    return invite;
  },
  resendInvite: async (groupId: string, inviteData: InviteRequestDTO, userId?: string): Promise<InviteResponseDTO> => {
    const config = userId ? {
      headers: {
        'X-User-Id': userId
      }
    } : undefined;
    const response = await api.post(`/groups/${groupId}/invite/resend`, inviteData, config);
    // Backend returns ResponseMeta with data containing InviteResponseDTO
    const invite: InviteResponseDTO = response.data.data;
    if (!invite) {
      throw new Error('Invalid invite response: missing invite data');
    }
    return invite;
  },

  deleteInvite: async (groupId: string, inviteId: string, userId?: string): Promise<void> => {
    const config = userId ? {
      headers: {
        'X-User-Id': userId
      }
    } : undefined;
    await api.delete(`/groups/${groupId}/invites/${inviteId}`, config);
  },
};
