// ============================================================================
// Base Entities
// ============================================================================

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
  payerId: string;
  payer?: User;
  amount: number;
  currency: string;
  description: string;
  participants: string[];
  participantUsers?: User[];
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
  payerId: string;
  amount: number;
  currency: string;
  description: string;
  participants: string[];
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

export interface LoginResponseDTO {
  token: string;
}

// ============================================================================
// Request DTOs
// ============================================================================

export interface CreateUserRequest {
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
  date: string;
  category: string;
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
  payerId: dto.payerId,
  amount: dto.amount,
  currency: dto.currency,
  description: dto.description,
  participants: dto.participants,
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