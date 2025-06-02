// ~/components/ui/UserProfile/mockUser.test.ts
import { mockUser, type User } from "~/components/ui/UserProfile/mockUser";

describe('User Interface and mockUser', () => {
  test('User interface has correct structure', () => {
    const testUser: User = {
      id: 'test-id',
      username: 'test-username',
      fname: 'test-fname',
      lname: 'test-lname',
      email: 'test-email',
      iban: 'test-iban',
      picture: 'test-picture',
    };

    expect(testUser).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      username: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      fname: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      lname: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      email: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      iban: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      picture: expect.any(String),
    });
  });

  describe('mockUser object', () => {
    test('has all required properties', () => {
      expect(mockUser).toHaveProperty('id');
      expect(mockUser).toHaveProperty('username');
      expect(mockUser).toHaveProperty('fname');
      expect(mockUser).toHaveProperty('lname');
      expect(mockUser).toHaveProperty('email');
      expect(mockUser).toHaveProperty('iban');
      expect(mockUser).toHaveProperty('picture');
    });

    test('has correct property values', () => {
      expect(mockUser.id).toBe('1');
      expect(mockUser.username).toBe('aragazcubuteliee');
      expect(mockUser.fname).toBe('Bogdan');
      expect(mockUser.lname).toBe('De-LaCluj');
      expect(mockUser.email).toBe('aragazul@example.com');
      expect(mockUser.iban).toBe('INGB0002819713291');
      expect(mockUser.picture).toBe('/UserImages/aragazul_pfp.jpg');
    });

    test('has correct property types', () => {
      expect(typeof mockUser.id).toBe('string');
      expect(typeof mockUser.username).toBe('string');
      expect(typeof mockUser.fname).toBe('string');
      expect(typeof mockUser.lname).toBe('string');
      expect(typeof mockUser.email).toBe('string');
      expect(typeof mockUser.iban).toBe('string');
      expect(typeof mockUser.picture).toBe('string');
    });
  });
});