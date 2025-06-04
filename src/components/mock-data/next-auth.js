const useSession = jest.fn(() => ({
  data: { user: { id: "1", name: "Test User" } },
  status: "authenticated"
}));

const signOut = jest.fn();
const signIn = jest.fn();

module.exports = {
  useSession,
  signOut,
  signIn
};