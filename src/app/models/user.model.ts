export interface User {
  id?: number;

  name: string;
  
  email: string;

  // selon ton backend : "HOST" | "HOTELIER" (ou "OWNER" etc.)
  type?: string;

  // si tu utilises Spring Security roles
  role?: string;
}
