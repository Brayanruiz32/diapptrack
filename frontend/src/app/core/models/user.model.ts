export type Role = 'PATIENT' | 'ADMIN';
export type Sex  = 'M' | 'F' | 'OTHER';

export interface User {
  id: number;
  fullName: string;
  email: string;
  dni?: string;
  role: Role;
  birthDate?: string;
  diagnosisDate?: string;
  sex?: Sex;
  weightKg?: number;
  heightCm?: number;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  dni: string;
  birthDate?: string;
  diagnosisDate?: string;
  sex?: Sex;
  weightKg?: number;
  heightCm?: number;
}
