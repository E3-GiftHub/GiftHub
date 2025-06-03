// ViewUserProfileUI.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ViewUserProfileUI from "~/components/ui/UserProfile/ViewUserProfileUI";
import { mockUser } from "~/components/ui/UserProfile/mockUser";

// Mock next/image (in case it's used internally)
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("ViewUserProfileUI Component", () => {
  const onReportMock = jest.fn();

  const renderComponent = (reporter: string | null = "mock-reporter") =>
    render(
      <ViewUserProfileUI
        reporter={reporter}
        profile={mockUser}
        onReport={onReportMock}
      />,
    );

  beforeEach(() => {
    onReportMock.mockClear();
  });

  it("renders user profile correctly", () => {
    renderComponent();

    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    expect(screen.getByText(mockUser.fname)).toBeInTheDocument();
    expect(screen.getByText(mockUser.lname)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "User avatar" })).toHaveAttribute(
      "src",
      mockUser.pictureUrl,
    );
    expect(screen.getByText("Report account")).toBeInTheDocument();
  });

  it("opens report modal when report button is clicked", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Report account"));
    expect(screen.getByText("Report User")).toBeInTheDocument();
  });

  it("closes report modal when clicking overlay", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Report account"));

    // simulate pressing Enter on overlay
    const overlay = screen.getByRole("button", { name: "Close modal" });
    fireEvent.keyDown(overlay, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.queryByText("Report User")).not.toBeInTheDocument();
    });
  });

  describe("Report Modal Functionality", () => {
    beforeEach(() => {
      renderComponent();
      fireEvent.click(screen.getByText("Report account"));
    });

    it("requires selection of a reason", () => {
      fireEvent.click(screen.getByText("Submit Report"));
      expect(screen.getByText("Report User")).toBeInTheDocument(); // Still open
    });

    it('requires description for "Other" reason', () => {
      fireEvent.change(screen.getByLabelText("Reason"), {
        target: { value: "Other" },
      });
      fireEvent.click(screen.getByText("Submit Report"));
      expect(screen.getByText("Report User")).toBeInTheDocument(); // Still open
    });

    it("submits successfully with valid reason", () => {
      fireEvent.change(screen.getByLabelText("Reason"), {
        target: { value: "Spam" },
      });
      fireEvent.click(screen.getByText("Submit Report"));

      expect(
        screen.getByText(/Thank you for your report!/i),
      ).toBeInTheDocument();
      expect(onReportMock).toHaveBeenCalledWith(
        "mock-reporter",
        mockUser.username,
        "Spam",
        "",
      );
    });

    it('submits successfully with "Other" reason and description', () => {
      fireEvent.change(screen.getByLabelText("Reason"), {
        target: { value: "Other" },
      });
      fireEvent.change(screen.getByLabelText("Please specify the reason."), {
        target: { value: "Test description" },
      });
      fireEvent.click(screen.getByText("Submit Report"));

      expect(
        screen.getByText(/Thank you for your report!/i),
      ).toBeInTheDocument();
      expect(onReportMock).toHaveBeenCalledWith(
        "mock-reporter",
        mockUser.username,
        "Other",
        "Test description",
      );
    });

    it("closes modal after successful submission and clicking Close", async () => {
      fireEvent.change(screen.getByLabelText("Reason"), {
        target: { value: "Harassment" },
      });
      fireEvent.click(screen.getByText("Submit Report"));
      fireEvent.click(screen.getByText("Close"));

      await waitFor(() => {
        expect(
          screen.queryByText(/Thank you for your report!/i),
        ).not.toBeInTheDocument();
      });
    });
  });
});
