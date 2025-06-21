import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User }> => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  if (userRole === "admin") return true; // Admin has access to everything
  return requiredRoles.includes(userRole);
};
