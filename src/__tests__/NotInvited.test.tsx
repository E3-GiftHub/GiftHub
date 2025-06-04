import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotInvited from '~/components/notinvited';

jest.mock('../styles/notinvitedcomponent.module.css', () => ({
  notInvitedContainer: 'notInvitedContainer',
  notInvitedText: 'notInvitedText',
}));

describe('NotInvited', () => {
  test('renders the not invited message', () => {
    render(<NotInvited />);
    
    const message = screen.getByText('Sorry, you are not invited to this event :(');
    expect(message).toBeInTheDocument();
  });

  test('renders with correct CSS classes', () => {
    render(<NotInvited />);
    
    const container = screen.getByText('Sorry, you are not invited to this event :(').closest('div');
    expect(container).toHaveClass('notInvitedText');
    
    const parentContainer = container?.parentElement;
    expect(parentContainer).toHaveClass('notInvitedContainer');
  });

  test('has correct structure', () => {
    const { container } = render(<NotInvited />);
    
    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass('notInvitedContainer');
    
    const innerDiv = outerDiv?.firstChild;
    expect(innerDiv).toHaveClass('notInvitedText');
    expect(innerDiv).toHaveTextContent('Sorry, you are not invited to this event :(');
  });

  test('renders as a functional component', () => {
    const { container } = render(<NotInvited />);
    expect(container.firstChild).toBeInTheDocument();
  });
});