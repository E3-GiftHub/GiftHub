import React, { useState } from "react";
import styles from "src/styles/UserProfile/UserProfile.module.css";
import clsx from "clsx";
import "src/styles/globals.css";
import type { Profile } from "~/models/Profile";
import ProfileReportButton from "./ProfileReportButton";

interface UserProfileProps {
  reporter: string | null;
  profile: Profile;
  onReport: (
    reporter: string | null,
    reported: string | null,
    reason: string | null,
    description: string | null,
  ) => void;
}

export default function ViewUserProfileUI({
  reporter,
  profile,
  onReport,
}: Readonly<UserProfileProps>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = ["Harassment", "Impersonation", "Spam", "Other"];

  const handleReportClick = () => setModalOpen(true);
  const handleClose = () => {
    setModalOpen(false);
    setSubmitted(false);
    setReportReason("");
    setOtherReason("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return alert("Select a reason:");
    if (reportReason === "Other" && !otherReason.trim()) {
      return alert("Enter a valid reason.");
    }
    setSubmitted(true);
  };

  return (
    <>
      <div className={styles.pageWrapper}>
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <div className={clsx(styles.avatarCircle /*styles.loading*/)}>
                <img
                  src={profile.pictureUrl ?? ""}
                  width={200}
                  height={200}
                  className={styles.avatarImage}
                  alt={"User avatar"}
                />
              </div>
            </div>
          </div>

          <div className={styles.userInfo}>
            <h2 className={clsx(styles.username /*styles.loading*/)}>
              {profile.username}
            </h2>
            <div className={styles.nameContainer}>
              <p
                className={clsx(
                  styles.nameField,
                  styles.fname /*styles.loading*/,
                )}
              >
                {profile.fname === null ? "not set" : profile.fname}
                &nbsp;&nbsp;&nbsp;&nbsp;|
              </p>
              <p
                className={clsx(
                  styles.nameField,
                  styles.lname /*styles.loading*/,
                )}
              >
                &nbsp;
                {profile.lname === null ? "not set" : profile.fname}
              </p>
            </div>

            <div className={styles.buttonContainer}>
              <ProfileReportButton
                iconSrc="illustrations/report.svg"
                alt="Report account"
                loading={false}
                onClick={handleReportClick}
              >
                Report account
              </ProfileReportButton>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={handleClose}
          tabIndex={0}
          role="button"
          aria-label="Close modal"
          onKeyDown={(e) => {
            // Support Enter/Space to close overlay
            if (e.key === "Enter" || e.key === " ") {
              handleClose();
            }
          }}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()} // Basic handler for linting
          >
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <h3>Report User</h3>
                <label htmlFor="reason">Reason</label>
                <select
                  id="reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option className={styles.selectText} value="" disabled>
                    Select a reason:
                  </option>
                  {reportReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>

                {reportReason === "Other" && (
                  <>
                    <label htmlFor="otherReason">
                      Please specify the reason.
                    </label>
                    <textarea
                      id="otherReason"
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      rows={3}
                      required
                    />
                  </>
                )}

                <div className={styles.buttonContainerReport}>
                  <button
                    onClick={() => {
                      onReport(
                        reporter,
                        profile.username,
                        reportReason,
                        otherReason,
                      );
                    }}
                    className={styles.buttonSubmitReport}
                  >
                    Submit Report
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.confirmationMessage}>
                <p>
                  Thank you for your report! Our team will review it shortly.
                </p>
                <button onClick={handleClose} className={styles.closeButton}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
