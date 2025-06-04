import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileFilterMenu from '../components/ui/MobileFilterMenu';
import '@testing-library/jest-dom';

// Mock CSS modules
jest.mock('../../styles/MobileFilterMenu.module.css', () => ({
  overlay: 'overlay',
  menu: 'menu',
  menuItem: 'menuItem',
  active: 'active',
}));

describe('MobileFilterMenu', () => {
  const mockOnSelect = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    visible: true,
    activeTab: 'All',
    onSelect: mockOnSelect,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    mockOnSelect.mockClear();
    mockOnClose.mockClear();
  });

  test('renders nothing when not visible', () => {
    render(<MobileFilterMenu {...defaultProps} visible={false} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders all tab options when visible', () => {
    render(<MobileFilterMenu {...defaultProps} />);
    
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('My events')).toBeInTheDocument();
    expect(screen.getByText('Invitations')).toBeInTheDocument();
  });

  test('highlights active tab', () => {
    render(<MobileFilterMenu {...defaultProps} activeTab="My events" />);
    
    const activeTab = screen.getByText('My events');
    expect(activeTab).toHaveClass('menuItem active');
    
    const inactiveTab = screen.getByText('All');
    expect(inactiveTab).toHaveClass('menuItem');
    expect(inactiveTab).not.toHaveClass('active');
  });

  test('calls onSelect and onClose when tab is clicked', () => {
    render(<MobileFilterMenu {...defaultProps} />);
    
    const invitationsTab = screen.getByText('Invitations');
    fireEvent.click(invitationsTab);
    
    expect(mockOnSelect).toHaveBeenCalledWith('Invitations');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when overlay is clicked', () => {
    const { container } = render(<MobileFilterMenu {...defaultProps} />);
    
    const overlay = container.querySelector('.overlay');
    fireEvent.click(overlay!);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when Enter key is pressed on overlay', () => {
    const { container } = render(<MobileFilterMenu {...defaultProps} />);
    
    const overlay = container.querySelector('.overlay');
    fireEvent.keyDown(overlay!, { key: 'Enter' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when Space key is pressed on overlay', () => {
    const { container } = render(<MobileFilterMenu {...defaultProps} />);
    
    const overlay = container.querySelector('.overlay');
    fireEvent.keyDown(overlay!, { key: ' ' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose for other keys on overlay', () => {
    const { container } = render(<MobileFilterMenu {...defaultProps} />);
    
    const overlay = container.querySelector('.overlay');
    fireEvent.keyDown(overlay!, { key: 'Escape' });
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('renders overlay with correct accessibility attributes', () => {
    const { container } = render(<MobileFilterMenu {...defaultProps} />);
    
    const overlay = container.querySelector('.overlay');
    expect(overlay).toHaveAttribute('tabIndex', '0');
    expect(overlay).toHaveClass('overlay');
  });

  test('handles different active tabs correctly', () => {
    const { rerender } = render(<MobileFilterMenu {...defaultProps} activeTab="All" />);
    
    expect(screen.getByText('All')).toHaveClass('menuItem active');
    
    rerender(<MobileFilterMenu {...defaultProps} activeTab="Invitations" />);
    
    expect(screen.getByText('Invitations')).toHaveClass('menuItem active');
    expect(screen.getByText('All')).not.toHaveClass('active');
  });
});