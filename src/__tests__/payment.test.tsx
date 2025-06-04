/**
 * @jest-environment jsdom
 */

import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import * as nextRouter from "next/router"; // to import useRouter type
import PaymentPage from "../pages/payment"; // ← adjust if needed

// We’ll keep a mutable object that our mock useRouter returns.
// Individual tests can flip `isReady` or change `query`.
let mockRouter = {
  isReady: true,
  query: { articleid: "123" } as Record<string, string | undefined>,
};

// Provide a mock implementation for useRouter()
jest.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

// Stub NextAuth session
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "testuser" } },
    status: "authenticated",
  }),
}));

// Stub CSS modules and global CSS
jest.mock("../styles/Payment.module.css", () => ({}));
jest.mock("../../styles/globals.css", () => ({}));

// Stub Navbar & Footer
jest.mock("../components/Navbar", () => () => <div data-testid="navbar" />);
jest.mock("../components/Footer", () => () => <div data-testid="footer" />);

// Stub Next’s <Image> to render a plain <img>
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

describe("PaymentPage (payment.tsx)", () => {
  const detailsResponse = {
    itemName: "Fancy Cake",
    itemPrice: 200,
    alreadyContributed: 50,
    parentEventId: 42,
    eventName: "Birthday Bash",
    eventPlanner: "Alice",
    orderId: 999,
    imageUrl: "https://example.com/cake.png",
  };

  beforeEach(() => {
    // Reset mockRouter to default before each test:
    mockRouter = {
      isReady: true,
      query: { articleid: "123" },
    };

    // Mock global.fetch:
    (global as any).fetch = jest.fn((input: RequestInfo) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/api/stripe/details")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(detailsResponse),
        });
      }
      if (url.includes("/api/stripe/contribute")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ url: "https://checkout.example.com" }),
        });
      }
      return Promise.resolve({
        ok: false,
        text: () => Promise.resolve("Not Found"),
      });
    });

    // Allow tests to set window.location.href without errors:
    delete (window as any).location;
    (window as any).location = { href: "" };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders loading state initially when router.isReady is false", () => {
    // Override mockRouter for this test only:
    mockRouter.isReady = false;
    mockRouter.query = {};

    render(<PaymentPage />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  test("fetches details and displays them correctly", async () => {
    // Ensure router.isReady is true and query.articleid exists (default from beforeEach)
    render(<PaymentPage />);

    // Wait until "Order ID #999" appears
    await waitFor(() => {
      expect(screen.getByText("Order ID #999")).toBeInTheDocument();
    });

    // The <strong> labels are separate from the text, so we look for the raw values:
    expect(screen.getByText("Birthday Bash")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();

    expect(screen.getByText("Fancy Cake")).toBeInTheDocument();
    expect(screen.getByText(/\b200\s*RON\b/)).toBeInTheDocument();
    expect(screen.getByText(/\b50\s*RON\b/)).toBeInTheDocument();
    expect(screen.getByText(/\b150\s*RON\b/)).toBeInTheDocument();

    // Ensure the <img> src matches details.imageUrl
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/cake.png");

    // The input should have min="1" and max="150":
    const input = screen.getByPlaceholderText("Enter amount") as HTMLInputElement;
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "150");
  });

  test("prevents over‐contribution and initiates checkout when valid", async () => {
    render(<PaymentPage />);

    // Wait until details load
    await waitFor(() => {
      expect(screen.getByText("Order ID #999")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Enter amount") as HTMLInputElement;
    const button = screen.getByRole("button", { name: /CHECKOUT/i });

    // Spy on window.alert()
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    // 1) Enter 300 → should alert about max 150:
    fireEvent.change(input, { target: { value: "300" } });
    fireEvent.click(button);
    expect(alertSpy).toHaveBeenCalledWith("You can only contribute up to 150 RON.");

    alertSpy.mockReset();

    // 2) Enter valid 100 → should fetch contribute and redirect:
    fireEvent.change(input, { target: { value: "100" } });
    fireEvent.click(button);
    await waitFor(() => {
      expect((window as any).location.href).toBe("https://checkout.example.com");
    });

    alertSpy.mockRestore();
  });
});
