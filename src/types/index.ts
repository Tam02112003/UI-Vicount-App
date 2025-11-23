// ============================================================================
// Base Entities
// ============================================================================

export interface SimplifiedUser {
  id: string;
  name: string;
  email: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  memberIds: string[];
  members?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  groupId: string;
  payer: SimplifiedUser;
  amount: number;
  currency: string;
  description: string;
  participants: SimplifiedUser[];
  date: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  _id: string;
  fromUserId: string;
  toUserId: string;
  fromUser?: User;
  toUser?: User;
  amount: number;
  currency: string;
  groupId: string;
  expenseId?: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponseDTO {
  id: string;
  userId: string;
  message: string;
  type: string; // e.g., "INVITE_ACCEPTED"
  readStatus: boolean;
  createdAt: string;
}

export interface TransactionLog {
  id: string;
  userId: string;
  groupId?: string;
  expenseId?: string;
  debtId?: string;
  type: 'EXPENSE_CREATED' | 'DEBT_PAID' | 'GROUP_JOINED' | 'INVITE_ACCEPTED' | 'USER_REGISTERED' | 'USER_UPDATED'; // Example types
  description: string;
  amount?: number;
  currency?: string;
  createdAt: string;
}

// ============================================================================
// Backend DTOs (matching Java Spring Boot responses)
// ============================================================================

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currency: string;
}

export interface GroupResponseDTO {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdDate: string;
}

export interface ExpenseResponseDTO {
  id: string;
  groupId: string;
  payer: SimplifiedUser;
  amount: number;
  currency: string;
  description: string;
  participantsDetails: SimplifiedUser[];
  date: string;
  category: string;
  settled: boolean;
}

export interface DebtResponseDTO {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  groupId: string;
  expenseId?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// ============================================================================
// Request DTOs
// ============================================================================

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  currency: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  memberIds: string[];
}

export interface CreateExpenseRequest {
  groupId: string;
  payerId: string;
  amount: number;
  currency: string;
  description: string;
  participants: string[];
  date: string; // ISO string, will be converted to Instant on backend
  category: string;
}

// Alias for ExpenseRequestDTO (same structure)
export type ExpenseRequestDTO = CreateExpenseRequest;

export interface UserUpdateRequest {
  name?: string;
  avatarUrl?: string;
  currency?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
}

export interface InviteRequestDTO {
  email: string;
}

export interface InviteResponseDTO {
  id: string;
  groupId: string;
  groupName: string;
  email: string;
  invitedBy: string;
  invitedByName: string;
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;
  token: string; // Added token field
}


// ============================================================================
// Application Response Types
// ============================================================================

export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================================================
// API Response Wrapper (from Spring Boot)
// ============================================================================

export interface MetaMessage {
  code: number;
  message: string;
}

export interface ResponseMeta<T = any> {
  meta: MetaMessage[];
  data: T;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Currency = 'VND' | 'USD';

export type ExpenseCategory = 
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Travel'
  | 'Other';

// ============================================================================
// Type Guards
// ============================================================================

export const isResponseMeta = <T>(obj: any): obj is ResponseMeta<T> => {
  return obj && typeof obj === 'object' && 'data' in obj && 'meta' in obj;
};

export const isUser = (obj: any): obj is User => {
  return obj && typeof obj === 'object' && '_id' in obj && 'email' in obj && 'name' in obj;
};

export const isGroup = (obj: any): obj is Group => {
  return obj && typeof obj === 'object' && '_id' in obj && 'memberIds' in obj;
};

// ============================================================================
// Mapper Functions
// ============================================================================

export const mapUserDTOToUser = (dto: UserResponseDTO): User => ({
  _id: dto.id,
  name: dto.name,
  email: dto.email,
  avatarUrl: dto.avatarUrl,
  currency: dto.currency,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const mapGroupDTOToGroup = (dto: GroupResponseDTO): Group => ({
  _id: dto.id,
  name: dto.name,
  description: dto.description,
  memberIds: dto.members,
  createdAt: dto.createdDate,
  updatedAt: dto.createdDate,
});

export const mapExpenseDTOToExpense = (dto: ExpenseResponseDTO): Expense => ({
  _id: dto.id,
  groupId: dto.groupId,
  payer: dto.payer,
  amount: dto.amount,
  currency: dto.currency,
  description: dto.description,
  participants: dto.participantsDetails,
  date: dto.date,
  category: dto.category,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const mapDebtDTOToDebt = (dto: DebtResponseDTO): Debt => ({
  _id: dto.id,
  fromUserId: dto.fromUserId,
  toUserId: dto.toUserId,
  amount: dto.amount,
  currency: dto.currency,
  groupId: dto.groupId,
  expenseId: dto.expenseId,
  isPaid: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
