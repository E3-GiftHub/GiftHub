export interface User {
  id: string;
  username: string;
  fname: string;
  lname: string;
  email: string;
  iban: string;
  picture: string;
}

export type UserInfo = User;