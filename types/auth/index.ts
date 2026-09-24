export type UserRole = "ADMIN" | "COUNSELLOR";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
}
