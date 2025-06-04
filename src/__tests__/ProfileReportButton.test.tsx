import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProfileButton from "../components/ui/UserProfile/ProfileReportButton";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("ProfileReportButton", () => {
  const defaultProps = {
    iconSrc: "/report-icon.svg",
    alt: "Report icon",
    children: "Report User",
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders button with icon and text when not loading", () => {
    render(<ProfileButton {...defaultProps} loading={false} />);
    
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Report User")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "/report-icon.svg");
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Report icon");
  });

  it("renders button without icon and text when loading", () => {
    render(<ProfileButton {...defaultProps} loading={true} />);
    
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    
    // When loading is true, icon and children should not be rendered (line 26)
    expect(screen.queryByText("Report User")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("calls onClick when button is clicked and not loading", () => {
    render(<ProfileButton {...defaultProps} loading={false} />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when button is disabled (loading)", () => {
    render(<ProfileButton {...defaultProps} loading={true} />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    // Button is disabled, so onClick should not be called
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it("applies correct CSS classes based on loading state", () => {
    const { rerender } = render(<ProfileButton {...defaultProps} loading={false} />);
    
    let button = screen.getByRole("button");
    expect(button).toHaveClass("button", "buttonDanger");
    expect(button).not.toHaveClass("loading");
    
    rerender(<ProfileButton {...defaultProps} loading={true} />);
    
    button = screen.getByRole("button");
    expect(button).toHaveClass("button", "buttonDanger", "loading");
  });
});