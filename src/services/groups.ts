import api from './api';
import type { Group, CreateGroupRequest, GroupResponseDTO } from '../types';
import { mapGroupDTOToGroup } from '../types';

export const groupsAPI = {
  create: async (groupData: CreateGroupRequest): Promise<Group> => {
    const response = await api.post('/groups', groupData);
    // Backend returns ResponseMeta with data containing GroupResponseDTO
    const groupDTO: GroupResponseDTO = response.data.data;
    if (!groupDTO) {
      throw new Error('Invalid create group response: missing group data');
    }
    return mapGroupDTOToGroup(groupDTO);
  },
  getAll: async (userId?: string): Promise<Group[]> => {
    const response = await api.get('/groups', { params: userId ? { userId } : {} });
    // Backend returns ResponseMeta with data containing array of GroupResponseDTO
    const groupsDTO: GroupResponseDTO[] = response.data.data;
    if (!Array.isArray(groupsDTO)) {
      throw new Error('Invalid groups response: expected array');
    }
    return groupsDTO.map(mapGroupDTOToGroup);
  },
  getById: async (id: string): Promise<Group> => {
    const response = await api.get(`/groups/${id}`);
    // Backend returns ResponseMeta with data containing GroupResponseDTO
    const groupDTO: GroupResponseDTO = response.data.data;
    if (!groupDTO) {
      throw new Error('Invalid group response: missing group data');
    }
    return mapGroupDTOToGroup(groupDTO);
  },
  deleteMember: async (groupId: string, memberId: string, userId: string): Promise<void> => {
    await api.delete(`/groups/${groupId}/members/${memberId}`, { headers: { 'X-User-Id': userId } });
  },
  leaveGroup: async (groupId: string, userId: string): Promise<void> => {
    await api.delete(`/groups/${groupId}/leave`, { headers: { 'X-User-Id': userId } });
  },
  update: async (groupId: string, groupData: CreateGroupRequest): Promise<Group> => {
    const response = await api.put(`/groups/${groupId}`, groupData);
    // Backend returns ResponseMeta with data containing GroupResponseDTO
    const groupDTO: GroupResponseDTO = response.data.data;
    if (!groupDTO) {
      throw new Error('Invalid update group response: missing group data');
    }
    return mapGroupDTOToGroup(groupDTO);
  },
  delete: async (groupId: string): Promise<void> => {
    await api.delete(`/groups/${groupId}`);
    // Backend returns ResponseMeta with null data for delete operations
  },
};
