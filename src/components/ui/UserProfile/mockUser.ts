// ~/components/ui/UserProfile/mockUser.ts
export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  picture: "/default-avatar.jpg",
};