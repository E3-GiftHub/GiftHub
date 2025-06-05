import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ResetPasswordFormLogged from "~/components/ui/Account/ResetPasswordFormLogged";
import { api } from "~/trpc/react";
import { resetPasswordMessages } from "~/models/messages";
import { jest } from "@jest/globals";

const mockPush = jest.fn();

jest.mock("next/router", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock useSession so that session.data.user.name is always "testuser"
jest.mock("next-auth/react", () => ({
    useSession: () => ({
        data: { user: { name: "testuser" } },
        status: "authenticated",
    }),
}));

type FormData = {
    username: string;
    pass: string;
    word: string;
};

type OnSuccessCallback = () => void;
type OnErrorCallback = (error: { message: string }) => void;

// Intercept all mutate calls here
const mutateMock = jest.fn() as jest.MockedFunction<
    (data: FormData, onSuccess: OnSuccessCallback, onError: OnErrorCallback) => void
>;

jest.mock("~/trpc/react", () => ({
    api: {
        auth: {
            update: {
                updateLogged: {
                    useMutation: jest.fn(
                        ({
                             onSuccess,
                             onError,
                         }: {
                            onSuccess: OnSuccessCallback;
                            onError: OnErrorCallback;
                        }) => ({
                            mutate: (data: FormData) => mutateMock(data, onSuccess, onError),
                            isPending: false,
                            error: null,
                        })
                    ),
                },
            },
        },
    },
}));

describe("ResetPasswordFormLogged", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPush.mockClear();
    });

    test("renders heading, password fields, and reset button", () => {
        render(<ResetPasswordFormLogged />);

        // The <h2> is "Reset password"
        expect(
            screen.getByRole("heading", { name: /reset password/i })
        ).toBeInTheDocument();

        // Two inputs have these unique placeholder texts
        expect(
            screen.getByPlaceholderText(/enter your new password/i)
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/confirm your new password/i)
        ).toBeInTheDocument();

        // The button text is exactly "Reset password"
        expect(
            screen.getByRole("button", { name: /^reset password$/i })
        ).toBeInTheDocument();
    });

    test("validates empty fields on submit (two 'required' alerts)", async () => {
        const { container } = render(<ResetPasswordFormLogged />);
        const form = container.querySelector('form#resetPassword');
        expect(form).toBeInTheDocument(); // sanity check

        // Submit the form without any input
        fireEvent.submit(form!);

        // Both password and confirm‐password are empty, so we expect exactly two role="alert" elements.
        const alerts = await screen.findAllByRole("alert");
        expect(alerts).toHaveLength(2);

        // Both alerts should contain the "Password is required" message
        const texts = alerts.map((alertElem) => alertElem.textContent);
        expect(texts).toEqual([
            resetPasswordMessages.passwordRequired,
            resetPasswordMessages.passwordRequired,
        ]);
    });

    test("validates short password and missing confirm-password (minLength + required)", async () => {
        const { container } = render(<ResetPasswordFormLogged />);
        const form = container.querySelector('form#resetPassword');
        expect(form).toBeInTheDocument();

        // Type a too-short password
        fireEvent.change(
            screen.getByPlaceholderText(/enter your new password/i),
            { target: { value: "short" } }
        );
        // Leave confirm-password empty
        fireEvent.change(
            screen.getByPlaceholderText(/confirm your new password/i),
            { target: { value: "" } }
        );

        // Submit the form
        fireEvent.submit(form!);

        // We expect two alerts:
        //  1) "Password must be at least 8 characters"
        //  2) "Password is required" for the empty confirm‐password
        const alerts = await screen.findAllByRole("alert");
        expect(alerts).toHaveLength(2);

        const contents = alerts.map((el) => el.textContent);
        expect(contents).toContain(resetPasswordMessages.passwordMinLength);
        expect(contents).toContain(resetPasswordMessages.passwordRequired);
    });

    test("validates password mismatch (client-side)", async () => {
        const { container } = render(<ResetPasswordFormLogged />);
        const form = container.querySelector('form#resetPassword');
        expect(form).toBeInTheDocument();

        // Enter two different passwords
        fireEvent.change(
            screen.getByPlaceholderText(/enter your new password/i),
            { target: { value: "Password1" } }
        );
        fireEvent.change(
            screen.getByPlaceholderText(/confirm your new password/i),
            { target: { value: "Different1" } }
        );

        // Submit
        fireEvent.submit(form!);

        // Only one alert should appear, containing the mismatch message
        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent(resetPasswordMessages.passwordMismatch);
    });

    test("submits form with valid inputs", async () => {
        const { container } = render(<ResetPasswordFormLogged />);
        const form = container.querySelector('form#resetPassword');
        expect(form).toBeInTheDocument();

        const pwd = "Password1";
        fireEvent.change(
            screen.getByPlaceholderText(/enter your new password/i),
            { target: { value: pwd } }
        );
        fireEvent.change(
            screen.getByPlaceholderText(/confirm your new password/i),
            { target: { value: pwd } }
        );

        // Submit
        fireEvent.submit(form!);

        // Now expect mutateMock to have been called with the correct arguments
        await waitFor(() => {
            expect(mutateMock).toHaveBeenCalledWith(
                { username: "testuser", pass: pwd, word: pwd },
                expect.any(Function), // onSuccess
                expect.any(Function)  // onError
            );
        });
    });

    test("handles mutation onSuccess: shows message and redirects", async () => {
        jest.useFakeTimers();
        const { container } = render(<ResetPasswordFormLogged />);
        const form = container.querySelector('form#resetPassword');
        expect(form).toBeInTheDocument();

        const pwd = "Password1";
        fireEvent.change(
            screen.getByPlaceholderText(/enter your new password/i),
            { target: { value: pwd } }
        );
        fireEvent.change(
            screen.getByPlaceholderText(/confirm your new password/i),
            { target: { value: pwd } }
        );

        // Submit
        fireEvent.submit(form!);

        // Extract and call onSuccess from the first call to mutateMock
        await waitFor(() => {
            const call = mutateMock.mock.calls[0];
            if (!call) throw new Error("mutateMock was not called");
            const [, onSuccess] = call;
            onSuccess();
        });

        // Wait for the success message to appear
        expect(
            await screen.findByText(/your password has been successfully reset!/i)
        ).toBeInTheDocument();

        // Advance timers to trigger the redirect
        jest.advanceTimersByTime(3000);
        expect(mockPush).toHaveBeenCalledWith("/login");
        jest.useRealTimers();
    });

    test("handles mutation onError 'Passwords don't match' (server-side)", async () => {
        const { container } = render(<ResetPasswordFormLogged />);
        const form = container.querySelector('form#resetPassword');
        expect(form).toBeInTheDocument();

        // Fill both fields with the same password so client-side validation passes
        const pwd = "Password1";
        fireEvent.change(
            screen.getByPlaceholderText(/enter your new password/i),
            { target: { value: pwd } }
        );
        fireEvent.change(
            screen.getByPlaceholderText(/confirm your new password/i),
            { target: { value: pwd } }
        );

        // Submit
        fireEvent.submit(form!);

        // Now simulate server‐side error: "Passwords don't match"
        await waitFor(() => {
            const call = mutateMock.mock.calls[0];
            if (!call) throw new Error("mutateMock was not called");
            const [, , onError] = call;
            onError({ message: "Passwords don't match" });
        });

        // Exactly one alert should show up with the mismatch message
        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent(resetPasswordMessages.passwordMismatch);
    });

    test("handles mutation onError 'Invalid or expired password reset link'", async () => {
        const { container } = render(<ResetPasswordFormLogged />);
        const form = container.querySelector('form#resetPassword');
        expect(form).toBeInTheDocument();

        // Make both fields match so client-side validations pass
        const pwd = "Password1";
        fireEvent.change(
            screen.getByPlaceholderText(/enter your new password/i),
            { target: { value: pwd } }
        );
        fireEvent.change(
            screen.getByPlaceholderText(/confirm your new password/i),
            { target: { value: pwd } }
        );

        // Submit
        fireEvent.submit(form!);

        // Simulate server‐side error "Invalid or expired password reset link"
        await waitFor(() => {
            const call = mutateMock.mock.calls[0];
            if (!call) throw new Error("mutateMock was not called");
            const [, , onError] = call;
            onError({ message: "Invalid or expired password reset link" });
        });

        // That message is rendered inside a <p>, so use findByText:
        expect(
            await screen.findByText(/invalid or expired password reset link/i)
        ).toBeInTheDocument();
    });

    test("handles mutation onError unknown error", async () => {
        const { container } = render(<ResetPasswordFormLogged />);
        const form = container.querySelector('form#resetPassword');
        expect(form).toBeInTheDocument();

        // Make both fields match
        const pwd = "Password1";
        fireEvent.change(
            screen.getByPlaceholderText(/enter your new password/i),
            { target: { value: pwd } }
        );
        fireEvent.change(
            screen.getByPlaceholderText(/confirm your new password/i),
            { target: { value: pwd } }
        );

        // Submit
        fireEvent.submit(form!);

        // Simulate a generic server error
        await waitFor(() => {
            const call = mutateMock.mock.calls[0];
            if (!call) throw new Error("mutateMock was not called");
            const [, , onError] = call;
            onError({ message: "Some unexpected error" });
        });

        // That serverError is also rendered in a <p>
        expect(
            await screen.findByText(resetPasswordMessages.serverError)
        ).toBeInTheDocument();
    });

    test("toggles password visibility", () => {
        render(<ResetPasswordFormLogged />);

        const passwordInput = screen.getByPlaceholderText(
            /enter your new password/i
        );
        const toggleButtons = screen.getAllByRole("button", {
            name: /show password|hide password/i,
        });

        // First toggle button toggles the "Password" field
        expect(passwordInput).toHaveAttribute("type", "password");
        fireEvent.click(toggleButtons[0]!);
        expect(passwordInput).toHaveAttribute("type", "text");
        fireEvent.click(toggleButtons[0]!);
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("toggles confirm password visibility", () => {
        render(<ResetPasswordFormLogged />);

        const confirmPasswordInput = screen.getByPlaceholderText(
            /confirm your new password/i
        );
        const toggleButtons = screen.getAllByRole("button", {
            name: /show password|hide password/i,
        });

        // Second toggle button toggles the "Confirm Password" field
        expect(confirmPasswordInput).toHaveAttribute("type", "password");
        fireEvent.click(toggleButtons[1]!);
        expect(confirmPasswordInput).toHaveAttribute("type", "text");
        fireEvent.click(toggleButtons[1]!);
        expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });

    test("submit button shows 'Resetting...' when isPending is true", () => {
        const mockedUseMutation = api.auth.update.updateLogged.useMutation as jest.Mock;

        mockedUseMutation.mockReturnValue({
            mutate: mutateMock,
            isPending: true,
            error: null,
        });

        render(<ResetPasswordFormLogged />);
        // When isPending === true, the button text becomes "Resetting..."
        expect(
            screen.getByRole("button", { name: /resetting\.\.\./i })
        ).toBeInTheDocument();
    });
});
