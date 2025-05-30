// ViewUserProfileUI.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewUserProfileUI from "~/components/ui/UserProfile/ViewUserProfileUI";
import { useRouter } from 'next/router';
import { mockUser } from '~/components/ui/UserProfile/mockUser';

// Mock next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: never) => {
  //@ts-expect-error eplm
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('ViewUserProfileUI Component', () => {
  const renderComponent = (props: Partial<React.ComponentProps<typeof ViewUserProfileUI>> = {}) => {
    const defaultProps: React.ComponentProps<typeof ViewUserProfileUI> = {
      username: mockUser.username,
      fname: mockUser.fname,
      lname: mockUser.lname,
      avatarUrl: mockUser.picture,
      email: mockUser.email,
      iban: mockUser.iban,
      onReport: jest.fn(),
      loading: false,
    };

    return render(<ViewUserProfileUI {...defaultProps} {...props} />);
  };

  it('renders user profile correctly', () => {
    renderComponent();

    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    // expect(screen.getByText(mockUser.fname)).toBeInTheDocument();
    expect(screen.getByText(mockUser.lname)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'User avatar' })).toHaveAttribute(
      'src',
      mockUser.picture
    );
    expect(screen.getByText('Report account')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    renderComponent({ loading: true });

    // // Check for loading elements
    // expect(screen.getByTestId('avatar-loading')).toHaveClass(styles.loading);
    // expect(screen.getByTestId('username-loading')).toHaveClass(styles.loading);
    // expect(screen.getByTestId('fname-loading')).toHaveClass(styles.loading);
    // expect(screen.getByTestId('lname-loading')).toHaveClass(styles.loading);
    // expect(screen.getByText('Report account')).toBeDisabled();
  });

  it('opens report modal when report button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Report account'));
    expect(screen.getByText('Report User')).toBeInTheDocument();
  });

  it('closes report modal when clicking overlay', async () => {
    renderComponent();

    fireEvent.click(screen.getByText('Report account'));
    // fireEvent.click(screen.getByTestId('modal-overlay'));
    // await waitFor(() => {
      // expect(screen.queryByText('Report User')).not.toBeInTheDocument();
    // });
  });

  describe('Report Modal Functionality', () => {
    beforeEach(() => {
      renderComponent();
      fireEvent.click(screen.getByText('Report account'));
    });

    it('requires selection of a reason', () => {
      fireEvent.click(screen.getByText('Submit Report'));
      expect(screen.getByText('Report User')).toBeInTheDocument(); // Still open
    });

    it('requires description for "Other" reason', () => {
      fireEvent.change(screen.getByLabelText('Reason'), {
        target: { value: 'Other' }
      });
      fireEvent.click(screen.getByText('Submit Report'));
      expect(screen.getByText('Report User')).toBeInTheDocument();
    });

    it('submits successfully with valid reason', () => {
      fireEvent.change(screen.getByLabelText('Reason'), {
        target: { value: 'Spam' }
      });
      fireEvent.click(screen.getByText('Submit Report'));

      expect(screen.getByText(/Thank you for your report!/i)).toBeInTheDocument();
    });

    it('submits successfully with "Other" reason and description', () => {
      fireEvent.change(screen.getByLabelText('Reason'), {
        target: { value: 'Other' }
      });
      fireEvent.change(screen.getByLabelText('Please specify the reason.'), {
        target: { value: 'Custom reason description' }
      });
      fireEvent.click(screen.getByText('Submit Report'));

      expect(screen.getByText(/Thank you for your report!/i)).toBeInTheDocument();
    });

    it('closes modal after successful submission', async () => {
      fireEvent.change(screen.getByLabelText('Reason'), {
        target: { value: 'Impersonation' }
      });
      fireEvent.click(screen.getByText('Submit Report'));

      fireEvent.click(screen.getByText('Close'));
      await waitFor(() => {
        expect(screen.queryByText(/Thank you for your report!/i)).not.toBeInTheDocument();
      });
    });
  });
});