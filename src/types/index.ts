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
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  memberIds: string[];
}

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