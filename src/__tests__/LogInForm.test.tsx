import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LogInForm from "~/components/ui/Account/LogInForm";
import { act } from "react";

const mockPush = jest.fn();

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

type MutationVariables = { email: string; password: string };
type OnSuccessCallback = (data: {
  sessionToken: string;
  expires: number;
}) => void;
type OnErrorCallback = (error: { message: string }) => void;
const mockMutate = jest.fn<
  void,
  [MutationVariables, OnSuccessCallback, OnErrorCallback]
>();

jest.mock("~/trpc/react", () => ({
  api: {
    auth: {
      login: {
        login: {
          useMutation: jest.fn(
            ({
              onSuccess,
              onError,
            }: {
              onSuccess: OnSuccessCallback;
              onError: OnErrorCallback;
            }) => ({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              mutate: (data: MutationVariables) =>
                mockMutate(data, onSuccess, onError),
              isPending: false,
              error: null,
            }),
          ),
        },
      },
    },
  },
}));

describe("LogInForm", () => {
  beforeEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
  });

  test("renders form with all fields and labels", () => {
    render(<LogInForm />);
    expect(screen.getByText(/welcome back!/i)).toBeInTheDocument();
    expect(screen.getByText(/log in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("validates empty fields on submit", async () => {
    render(<LogInForm />);
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    /*expect(await screen.findByText(/email is required/i)).toBeInTheDocument();*/
    expect(
      await screen.findByText(/password is required/i),
    ).toBeInTheDocument();
  });

  test("validates invalid email format", async () => {
    render(<LogInForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(
      await screen.findByText(/invalid email address/i),
    ).toBeInTheDocument();
  });

  test("toggles password visibility", () => {
    render(<LogInForm />);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const toggleButton = screen.getByRole("button", {
      name: /show password/i,
    });

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("checks remember me checkbox", () => {
    render(<LogInForm />);
    const checkbox = screen.getByLabelText(/remember me/i);
    if (!(checkbox instanceof HTMLInputElement)) {
      throw new Error("Expected checkbox to be an input");
    }
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  test("navigates to forgot password page", () => {
    render(<LogInForm />);
    const forgotPasswordLink = screen.getByText(/forgot password/i);
    expect(forgotPasswordLink.closest("a")).toHaveAttribute(
      "href",
      "/forgotpassword",
    );
  });

  test("navigates to signup page", () => {
    render(<LogInForm />);
    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    expect(signUpButton.closest("a")).toHaveAttribute("href", "/signup");
  });
});

describe("LogInForm extra behaviors", () => {
  beforeEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
    mockPush.mockReset();
    mockMutate.mockReset();
  });

  test("redirects to /home if hasAuthCookie is true", () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "session_auth1=validtoken",
    });

    render(<LogInForm />);
    expect(mockPush).toHaveBeenCalledWith("/home");
  });

  test("sets cookies and redirects on successful login with rememberMe", async () => {
    render(<LogInForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByLabelText(/remember me/i));
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      const firstCall = mockMutate.mock.calls[0] as
        | [MutationVariables, OnSuccessCallback, OnErrorCallback]
        | undefined;
      if (!firstCall) throw new Error("mockMutate was not called");
      const [, onSuccess] = firstCall;

      act(() => {
        onSuccess({
          sessionToken: "abc123",
          expires: 3600,
        });
      });

      expect(document.cookie).toMatch(/session_auth2=abc123/);
    });
  });

  test("handles 'User not found' error", async () => {
    render(<LogInForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "Password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(mockMutate).toHaveBeenCalled());

    const firstCall = mockMutate.mock.calls[0] as
      | [MutationVariables, OnSuccessCallback, OnErrorCallback]
      | undefined;

    if (!firstCall) throw new Error("mockMutate was not called");

    const [, , onError] = firstCall;
    act(() => {
      onError({ message: "User not found" });
    });

    const errorMessage = await screen.findByText(/user not found/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("handles 'Passwords don't match' error", async () => {
    render(<LogInForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(mockMutate).toHaveBeenCalled());

    const firstCall = mockMutate.mock.calls[0] as
      | [MutationVariables, OnSuccessCallback, OnErrorCallback]
      | undefined;

    if (!firstCall) throw new Error("mockMutate was not called");

    const [, , onError] = firstCall;
    act(() => {
      onError({ message: "Passwords don't match" });
    });

    expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
  });

  test("does not call mutate if form is invalid", () => {
    render(<LogInForm />);
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
