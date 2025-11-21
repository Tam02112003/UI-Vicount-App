import api from './api';
import type { DebtResponseDTO, PayDebtRequestDTO } from '../types';

export const debtsAPI = {
  getSimplified: async (groupId: string): Promise<DebtResponseDTO[]> => {
    const response = await api.get(`/debts/group/${groupId}/simplified`);
    // Backend returns ResponseMeta with data containing array of DebtResponseDTO
    const debts: DebtResponseDTO[] = response.data.data;
    if (!Array.isArray(debts)) {
      throw new Error('Invalid simplified debts response: expected array');
    }
    return debts;
  },
  getByGroupId: async (groupId: string): Promise<DebtResponseDTO[]> => {
    const response = await api.get(`/debts?groupId=${groupId}`);
    // Backend returns ResponseMeta with data containing array of DebtResponseDTO
    const debts: DebtResponseDTO[] = response.data.data;
    if (!Array.isArray(debts)) {
      throw new Error('Invalid debts response: expected array');
    }
    return debts;
  },
  payDebt: async (debtId: string, payData: PayDebtRequestDTO): Promise<void> => {
    await api.post(`/debts/${debtId}/pay`, payData);
    // Backend returns ResponseMeta with null data for pay debt operations
  },
  getByUserId: async (userId: string): Promise<DebtResponseDTO[]> => {
    const response = await api.get(`/debts/user/${userId}`);
    // Backend returns ResponseMeta with data containing array of DebtResponseDTO
    const debts: DebtResponseDTO[] = response.data.data;
    if (!Array.isArray(debts)) {
      throw new Error('Invalid debts response: expected array');
    }
    return debts;
  },
};
