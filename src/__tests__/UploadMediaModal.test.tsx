import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UploadModal from "../components/UploadMediaModal";

interface UploadButtonProps {
  endpoint?: string;
  input?: any;
  onBeforeUploadBegin?: (files: File[]) => Promise<File[]>;
  onUploadBegin?: () => void;
  onClientUploadComplete?: () => void;
  onUploadError?: (error: Error) => void;
  appearance?: any;
  content?: any;
}

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

import { useSession } from "next-auth/react";
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// ÎMBUNĂTĂȚEȘTE MOCK-UL - să includă toate proprietățile
jest.mock("~/utils/uploadthing", () => ({
  UploadButton: ({ 
    onUploadBegin, 
    onClientUploadComplete, 
    onUploadError,
    onBeforeUploadBegin,
    endpoint,
    input
  }: UploadButtonProps) => (
    <div data-testid="upload-button">
      <span data-testid="endpoint">{endpoint}</span>
      <span data-testid="input-data">{JSON.stringify(input)}</span>
      <button
        data-testid="mock-file-select"
        onClick={async () => {
          const mockFiles = [
            new File(['mock content'], 'test.jpg', { type: 'image/jpeg' }),
            new File(['mock content 2'], 'test2.jpg', { type: 'image/jpeg' })
          ];
          if (onBeforeUploadBegin) {
            await onBeforeUploadBegin(mockFiles);
          }
        }}
      >
        Choose Files
      </button>
      <button
        data-testid="mock-upload-begin"
        onClick={() => onUploadBegin?.()}
      >
        Start Upload
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

  // ADAUGĂ ACEST TEST NOU - pentru file selection
  it("shows confirmation state when files are selected", async () => {
    render(<UploadModal {...defaultProps} />);
    
    const fileSelectButton = screen.getByTestId("mock-file-select");
    fireEvent.click(fileSelectButton);
    
    // Așteaptă ca starea să se actualizeze
    expect(await screen.findByText(/Are you sure you want to upload/)).toBeInTheDocument();
    expect(screen.getByText("Yes, upload")).toBeInTheDocument();
    expect(screen.getByText(/2 photos/)).toBeInTheDocument(); // 2 fișiere mock
  });

  // ADAUGĂ ACEST TEST NOU - pentru confirmarea upload-ului
  it("handles confirmation flow correctly", async () => {
    render(<UploadModal {...defaultProps} />);
    
    // Selectează fișiere
    const fileSelectButton = screen.getByTestId("mock-file-select");
    fireEvent.click(fileSelectButton);
    
    // Confirmă upload-ul
    const confirmButton = await screen.findByText("Yes, upload");
    fireEvent.click(confirmButton);
    
    // Ar trebui să ascundă confirmarea
    expect(screen.queryByText(/Are you sure you want to upload/)).not.toBeInTheDocument();
  });

  // ADAUGĂ ACEST TEST NOU - pentru anularea confirmării
  it("can cancel file confirmation", async () => {
    render(<UploadModal {...defaultProps} />);
    
    // Selectează fișiere
    const fileSelectButton = screen.getByTestId("mock-file-select");
    fireEvent.click(fileSelectButton);
    
    // Anulează
    const cancelButton = await screen.findByText("Cancel");
    fireEvent.click(cancelButton);
    
    // Ar trebui să se întoarcă la starea inițială
    expect(screen.queryByText(/Are you sure you want to upload/)).not.toBeInTheDocument();
    expect(screen.getByTestId("upload-button")).toBeInTheDocument();
  });

  // ADAUGĂ ACEST TEST NOU - pentru props-urile UploadButton
  it("passes correct props to UploadButton", () => {
    render(<UploadModal {...defaultProps} captionInput="Test caption" />);
    
    expect(screen.getByTestId("endpoint")).toHaveTextContent("imageUploader");
    
    const inputData = JSON.parse(screen.getByTestId("input-data").textContent ?? "{}");
    expect(inputData).toEqual({
      username: "testuser",
      eventId: 1,
      caption: "Test caption",
    });
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
  it("hides cancel button when uploading", () => {
    render(<UploadModal {...defaultProps} isUploading={true} />);
    
    // Cancel button should not be visible during upload
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    // Should show uploading state instead
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
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
    
    // Verifică că username-ul este string gol când name este null
    const inputData = JSON.parse(screen.getByTestId("input-data").textContent ?? "{}");
    expect(inputData.username).toBe("");
  });

  it("handles no session data", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: jest.fn(),
    });

    render(<UploadModal {...defaultProps} />);
    
    expect(screen.getByText("Upload Media")).toBeInTheDocument();
    
    // Verifică că username-ul este string gol când nu există sesiune
    const inputData = JSON.parse(screen.getByTestId("input-data").textContent ?? "{}");
    expect(inputData.username).toBe("");
  });

  it("renders with custom caption input value", () => {
    render(<UploadModal {...defaultProps} captionInput="Test caption" />);
    
    const captionInput = screen.getByDisplayValue("Test caption");
    expect(captionInput).toBeInTheDocument();
  });

  // ADAUGĂ ACEST TEST NOU - pentru resetarea stării la închidere
  it("resets state when modal is closed during confirmation", async () => {
    render(<UploadModal {...defaultProps} />);
    
    // Selectează fișiere
    const fileSelectButton = screen.getByTestId("mock-file-select");
    fireEvent.click(fileSelectButton);
    
    // Confirmă că suntem în starea de confirmare
    expect(await screen.findByText(/Are you sure you want to upload/)).toBeInTheDocument();
    
    // Închide modalul
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});