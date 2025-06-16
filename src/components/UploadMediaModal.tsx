import { useSession } from "next-auth/react";
import { UploadButton } from "~/utils/uploadthing";
import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";
import { useState, useRef } from "react";


declare global {
  interface Window {
    _startUpload?: () => void;
  }
}

interface UploadModalProps {
  readonly showUploadModal: boolean;
  readonly captionInput: string;
  readonly isUploading: boolean;
  readonly eventId: number;
  readonly onClose: () => void;
  readonly onCaptionChange: (caption: string) => void;
  readonly onUploadBegin: () => void;
  readonly onUploadComplete: () => void;
  readonly onUploadError: (error: Error) => void;
  readonly onRefetchMedia: () => void;
}

export default function UploadModal({
  showUploadModal,
  captionInput,
  isUploading,
  eventId,
  onClose,
  onCaptionChange,
  onUploadBegin,
  onUploadComplete,
  onUploadError,
  onRefetchMedia,
}: UploadModalProps) {
  const { data: session } = useSession();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const uploadPromiseResolve = useRef<((files: File[]) => void) | null>(null);

  if (!showUploadModal) return null;

  const handleCancel = () => {
    setSelectedFiles([]);
    setShowConfirmation(false);
    uploadPromiseResolve.current = null;
    onClose();
  };

  const handleUploadComplete = () => {
    setSelectedFiles([]);
    setShowConfirmation(false);
    uploadPromiseResolve.current = null;
    onUploadComplete();
    onRefetchMedia();
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setShowConfirmation(true);
  };
  const startUpload = (files: File[]) => {
    setShowConfirmation(false);
    if (uploadPromiseResolve.current) {
      uploadPromiseResolve.current(files);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.uploadModal}>
        <h3 className={styles.modalTitle}>Upload Media</h3>

        {/* Caption */}
        <input
          type="text"
          className={styles.captionInput}
          placeholder="Enter caption"
          value={captionInput}
          onChange={(e) => onCaptionChange(e.target.value)}
          disabled={isUploading}
        />

        {/* File picker (UploadButton) or Loading or Confirmation */}
        <div className={styles.fileInputWrapper}>
          {isUploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.uploadSpinner}></div>
              <p className={styles.uploadingText}>Uploading...</p>
            </div>
          ) : showConfirmation ? (
            <div className={styles.confirmationState}>
              <p className={styles.confirmationText}>
                Are you sure you want to upload: {selectedFiles.length}{" "}
                {selectedFiles.length === 1 ? "photo" : "photos"}?
              </p>
              <div className={styles.confirmationButtons}>
                <button
                  className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                  onClick={() => startUpload(selectedFiles)}
                >
                  Yes, upload
                </button>
                <button
                  className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                  onClick={() => {
                    setSelectedFiles([]);
                    setShowConfirmation(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <UploadButton
              endpoint="imageUploader"
              input={{
                username: session?.user?.name ?? "",
                eventId,
                caption: captionInput,
              }}              onBeforeUploadBegin={(files) => {
                handleFilesSelected(files);
                return new Promise((resolve) => {
                  uploadPromiseResolve.current = resolve;
                });
              }}
              onUploadBegin={onUploadBegin}
              onClientUploadComplete={handleUploadComplete}
              onUploadError={onUploadError}
              appearance={{
                button: {
                  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  width: "100%",
                  minHeight: "48px",
                  transition: "all 0.2s ease",
                },
                allowedContent: {
                  display: "none",
                },
              }}
              content={{
                button: "Choose Files",
                allowedContent: "",
              }}
            />
          )}
        </div>        {/* Actions */}
        {!showConfirmation && (
          <div className={styles.uploadActions}>
            <button
              className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
