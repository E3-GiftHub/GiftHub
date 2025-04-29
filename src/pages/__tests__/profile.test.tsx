import { render, screen } from '@testing-library/react';
import UserProfile from '../../pages/profile';
import '@testing-library/jest-dom';

jest.mock('~/components/Navbar', () => ({
  __esModule: true,
  default: () => <div>Mock Navbar</div>,
}));

jest.mock('~/components/ui/UserProfile/UserProfileUI', () => ({
  __esModule: true,
  default: () => <div>Mock UserProfileUI</div>,
}));

describe('UserProfile Page', () => {
  it('renders all components', () => {
    render(<UserProfile />);

    expect(screen.getByText('Mock Navbar')).toBeInTheDocument();
    expect(screen.getByText('Mock UserProfileUI')).toBeInTheDocument();
    expect(screen.getByTestId('empty-space')).toBeInTheDocument();
  });
});