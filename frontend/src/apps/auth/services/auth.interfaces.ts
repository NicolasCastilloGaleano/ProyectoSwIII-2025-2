import type { User } from "@/apps/users/services/users.interfaces";

export interface Auth {
  currentUser: User | null;
  isLoading: boolean;
  token: string | null;
}
