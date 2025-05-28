"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";
import GuestListModal from "../components/GuestListModal";
import EditMediaModal from "../components/EditMediaModal";
import { api } from "~/trpc/react";
import { useRouter } from "next/router";
import { UploadButton } from "~/utils/uploadthing";
import Footer from "../components/Footer";
import "./../styles/globals.css";

function parseId(param: string | string[] | undefined): number | null {
  if (typeof param === "string") {
    const num = Number(param);
    return isNaN(num) ? null : num;
  }
  return null; // ignore arrays or undefined
}

function GuestListPreview(guestNames: string[]) {
  return (
    <div className={styles.guestList}>
      {guestNames.map((guest, index) => (
        <div className={styles.guestItem} key={index}>
          {guest}
        </div>
      ))}
    </div>
  );
}

export default function EventView() {
  const router = useRouter();
  const { id } = router.query;
  const idParam = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;
  const eventId = Number(idParam) || 0

  const parsedId = parseId(id) ?? 0;

  const { data } = api.event.getEventID.useQuery({
    eventId: parsedId,
  });

  const guestsData = api.guest.getGuestsForEvent.useQuery({
    eventId: parsedId,
  });

  const eventData = data?.data;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingField, setPendingField] = useState<null | string>(null);
  const [tempValue, setTempValue] = useState("");

  // Guest list state
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestList, setGuestList] = useState(
    Array.from({ length: 24 }, (_, i) => `Guest ${i + 1}`),
  );
  const handleRemoveGuest = (idx: number) =>
    setGuestList((prev) => prev.filter((_, i) => i !== idx));

  const handleAddGuest = () => {
    const name = window.prompt("Enter guest name:");
   if (name?.trim()){
      setGuestList((prev) => [...prev, name.trim()]);
    }
  };
  const handleSaveGuestChanges = () => setShowGuestModal(false);

  // Media list state
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const mediaData = api.media.getMediaByEvent.useQuery({ eventId: parsedId });
  const [mediaList, setMediaList] = useState(
    Array.from({ length: 12 }, (_, i) => `/placeholder/image${i + 1}.jpg`),
  );

  useEffect(() => {
    if (eventData?.date) {
      // Ensure date is formatted as yyyy-mm-dd
      const dateObj = new Date(eventData.date);
      const date = dateObj.toISOString().split("T")[0] ?? "";
      setFormData({
        title: eventData.title ?? "",
        description: eventData.description ?? "",
        date: date,
        time: dateObj.toTimeString().slice(0, 5),
        location: eventData.location ?? "",
      });
      console.log("date ", date);
    }
  }, [eventData]);

  useEffect(() => {
    if (guestsData?.data) {
      const guestNames = guestsData.data.map(
        (guestElement) => guestElement.guest.username,
      );
      if (JSON.stringify(guestNames) !== JSON.stringify(guestList)) {
        setGuestList(guestNames);
      }
    }
  }, [guestsData, guestList]);

  if (eventData === undefined) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <div
          className={styles.container}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>Loading event...</h2>
        </div>
      </div>
    );
  }

  const handleRemoveMedia = (idx: number) =>
    setMediaList((prev) => prev.filter((_, i) => i !== idx));

  // inline edit confirmation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setPendingField(field);
      setTempValue(e.currentTarget.value);
      setShowConfirm(true);
    }
  };
  const handleConfirm = () => {
    if (!pendingField) return;
    setFormData((prev) => ({ ...prev, [pendingField]: tempValue }));
    setPendingField(null);
    setShowConfirm(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      {showGuestModal && (
        <GuestListModal
          guests={guestList}
          onRemoveGuest={handleRemoveGuest}
          onAddGuest={handleAddGuest}
          onSave={handleSaveGuestChanges}
          onClose={() => setShowGuestModal(false)}
          onBack={() => setShowGuestModal(false)}
        />
      )}

      {showConfirm && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <p>
              Save changes to <strong>{pendingField}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button
                className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                onClick={handleConfirm}
              >
                Yes
              </button>
              <button
                className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showMediaModal && (
        <EditMediaModal
          media={mediaData.data ?? []}
          onRemove={(id: number) => {
            // opțional: apelează o mutație TRPC care șterge în DB
            // apoi reîmprospătează mediaData
          }}
          onUpload={() => setShowUploadModal(true)}
          onClose={() => setShowMediaModal(false)}
        />
      )}


      {showUploadModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Upload Media</h3>
            <UploadButton
              endpoint="imageUploader"
              input={{ eventId }}            
              onClientUploadComplete={(res) => {
                console.log("Files:", res);
                alert("Upload completed");
                setShowUploadModal(false);
              }}
              onUploadError={(err: Error) => {
                alert(`Error: ${err.message}`);
              }}
            />

            <button
              className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
              onClick={() => setShowUploadModal(false)}
              style={{ marginTop: "1rem" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{eventData?.title ?? "Loading event..."}</h2>
        </div>

        <div className={styles.wrapper}>
          {/* Rand: Poză + Data+Locație + Descriere */}
          <div className={styles.topSection}>
            {/* Poza */}
            <div className={styles.photoSection}>
              <img
                className={styles.photoBox}
                src={eventData.pictureUrl ?? undefined}
              />
            </div>
            {/* Data + Locația */}
            <div className={styles.infoBox}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Date</label>
                <input
                  className={styles.input}
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  onKeyDown={(e) => handleKeyDown(e, "date")}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Time</label>
                <input
                  className={styles.input}
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  onKeyDown={(e) => handleKeyDown(e, "time")}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Location</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => handleKeyDown(e, "location")}
                />
              </div>
            </div>

            {/* Descrierea */}
            <div className={styles.descriptionBox}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                placeholder="Event description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                onKeyDown={(e) => handleKeyDown(e, "description")}
              />
            </div>
          </div>

          {/* Rand: Lista de invitați + buton + wishlist */}
          <div className={styles.bottomRow}>
            <div className={styles.guestBoard}>
              <label className={styles.label2}>Guest List</label>
              {GuestListPreview(guestList)}
              <button
                className={`${buttonStyles.button} ${buttonStyles["button-primary"]} ${styles.seeMoreOverride}`}
                onClick={() => setShowGuestModal(true)}
              >
                See more
              </button>
            </div>
            <div className={styles.mediaGallery}>
              <label className={styles.label2}>Media Gallery</label>
              <div className={styles.mediaGrid}>
                {mediaData.data?.map((mediaItem) => (
                  <div key={mediaItem.id} className={styles.mediaItem}>
                    <img src={mediaItem.url} alt={"Media photo"} />
                  </div>
                )) ?? <p>Loading media...</p>}
              </div>
              <button
                className={`${buttonStyles.button} ${buttonStyles["button-primary"]} ${styles.mediaButton}`}
                onClick={() => setShowMediaModal(true)}
              >
                Edit Media
              </button>
            </div>
            <div className={styles.wishlistBox}>
              <button
                className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
              >
                Create Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

    <Footer />
    </div>
  );
}
