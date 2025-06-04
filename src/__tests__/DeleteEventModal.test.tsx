import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteEventModal from '~/components/DeleteEventModal';

// Mock CSS modules
jest.mock('../styles/ConfirmDeleteEvent.module.css', () => ({
  modalOverlay: 'modalOverlay',
  modal: 'modal',
  title: 'title',
  actions: 'actions',
  cancelButton: 'cancelButton',
  deleteButton: 'deleteButton',
}));

describe('DeleteEventModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal with confirmation message', () => {
    render(<DeleteEventModal {...defaultProps} />);
    
    expect(screen.getByText('Are you sure you want to delete this event??')).toBeInTheDocument();
  });

  test('renders Cancel and DELETE buttons', () => {
    render(<DeleteEventModal {...defaultProps} />);
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('DELETE')).toBeInTheDocument();
  });

  test('calls onCancel when Cancel button is clicked', () => {
    render(<DeleteEventModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  test('calls onConfirm when DELETE button is clicked', () => {
    render(<DeleteEventModal {...defaultProps} />);
    
    const deleteButton = screen.getByText('DELETE');
    fireEvent.click(deleteButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  test('applies correct CSS classes', () => {
    const { container } = render(<DeleteEventModal {...defaultProps} />);
    
    expect(container.querySelector('.modalOverlay')).toBeInTheDocument();
    expect(container.querySelector('.modal')).toBeInTheDocument();
    expect(container.querySelector('.title')).toBeInTheDocument();
    expect(container.querySelector('.actions')).toBeInTheDocument();
    expect(container.querySelector('.cancelButton')).toBeInTheDocument();
    expect(container.querySelector('.deleteButton')).toBeInTheDocument();
  });

  test('modal overlay covers entire screen', () => {
    const { container } = render(<DeleteEventModal {...defaultProps} />);
    
    const overlay = container.querySelector('.modalOverlay');
    expect(overlay).toBeInTheDocument();
  });

  test('prevents multiple rapid clicks on buttons', () => {
    render(<DeleteEventModal {...defaultProps} />);
    
    const deleteButton = screen.getByText('DELETE');
    
    // Simulate rapid clicks
    fireEvent.click(deleteButton);
    fireEvent.click(deleteButton);
    fireEvent.click(deleteButton);
    
    // Should only be called once per click
    expect(mockOnConfirm).toHaveBeenCalledTimes(3);
  });
});