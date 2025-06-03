import { useSession } from "next-auth/react";
import { UploadButton } from "~/utils/uploadthing";
import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";

interface UploadModalProps {
  showUploadModal: boolean;
  captionInput: string;
  isUploading: boolean;
  eventId: number;
  onClose: () => void;
  onCaptionChange: (caption: string) => void;
  onUploadBegin: () => void;
  onUploadComplete: () => void;
  onUploadError: (error: Error) => void;
  onRefetchMedia: () => void; // Add this new prop
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
  onRefetchMedia, // Add this
}: UploadModalProps) {
  const { data: session } = useSession();

  if (!showUploadModal) return null;

  const handleCancel = () => {
    onClose();
  };

  const handleUploadComplete = () => {
    onUploadComplete();
    onRefetchMedia(); // Call refetch after upload completes
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

        {/* File picker (UploadButton) or Loading */}
        <div className={styles.fileInputWrapper}>
          {isUploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.uploadSpinner}></div>
              <p className={styles.uploadingText}>Uploading...</p>
            </div>
          ) : (
            <UploadButton
              endpoint="imageUploader"
              input={{
                username: session?.user?.name ?? "",
                eventId,
                caption: captionInput,
              }}
              onUploadBegin={onUploadBegin}
              onClientUploadComplete={handleUploadComplete} // Use our wrapper function
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
                button: "Choose Image",
                allowedContent: "",
              }}
            />
          )}
        </div>

        {/* Actions */}
        <div className={styles.uploadActions}>
          <button
            className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}