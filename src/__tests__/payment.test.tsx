import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PaymentPage from "../pages/payment"; // ← adjust if needed

// Define proper types for mock router
interface MockRouter {
  isReady: boolean;
  query: Record<string, string | undefined>;
  push: jest.Mock;
  replace: jest.Mock;
  back: jest.Mock;
  pathname: string;
  route: string;
  asPath: string;
  isFallback: boolean;
  basePath: string;
  locale?: string;
  locales?: string[];
  defaultLocale?: string;
  isLocaleDomain: boolean;
  isPreview: boolean;
  events: {
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
  };
  beforePopState: jest.Mock;
  prefetch: jest.Mock;
  reload: jest.Mock;
}

// We'll keep a mutable object that our mock useRouter returns.
// Individual tests can flip `isReady` or change `query`.
let mockRouter: MockRouter = {
  isReady: true,
  query: { articleid: "123" },
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  pathname: "/payment",
  route: "/payment",
  asPath: "/payment",
  isFallback: false,
  basePath: "",
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
  reload: jest.fn(),
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

// Stub Navbar & Footer with proper display names
jest.mock("../components/Navbar", () => {
  const MockNavbar = () => <div data-testid="navbar" />;
  MockNavbar.displayName = "MockNavbar";
  return MockNavbar;
});

jest.mock("../components/Footer", () => {
  const MockFooter = () => <div data-testid="footer" />;
  MockFooter.displayName = "MockFooter";
  return MockFooter;
});

// Define proper types for Next Image props
interface NextImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  placeholder?: string;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  loader?: (args: { src: string; width: number; quality?: number }) => string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: "lazy" | "eager";
  blurDataURL?: string;
}

// Stub Next's <Image> to render a plain <img> with proper types
jest.mock("next/image", () => {
  const MockNextImage = (props: NextImageProps) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt} />
  );
  MockNextImage.displayName = "MockNextImage";

  return {
    __esModule: true,
    default: MockNextImage,
  };
});

// Define types for API responses
interface DetailsResponse {
  itemName: string;
  itemPrice: number;
  alreadyContributed: number;
  parentEventId: number;
  eventName: string;
  eventPlanner: string;
  orderId: number;
  imageUrl: string;
}

// Mock window location with proper typing
interface MockLocation {
  href: string;
}

describe("PaymentPage (payment.tsx)", () => {
  const detailsResponse: DetailsResponse = {
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
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      pathname: "/payment",
      route: "/payment",
      asPath: "/payment",
      isFallback: false,
      basePath: "",
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
      reload: jest.fn(),
    };

    // Mock global.fetch with proper typing:
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.includes("/api/stripe/details")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          redirected: false,
          type: "basic" as ResponseType,
          url: url,
          clone: jest.fn(),
          body: null,
          bodyUsed: false,
          arrayBuffer: jest.fn(),
          blob: jest.fn(),
          formData: jest.fn(),
          text: jest.fn(),
          json: () => Promise.resolve(detailsResponse),
        });
      }

      if (url.includes("/api/stripe/contribute")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          redirected: false,
          type: "basic" as ResponseType,
          url: url,
          clone: jest.fn(),
          body: null,
          bodyUsed: false,
          arrayBuffer: jest.fn(),
          blob: jest.fn(),
          formData: jest.fn(),
          text: jest.fn(),
          json: () => Promise.resolve({ url: "https://checkout.example.com" }),
        });
      }

      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers(),
        redirected: false,
        type: "basic" as ResponseType,
        url: url,
        clone: jest.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        json: jest.fn(),
        text: () => Promise.resolve("Not Found"),
      });
    });

    // Allow tests to set window.location.href without errors:
    delete (window as Record<string, unknown>).location;
    (window as Record<string, unknown>).location = { href: "" };
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
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/cake.png");

    // The input should have min="1" and max="150":
    const input = screen.getByPlaceholderText("Enter amount");
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "150");
  });

  test("prevents over‐contribution and initiates checkout when valid", async () => {
    render(<PaymentPage />);

    // Wait until details load
    await waitFor(() => {
      expect(screen.getByText("Order ID #999")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Enter amount");
    const button = screen.getByRole("button", { name: /CHECKOUT/i });

    // Spy on window.alert()
    const alertSpy = jest
      .spyOn(window, "alert")
      .mockImplementation(() => undefined);

    // 1) Enter 300 → should alert about max 150:
    fireEvent.change(input, { target: { value: "300" } });
    fireEvent.click(button);
    expect(alertSpy).toHaveBeenCalledWith(
      "You can only contribute up to 150 RON.",
    );

    alertSpy.mockReset();

    // 2) Enter valid 100 → should fetch contribute and redirect:
    fireEvent.change(input, { target: { value: "100" } });
    fireEvent.click(button);
    await waitFor(() => {
      expect((window as Record<string, unknown>).location.href).toBe(
        "https://checkout.example.com",
      );
    });

    alertSpy.mockRestore();
  });
});
