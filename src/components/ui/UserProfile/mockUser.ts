// ~/components/ui/UserProfile/mockUser.ts

export interface User {
  id: string;
  username: string;
  fname: string;
  lname: string;
  email: string;
  pictureUrl: string;
}

export const mockUser: User = {
  id: "1",
  fname: "Bogdan",
  lname: "De-LaCluj",
  username: "aragazcubuteliee",
  email: "aragazul@example.com",
  pictureUrl: "/UserImages/aragazul_pfp.jpg",
};