export interface User {
  id: string;
  email: string;
  name: string;
  description?: string;
  tags?: string[];
  isActive: boolean;
  links?: Record<string, string>;
  team?: string;
  avatarUrl?: string;
  availableDays?: string[];
  createdAt: string;
  updatedAt: string;
  isAdmin?: boolean;
} 