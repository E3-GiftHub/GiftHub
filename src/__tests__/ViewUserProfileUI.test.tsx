import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ViewUserProfileUI from "~/components/ui/UserProfile/ViewUserProfileUI";
import { mockUser } from "~/components/ui/UserProfile/mockUser";

// Mock next/image if used internally
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} />;
  },
}));

describe("ViewUserProfileUI", () => {
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
    expect(screen.getByRole("img", { name: /user avatar/i })).toHaveAttribute(
      "src",
      mockUser.pictureUrl,
    );
    expect(screen.getByText(/report account/i)).toBeInTheDocument();
  });

  it("opens report modal when Report account button is clicked", () => {
    renderComponent();
    fireEvent.click(screen.getByText(/report account/i));
    expect(screen.getByText(/report user/i)).toBeInTheDocument();
  });

  it("closes report modal when pressing Enter on overlay", async () => {
    renderComponent();
    fireEvent.click(screen.getByText(/report account/i));

    const overlay = screen.getByRole("button", { name: /close modal/i });
    fireEvent.keyDown(overlay, { key: "Enter", code: "Enter" });

    await waitFor(() =>
      expect(screen.queryByText(/report user/i)).not.toBeInTheDocument(),
    );
  });

  describe("Report Modal Submission", () => {
    beforeEach(() => {
      renderComponent();
      fireEvent.click(screen.getByText(/report account/i));
    });

    it("requires a reason before submission", () => {
      fireEvent.click(screen.getByText(/submit report/i));
      expect(screen.getByText(/report user/i)).toBeInTheDocument();
      expect(onReportMock).not.toHaveBeenCalled();
    });

    it('requires description if "Other" is selected', () => {
      fireEvent.change(screen.getByLabelText(/reason/i), {
        target: { value: "Other" },
      });
      fireEvent.click(screen.getByText(/submit report/i));
      expect(screen.getByText(/report user/i)).toBeInTheDocument();
      expect(onReportMock).not.toHaveBeenCalled();
    });

    it("submits when a valid reason is selected", async () => {
      fireEvent.change(screen.getByLabelText(/reason/i), {
        target: { value: "Spam" },
      });
      fireEvent.click(screen.getByText(/submit report/i));

      expect(
        await screen.findByText(/thank you for your report/i),
      ).toBeInTheDocument();

      expect(onReportMock).toHaveBeenCalledWith(
        "mock-reporter",
        mockUser.username,
        "Spam",
        "",
      );
    });

    it('submits with "Other" and custom description', async () => {
      fireEvent.change(screen.getByLabelText(/reason/i), {
        target: { value: "Other" },
      });
      fireEvent.change(screen.getByLabelText(/please specify/i), {
        target: { value: "This is a test reason" },
      });
      fireEvent.click(screen.getByText(/submit report/i));

      expect(
        await screen.findByText(/thank you for your report/i),
      ).toBeInTheDocument();

      expect(onReportMock).toHaveBeenCalledWith(
        "mock-reporter",
        mockUser.username,
        "Other",
        "This is a test reason",
      );
    });

    it("closes modal after successful submission and clicking Close", async () => {
      fireEvent.change(screen.getByLabelText(/reason/i), {
        target: { value: "Harassment" },
      });
      fireEvent.click(screen.getByText(/submit report/i));

      const closeButton = await screen.findByText(/close/i);
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/thank you for your report/i),
        ).not.toBeInTheDocument();
      });
    });
  });
});
