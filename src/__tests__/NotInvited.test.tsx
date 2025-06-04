import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotInvited from '~/components/notinvited';

jest.mock('../styles/notinvitedcomponent.module.css', () => ({
  notInvitedWrapper: 'notInvitedWrapper',
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
    
    const textElement = screen.getByText('Sorry, you are not invited to this event :(');
    expect(textElement).toHaveClass('notInvitedText');
    
    const container = textElement.closest('.notInvitedContainer');
    expect(container).toHaveClass('notInvitedContainer');
    
    const wrapper = container?.closest('.notInvitedWrapper');
    expect(wrapper).toHaveClass('notInvitedWrapper');
  });

  test('has correct structure', () => {
    const { container } = render(<NotInvited />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('notInvitedWrapper');
    
    const innerContainer = wrapper?.firstChild;
    expect(innerContainer).toHaveClass('notInvitedContainer');
    
    const textDiv = innerContainer?.firstChild;
    expect(textDiv).toHaveClass('notInvitedText');
    expect(textDiv).toHaveTextContent('Sorry, you are not invited to this event :(');
  });

  test('renders as a functional component', () => {
    const { container } = render(<NotInvited />);
    expect(container.firstChild).toBeInTheDocument();
  });
});