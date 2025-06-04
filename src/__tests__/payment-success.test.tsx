/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PaymentSuccessPage from "../pages/payment-success"; // ← adjust path if needed

// Stub CSS modules and globals
jest.mock("../styles/Payment.module.css", () => ({}));
jest.mock("../../styles/globals.css", () => ({}));

// Stub Navbar & Footer
jest.mock("../components/Navbar", () => () => <div data-testid="navbar" />);
jest.mock("../components/Footer", () => () => <div data-testid="footer" />);

describe("PaymentSuccessPage (payment-success.tsx)", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
  });

  test("renders success message with given orderId", () => {
    render(<PaymentSuccessPage orderId="ABC123" />);

    // 1) The <h2> with "Payment Successful" should be present:
    expect(screen.getByText("Payment Successful")).toBeInTheDocument();

    // 2) Find the <span> that contains "#ABC123":
    const orderSpan = screen.getByText("#ABC123");
    expect(orderSpan).toBeInTheDocument();

    // 3) Get its closest parent <p> and assert it contains the surrounding text:
    const parentParagraph = orderSpan.closest("p");
    expect(parentParagraph).toBeInTheDocument();
    // Check that the parent paragraph has "Your payment for order"
    expect(parentParagraph).toHaveTextContent(/Your payment for order/i);
    // And that it has "was processed successfully."
    expect(parentParagraph).toHaveTextContent(/was processed successfully\./i);

    // Finally, verify both buttons are present:
    expect(screen.getByRole("button", { name: /View Order/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Go to Homepage/i })
    ).toBeInTheDocument();
  });

  test("clicking buttons calls console.log with correct messages", () => {
    render(<PaymentSuccessPage orderId="XYZ789" />);

    const viewButton = screen.getByRole("button", { name: /View Order/i });
    const homeButton = screen.getByRole("button", { name: /Go to Homepage/i });

    fireEvent.click(viewButton);
    expect(console.log).toHaveBeenCalledWith("Navigating to order details...");

    fireEvent.click(homeButton);
    expect(console.log).toHaveBeenCalledWith("Navigating to homepage...");
  });
});
