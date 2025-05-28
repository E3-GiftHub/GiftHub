import { mockUser } from '~/components/ui/UserProfile/mockUser';
import type { User } from '~/components/ui/UserProfile/mockUser';

describe('mockUser', () => {
  it('should have all required user fields', () => {
    // Use the inferred type from the mock directly to avoid unsafe any assignment
    const user = mockUser;

    expect(user).toMatchObject<User>({
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

  it('should match the expected default values', () => {
    expect(mockUser.id).toBe('1');
    expect(mockUser.username).toBe('aragazcubuteliee');
    expect(mockUser.fname).toBe('Bogdan');
    expect(mockUser.lname).toBe('De-LaCluj');
    expect(mockUser.email).toBe('aragazul@example.com');
    expect(mockUser.iban).toBe('INGB0002819713291');
    expect(mockUser.picture).toBe('/UserImages/aragazul_pfp.jpg');
  });
});

