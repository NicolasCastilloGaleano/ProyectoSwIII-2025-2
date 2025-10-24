export interface APIResponse<T> {
  message: string;
  data: T;
}

export type SafeResponse<T> =
  | { success: true; data: T; message: string }
  | { success: false; error: string };

export interface PaginatedResponse<T> {
  items: T[];
  lastVisible: string | null;
  hasMore?: boolean;
}
