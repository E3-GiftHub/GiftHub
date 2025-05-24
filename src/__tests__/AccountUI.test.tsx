import React from 'react';
import { render, screen } from '@testing-library/react';
import AccountUI from '~/components/ui/Account/AccountUI';
import '@testing-library/jest-dom';

describe('AccountUI', () => {
  test('renders GiftHub title and image', () => {
    render(<AccountUI />);
    expect(screen.getByText('GiftHub')).toBeInTheDocument();

    const image = screen.getByRole('img', { name: /clouds/i });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/illustrations/account_visual.png');
  });
});
