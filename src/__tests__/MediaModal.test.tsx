import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MediaModal from '../components/MediaModal';
import type { MediaHeader } from '~/models/MediaHeader';

// Mock CSS modules
jest.mock('../styles/EventView.module.css', () => ({
  editMediaModalWrapper: 'editMediaModalWrapper',
  editMediaModalContent: 'editMediaModalContent',
  editMediaHeader: 'editMediaHeader',
  editMediaGrid: 'editMediaGrid',
  editMediaItem: 'editMediaItem',
  image: 'image',
  caption: 'caption',
  editMediaActions: 'editMediaActions',
}));

jest.mock('../styles/Button.module.css', () => ({
  button: 'button',
  'button-secondary': 'button-secondary',
  'button-primary': 'button-primary',
}));

describe('MediaModal', () => {
  const mockOnUpload = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    isLoading: false,
    media: [],
    onUpload: mockOnUpload,
    onClose: mockOnClose,
  };

  const mockMedia: MediaHeader[] = [
    {
      id: 1,
      url: 'https://example.com/image1.jpg',
      caption: 'First image caption',
      uploaderUsername: 'user1',
      mediaType: 'image',
      fileType: 'jpg',
      fileSize: '1024',
      createdAt: new Date(),
    },
    {
      id: 2,
      url: 'https://example.com/image2.jpg',
      caption: 'Second image caption',
      uploaderUsername: 'user2',
      mediaType: 'image',
      fileType: 'jpg',
      fileSize: '2048',
      createdAt: new Date(),
    },
    {
      id: 3,
      url: 'https://example.com/image3.jpg',
      caption: 'Third image caption',
      uploaderUsername: 'user3',
      mediaType: 'image',
      fileType: 'jpg',
      fileSize: '1536',
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when isLoading is true', () => {
    render(<MediaModal {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('Loading ...')).toBeInTheDocument();
  });

  it('renders modal content when not loading', () => {
    render(<MediaModal {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: '← Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload Media' })).toBeInTheDocument();
  });

  it('renders "No media uploaded yet" when media array is empty', () => {
    render(<MediaModal {...defaultProps} />);
    
    expect(screen.getByText('No media uploaded yet.')).toBeInTheDocument();
  });

  it('renders media items when media array has items', () => {
    render(<MediaModal {...defaultProps} media={mockMedia} />);
    
    // Check that images are rendered
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    
    // Check specific images
    expect(screen.getByAltText('First image caption')).toBeInTheDocument();
    expect(screen.getByAltText('Second image caption')).toBeInTheDocument();
    expect(screen.getByAltText('Third image caption')).toBeInTheDocument();
  });

  it('renders captions when they exist', () => {
    render(<MediaModal {...defaultProps} media={mockMedia} />);
    
    expect(screen.getByText('First image caption')).toBeInTheDocument();
    expect(screen.getByText('Second image caption')).toBeInTheDocument();
    expect(screen.getByText('Third image caption')).toBeInTheDocument();
  });

  it('calls onClose when Back button is clicked', () => {
    render(<MediaModal {...defaultProps} />);
    
    const backButton = screen.getByRole('button', { name: '← Back' });
    fireEvent.click(backButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onUpload when Upload Media button is clicked', () => {
    render(<MediaModal {...defaultProps} />);
    
    const uploadButton = screen.getByRole('button', { name: 'Upload Media' });
    fireEvent.click(uploadButton);
    
    expect(mockOnUpload).toHaveBeenCalledTimes(1);
  });

  it('renders modal structure with correct elements', () => {
    render(<MediaModal {...defaultProps} media={mockMedia} />);
    
    // Check for main modal structure by testing for the expected content
    expect(screen.getByRole('button', { name: '← Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload Media' })).toBeInTheDocument();
    
    // Check that images are rendered when media is provided
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
  });

  it('applies correct CSS classes to buttons', () => {
    render(<MediaModal {...defaultProps} />);
    
    const backButton = screen.getByRole('button', { name: '← Back' });
    expect(backButton).toHaveClass('button', 'button-secondary');
    
    const uploadButton = screen.getByRole('button', { name: 'Upload Media' });
    expect(uploadButton).toHaveClass('button', 'button-primary');
  });

  it('renders images with correct attributes', () => {
    render(<MediaModal {...defaultProps} media={mockMedia} />);
    
    const firstImage = screen.getByAltText('First image caption');
    expect(firstImage).toHaveAttribute('src', 'https://example.com/image1.jpg');
    expect(firstImage).toHaveAttribute('width', '120');
    expect(firstImage).toHaveAttribute('height', '100');
  });

  it('handles empty caption properly', () => {
    const mediaWithEmptyCaption: MediaHeader[] = [
      {
        id: 1,
        url: 'https://example.com/image1.jpg',
        caption: '', // Empty caption
        uploaderUsername: 'user1',
        mediaType: 'image',
        fileType: 'jpg',
        fileSize: '1024',
        createdAt: new Date(),
      },
    ];

    render(<MediaModal {...defaultProps} media={mediaWithEmptyCaption} />);
    
    // When caption is empty, the image gets role="presentation" instead of "img"
    // So we need to find it differently
    const images = document.querySelectorAll('img');
    expect(images).toHaveLength(1);
    
    const image = images[0];
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
    expect(image).toHaveAttribute('alt', '');
  });

  it('renders media items in grid structure', () => {
    render(<MediaModal {...defaultProps} media={mockMedia} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    
    // Instead of looking for CSS classes, verify that all images are rendered
    images.forEach(img => {
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src');
      expect(img).toHaveAttribute('width', '120');
      expect(img).toHaveAttribute('height', '100');
    });
  });

  it('renders caption text below images', () => {
    render(<MediaModal {...defaultProps} media={mockMedia} />);
    
    // Check that captions are rendered as text content
    expect(screen.getByText('First image caption')).toBeInTheDocument();
    expect(screen.getByText('Second image caption')).toBeInTheDocument();
    expect(screen.getByText('Third image caption')).toBeInTheDocument();
  });

  it('handles loading state properly', () => {
    const { rerender } = render(<MediaModal {...defaultProps} isLoading={true} />);
    
    // Should show loading text
    expect(screen.getByText('Loading ...')).toBeInTheDocument();
    
    // Should not show modal content
    expect(screen.queryByRole('button', { name: '← Back' })).not.toBeInTheDocument();
    
    // Switch to loaded state
    rerender(<MediaModal {...defaultProps} isLoading={false} />);
    
    // Should show modal content
    expect(screen.getByRole('button', { name: '← Back' })).toBeInTheDocument();
    expect(screen.queryByText('Loading ...')).not.toBeInTheDocument();
  });

  it('displays different content for empty and populated media arrays', () => {
    const { rerender } = render(<MediaModal {...defaultProps} media={[]} />);
    
    // Should show "No media uploaded yet" when empty
    expect(screen.getByText('No media uploaded yet.')).toBeInTheDocument();
    
    // Switch to populated media
    rerender(<MediaModal {...defaultProps} media={mockMedia} />);
    
    // Should show images instead
    expect(screen.queryByText('No media uploaded yet.')).not.toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });
});