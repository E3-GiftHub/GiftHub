// ~/components/ui/UserProfile/mockUser.ts

export interface User {
  id: string;
  username: string;
  fname: string;
  lname: string;
  email: string;
  iban: string;
  picture: string;
}

export const mockUser: User = {
  id: "1",
  fname: "Bogdan",
  lname: "De-LaCluj",
  username: "aragazcubuteliee",
  email: "aragazul@example.com",
  iban: "INGB0002819713291",
  picture: "/aragazul_pfp.jpg",
};