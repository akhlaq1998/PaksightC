export {};
export type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
};