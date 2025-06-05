import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UploadModal from "../components/UploadMediaModal";

interface UploadButtonProps {
  onUploadBegin?: () => void;
  onClientUploadComplete?: () => void;
  onUploadError?: (error: Error) => void;
}

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

import { useSession } from "next-auth/react";
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

jest.mock("~/utils/uploadthing", () => ({
  UploadButton: ({ onUploadBegin, onClientUploadComplete, onUploadError }: UploadButtonProps) => (
    <div data-testid="upload-button">
      <button
        data-testid="mock-upload-begin"
        onClick={() => onUploadBegin?.()}
      >
        Choose Image
      </button>
      <button
        data-testid="mock-upload-complete"
        onClick={() => onClientUploadComplete?.()}
      >
        Complete Upload
      </button>
      <button
        data-testid="mock-upload-error"
        onClick={() => onUploadError?.(new Error("Upload failed"))}
      >
        Trigger Error
      </button>
    </div>
  ),
}));

describe("UploadModal", () => {
  const defaultProps = {
    showUploadModal: true,
    captionInput: "",
    isUploading: false,
    eventId: 1,
    onClose: jest.fn(),
    onCaptionChange: jest.fn(),
    onUploadBegin: jest.fn(),
    onUploadComplete: jest.fn(),
    onUploadError: jest.fn(),
    onRefetchMedia: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: "1", name: "testuser", email: "test@example.com" }, expires: "2024-12-31T23:59:59.999Z" },
      status: "authenticated",
      update: jest.fn(),
    });
  });

  it("does not render when showUploadModal is false", () => {
    render(<UploadModal {...defaultProps} showUploadModal={false} />);
    
    expect(screen.queryByText("Upload Media")).not.toBeInTheDocument();
  });

  it("renders upload form when showUploadModal is true", () => {
    render(<UploadModal {...defaultProps} />);
    
    expect(screen.getByText("Upload Media")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter caption")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("shows uploading state when isUploading is true", () => {
    render(<UploadModal {...defaultProps} isUploading={true} />);
    
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
    expect(screen.queryByTestId("upload-button")).not.toBeInTheDocument();
  });

  it("shows upload button when not uploading", () => {
    render(<UploadModal {...defaultProps} isUploading={false} />);
    
    expect(screen.getByTestId("upload-button")).toBeInTheDocument();
    expect(screen.queryByText("Uploading...")).not.toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<UploadModal {...defaultProps} />);
    
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onCaptionChange when caption input changes", () => {
    render(<UploadModal {...defaultProps} />);
    
    const captionInput = screen.getByPlaceholderText("Enter caption");
    fireEvent.change(captionInput, { target: { value: "New caption" } });
    
    expect(defaultProps.onCaptionChange).toHaveBeenCalledWith("New caption");
  });

  it("disables cancel button when uploading", () => {
    render(<UploadModal {...defaultProps} isUploading={true} />);
    
    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeDisabled();
  });

  it("disables caption input when uploading", () => {
    render(<UploadModal {...defaultProps} isUploading={true} />);
    
    const captionInput = screen.getByPlaceholderText("Enter caption");
    expect(captionInput).toBeDisabled();
  });

  it("calls onUploadBegin when upload begins", () => {
    render(<UploadModal {...defaultProps} />);
    
    const uploadBeginButton = screen.getByTestId("mock-upload-begin");
    fireEvent.click(uploadBeginButton);
    
    expect(defaultProps.onUploadBegin).toHaveBeenCalled();
  });

  it("calls onUploadComplete and onRefetchMedia when upload completes", () => {
    render(<UploadModal {...defaultProps} />);
    
    const uploadCompleteButton = screen.getByTestId("mock-upload-complete");
    fireEvent.click(uploadCompleteButton);
    
    expect(defaultProps.onUploadComplete).toHaveBeenCalled();
    expect(defaultProps.onRefetchMedia).toHaveBeenCalled();
  });

  it("calls onUploadError when upload fails", () => {
    render(<UploadModal {...defaultProps} />);
    
    const uploadErrorButton = screen.getByTestId("mock-upload-error");
    fireEvent.click(uploadErrorButton);
    
    expect(defaultProps.onUploadError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("handles session without user name", () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "1", name: null, email: "test@example.com" }, expires: "2024-12-31T23:59:59.999Z" },
      status: "authenticated",
      update: jest.fn(),
    });

    render(<UploadModal {...defaultProps} />);
    
    expect(screen.getByText("Upload Media")).toBeInTheDocument();
  });

  it("handles no session data", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: jest.fn(),
    });

    render(<UploadModal {...defaultProps} />);
    
    expect(screen.getByText("Upload Media")).toBeInTheDocument();
  });

  it("renders with custom caption input value", () => {
    render(<UploadModal {...defaultProps} captionInput="Test caption" />);
    
    const captionInput = screen.getByDisplayValue("Test caption");
    expect(captionInput).toBeInTheDocument();
  });
});