/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PaymentSuccessPage from "../pages/payment-success"; // ← adjust path if needed

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockReload = jest.fn();

// Mock NextRouter completely
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    reload: mockReload,
    pathname: '/payment-success',
    route: '/payment-success',
    asPath: '/payment-success',
    query: {},
    isReady: true,
    isFallback: false,
    basePath: '',
    locale: undefined,
    locales: undefined,
    defaultLocale: undefined,
    isLocaleDomain: false,
    isPreview: false,
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    beforePopState: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Stub CSS modules and globals
jest.mock("../styles/Payment.module.css", () => ({
  container: 'container',
  mainContent: 'mainContent',
  card: 'card',
  iconContainer: 'iconContainer',
  failureMessage: 'failureMessage',
  buttonWrapper: 'buttonWrapper',
  actionButton: 'actionButton',
  icon: 'icon',
}));
jest.mock("~/styles/globals.css", () => ({}));

// Stub Navbar & Footer with display names
jest.mock("../components/Navbar", () => {
  const MockNavbar = () => <div data-testid="navbar" />;
  MockNavbar.displayName = 'Navbar';
  return MockNavbar;
});

jest.mock("../components/Footer", () => {
  const MockFooter = () => <div data-testid="footer" />;
  MockFooter.displayName = 'Footer';
  return MockFooter;
});

describe("PaymentSuccessPage (payment-success.tsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock router.push to return a resolved promise
    mockPush.mockReturnValue(Promise.resolve(true));
  });

  test("renders success message correctly", () => {
    render(<PaymentSuccessPage />);

    // Check that the "Payment Successful" heading is present
    expect(screen.getByText("Payment Successful")).toBeInTheDocument();

    // Check that the success message paragraph is present
    expect(screen.getByText("You can now view your order details or return to the homepage.")).toBeInTheDocument();

    // Check that the "Go to Homepage" button is present
    expect(screen.getByRole("button", { name: /Go to Homepage/i })).toBeInTheDocument();

    // Check that the success icon (SVG) is present
    const successIcon = document.querySelector('svg');
    expect(successIcon).toBeInTheDocument();
  });

  test("clicking Go to Homepage button calls router.push with correct path", () => {
    render(<PaymentSuccessPage />);

    const homeButton = screen.getByRole("button", { name: /Go to Homepage/i });
    fireEvent.click(homeButton);

    // Verify router.push was called with "/home"
    expect(mockPush).toHaveBeenCalledWith("/home");
  });

  test("renders navbar and footer components", () => {
    render(<PaymentSuccessPage />);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test("success icon has correct attributes", () => {
    render(<PaymentSuccessPage />);

    const successIcon = document.querySelector('svg');
    expect(successIcon).toBeInTheDocument();
    expect(successIcon).toHaveAttribute('width', '80');
    expect(successIcon).toHaveAttribute('height', '80');
    expect(successIcon).toHaveAttribute('viewBox', '0 0 24 24');
  });

  test("component renders with orderId prop without errors", () => {
    // Even though orderId isn't used, test that passing it doesn't break anything
    render(<PaymentSuccessPage orderId="TEST123" />);

    expect(screen.getByText("Payment Successful")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Go to Homepage/i })).toBeInTheDocument();
  });

  test("handleGoHome function is called on button click", () => {
    render(<PaymentSuccessPage />);

    const homeButton = screen.getByRole("button", { name: /Go to Homepage/i });
    
    // Before clicking, router.push should not have been called
    expect(mockPush).not.toHaveBeenCalled();
    
    // Click the button
    fireEvent.click(homeButton);
    
    // After clicking, router.push should have been called once
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/home");
  });

  test("success icon renders with correct styling", () => {
    render(<PaymentSuccessPage />);

    const successIcon = document.querySelector('svg');
    expect(successIcon).toBeInTheDocument();
    expect(successIcon).toHaveAttribute('stroke', 'currentColor');
    expect(successIcon).toHaveAttribute('stroke-width', '2');
    expect(successIcon).toHaveAttribute('fill', 'none');
  });

  test("success icon contains correct path elements", () => {
    render(<PaymentSuccessPage />);

    const circle = document.querySelector('circle');
    const polyline = document.querySelector('polyline');
    
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('cx', '12');
    expect(circle).toHaveAttribute('cy', '12');
    expect(circle).toHaveAttribute('r', '10');
    
    expect(polyline).toBeInTheDocument();
    expect(polyline).toHaveAttribute('points', '9 12 12 15 17 10');
  });
});