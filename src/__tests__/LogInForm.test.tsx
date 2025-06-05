import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LogInForm from "~/components/ui/Account/LogInForm";
import { act } from "react";
import { signIn } from "next-auth/react";

// LoginForm.test.tsx
const mockPush = jest.fn();
const mockSignIn = jest.fn();

jest.mock("next-auth/react", () => ({
  // signIn: (...args: unknown[]) => mockSignIn(...args),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("LogInForm", () => {
  // beforeEach(() => {
  //   Object.defineProperty(document, "cookie", {
  //     writable: true,
  //     value: "",
  //   });
  // });

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

  // test("validates invalid email format", async () => {
  //   render(<LogInForm />);
  //   // In ALL submission tests, ensure both fields are filled:
  //   fireEvent.change(screen.getByLabelText(/email/i), {
  //     target: { value: "valid@email.com" }
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
  //     target: { value: "nonemptypassword" } // Add this in every test
  //   });
  //   fireEvent.click(screen.getByRole("button", { name: /log in/i }));
  //   expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument()
  // });

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
      "/password-forgot",
    );
  });

  test("navigates to signup page", () => {
    render(<LogInForm />);
    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    expect(signUpButton.closest("a")).toHaveAttribute("href", "/signup");
  });
});

describe("LogInForm extra behaviors", () => {
  // beforeEach(() => {
  //   Object.defineProperty(document, "cookie", {
  //     writable: true,
  //     value: "",
  //   });
  //   mockPush.mockReset();
  //   // mockMutate.mockReset();
  // });
  // test("redirects if auth cookie exists", () => {
  //   // Mock cookie directly in component mount
  //   Object.defineProperty(document, "cookie", {
  //     writable: true,
  //     value: "next-auth.session-token=validtoken",
  //   });
  //
  //   render(<LogInForm />);
  //   expect(mockPush).toHaveBeenCalledWith("/home");
  // });
  // test("successful login redirects to home", async () => {
  //   mockSignIn.mockResolvedValueOnce({ ok: true, error: null });
  //
  //   render(<LogInForm />);
  //
  //   fireEvent.change(screen.getByLabelText(/email/i), {
  //     target: { value: "user@example.com" }
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
  //     target: { value: "validpassword" },
  //   });
  //   fireEvent.click(screen.getByRole("button", { name: /log in/i }));
  //
  //   await waitFor(() => {
  //     expect(mockSignIn).toHaveBeenCalledWith("credentials", {
  //       email: "user@example.com",
  //       password: "validpassword",
  //       rememberMe: false,
  //       redirect: false,
  //     });
  //     expect(mockPush).toHaveBeenCalledWith("/home");
  //   });
  // });
  // test("handles 'User not found' error", async () => {
  //   render(<LogInForm />);
  //   fireEvent.change(screen.getByLabelText(/email/i), {
  //     target: { value: "user@example.com" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
  //     target: { value: "Password123" },
  //   });
  //
  //   fireEvent.click(screen.getByRole("button", { name: /log in/i }));
  //
  //
  //   await waitFor(() => expect(mockMutate).toHaveBeenCalled());
  //
  //   const firstCall = mockMutate.mock.calls[0] as [
  //     MutationVariables,
  //     OnSuccessCallback,
  //     OnErrorCallback
  //   ] | undefined;
  //
  //   if (!firstCall) throw new Error("mockMutate was not called");
  //
  //   const [, , onError] = firstCall;
  //   act(() => {
  //     onError({ message: "User not found" });
  //   });
  //
  //   const errorMessage = await screen.findByText(/user not found/i);
  //   expect(errorMessage).toBeInTheDocument();
  // });
  // test("displays invalid credentials error", async () => {
  //   mockSignIn.mockResolvedValueOnce({
  //     error: "CredentialsSignin",
  //     ok: false
  //   });
  //
  //   render(<LogInForm />);
  //
  //   // Fill valid form data
  //   fireEvent.change(screen.getByLabelText(/email/i), {
  //     target: { value: "user@example.com" }
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
  //     target: { value: "wrongpassword" }
  //   });
  //   fireEvent.click(screen.getByRole("button", { name: /log in/i }));
  //
  //   const errorMessage = await screen.findByText(/invalid email or password/i);
  //   expect(errorMessage).toBeInTheDocument();
  // });
  // test("handles server errors", async () => {
  //   mockSignIn.mockResolvedValueOnce({
  //     error: "ServerDown",
  //     ok: false
  //   });
  //
  //   render(<LogInForm />);
  //
  //   // Fill valid form data
  //   fireEvent.change(screen.getByLabelText(/email/i), {
  //     target: { value: "user@example.com" }
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
  //     target: { value: "validpassword" }
  //   });
  //   fireEvent.click(screen.getByRole("button", { name: /log in/i }));
  //
  //   const errorMessage = await screen.findByText(/unexpected error occurred/i);
  //   expect(errorMessage).toBeInTheDocument();
  // });
  // test("handles 'Passwords don't match' error", async () => {
  //   render(<LogInForm />);
  //   fireEvent.change(screen.getByLabelText(/email/i), {
  //     target: { value: "user@example.com" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
  //     target: { value: "Password123" },
  //   });
  //   fireEvent.click(screen.getByRole("button", { name: /log in/i }));
  //
  //   // await waitFor(() => expect(mockMutate).toHaveBeenCalled());
  //
  // //   const firstCall = mockMutate.mock.calls[0] as [
  // //     MutationVariables,
  // //     OnSuccessCallback,
  // //     OnErrorCallback
  // //   ] | undefined;
  // //
  // //   if (!firstCall) throw new Error("mockMutate was not called");
  // //
  // //   const [, , onError] = firstCall;
  // //   act(() => {
  // //     onError({ message: "Passwords don't match" });
  // //   });
  // //
  // //   expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
  // // });
  // //
  // // test("does not call mutate if form is invalid", () => {
  // //   render(<LogInForm />);
  // //   fireEvent.click(screen.getByRole("button", { name: /log in/i }));
  // //
  // //   expect(mockMutate).not.toHaveBeenCalled();
  // // });
  // // describe("LogInForm", () => {
  // //   beforeEach(() => {
  // //     (signIn as jest.Mock).mockReset();
  // //   });
  //
  //   test("submits form with valid credentials", async () => {
  //     const { getByLabelText, getByRole } = render(<LogInForm />);
  //
  //     fireEvent.change(getByLabelText(/email/i), { target: { value: "user@example.com" } });
  //     fireEvent.change(getByLabelText(/password/i), { target: { value: "password123" } });
  //     fireEvent.click(getByRole("button", { name: /log in/i }));
  //
  //     await waitFor(() => {
  //       expect(signIn).toHaveBeenCalledWith("credentials", {
  //         email: "user@example.com",
  //         password: "password123",
  //         rememberMe: false,
  //         redirect: false,
  //       });
  //     });
  //   });
  //
  //   test("handles signIn error", async () => {
  //     (signIn as jest.Mock).mockResolvedValueOnce({ error: "CredentialsSignIn" });
  //
  //     const { getByLabelText, getByRole, findByText } = render(<LogInForm />);
  //
  //     fireEvent.change(getByLabelText(/email/i), { target: { value: "user@example.com" } });
  //     fireEvent.change(getByLabelText(/password/i), { target: { value: "wrongpass" } });
  //     fireEvent.click(getByRole("button", { name: /log in/i }));
  //
  //     expect(await findByText(/invalid email or password/i)).toBeInTheDocument();
  //   });
  //
  //   test("redirects on successful login", async () => {
  //     (signIn as jest.Mock).mockResolvedValueOnce({ ok: true, error: null });
  //
  //     const { getByLabelText, getByRole } = render(<LogInForm />);
  //
  //     fireEvent.change(getByLabelText(/email/i), { target: { value: "user@example.com" } });
  //     fireEvent.change(getByLabelText(/password/i), { target: { value: "password123" } });
  //     fireEvent.click(getByRole("button", { name: /log in/i }));
  //
  //     await waitFor(() => {
  //       expect(mockPush).toHaveBeenCalledWith("/home");
  //     });
  //   });
  // });
});
