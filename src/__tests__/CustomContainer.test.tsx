import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomContainer from '~/components/ui/CustomContainer';

// Mock the CSS module
jest.mock('../../styles/CustomContainer.module.css', () => ({
  container: 'container',
}));

describe('CustomContainer', () => {
  test('renders children correctly', () => {
    render(
      <CustomContainer>
        <div>Test content</div>
      </CustomContainer>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('applies default container class', () => {
    const { container } = render(
      <CustomContainer>
        <div>Test content</div>
      </CustomContainer>
    );
    
    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveClass('container');
  });

  test('applies additional className when provided', () => {
    const { container } = render(
      <CustomContainer className="custom-class">
        <div>Test content</div>
      </CustomContainer>
    );
    
    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveClass('container');
    expect(containerDiv).toHaveClass('custom-class');
  });

  test('handles undefined className gracefully', () => {
    const { container } = render(
      <CustomContainer className={undefined}>
        <div>Test content</div>
      </CustomContainer>
    );
    
    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveClass('container');
    expect(containerDiv).not.toHaveClass('undefined');
  });

  test('handles empty string className', () => {
    const { container } = render(
      <CustomContainer className="">
        <div>Test content</div>
      </CustomContainer>
    );
    
    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveClass('container');
  });

  test('renders multiple children correctly', () => {
    render(
      <CustomContainer>
        <div>First child</div>
        <div>Second child</div>
        <span>Third child</span>
      </CustomContainer>
    );
    
    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
    expect(screen.getByText('Third child')).toBeInTheDocument();
  });

  test('handles complex children elements', () => {
    render(
      <CustomContainer className="wrapper">
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Click me</button>
        </div>
      </CustomContainer>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('has correct TypeScript interface', () => {
    // Test that the component accepts the correct props
    const TestComponent = () => (
      <CustomContainer className="test">
        <div>Valid children</div>
      </CustomContainer>
    );
    
    expect(() => render(<TestComponent />)).not.toThrow();
  });

  test('renders as a div element', () => {
    const { container } = render(
      <CustomContainer>
        <div>Content</div>
      </CustomContainer>
    );
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv.tagName).toBe('DIV');
  });
});