"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";
import GuestListModal from "../components/GuestListModal";
import EditMediaModal from "../components/EditMediaModal";
import DeleteEventModal from "../components/DeleteEventModal";

import { api } from "~/trpc/react";
import { useRouter } from "next/router";
import { UploadButton } from "~/utils/uploadthing";
import Footer from "../components/Footer";
import "./../styles/globals.css";
import { type GuestHeader } from "~/models/GuestHeader";


function parseId(param: string | string[] | undefined): number | null {
  if (typeof param === "string") {
    const num = Number(param);
    return isNaN(num) ? null : num;
  }
  return null; // ignore arrays or undefined
}

interface GuestListPreviewProps {
  loading: boolean;
  eventId: number;
  guests: readonly GuestHeader[];
}

// prints at most 10 guests
function GuestListPreview({
  loading,
  eventId,
  guests,
}: Readonly<GuestListPreviewProps>) {
  if (loading) return <div>Loading guests...</div>;

  return (
    <div className={styles.guestList}>
      {guests.slice(0, 10).map((guest) => (
        <div className={styles.guestItem} key={guest.username}>
          <img
            className={styles.guestImage}
            src={guest.pictureUrl ?? ""}
            alt="user visual description"
          />
          <p className={styles.guestName}>
            {guest.fname} {guest.lname}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function EventView() {
  // update events
  const updateEventMutation = api.event.updateEvent.useMutation();
  const deleteEventMutation = api.event.removeEvent.useMutation();


  // get the event id
  const router = useRouter();

  const { id } = router.query;
  const idParam = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  console.log("idParam: ", idParam);
  const eventId = Number(idParam) ?? 0;
  console.log("Event id: ", eventId);
  const parsedId = parseId(id) ?? 0;

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  //! AICI FACEM ROST DE GUESTS
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guests, setGuests] = useState<GuestHeader[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`./api/guest-list?eventId=${eventId}`);
        const data = (await res.json()) as GuestHeader[];
        setGuests(data);
      } catch (error) {
        console.error("Failed to load guests", error);
      } finally {
        setLoadingGuests(false);
      }
    })().catch((err) => {
      console.error("Unexpected error in useEffect:", err);
    });
  }, [eventId]);
  //! AICI SE TERMINA FACEREA DE ROST DE GUESTS

  const { data } = api.event.getEventID.useQuery(
    {
      eventId: parsedId,
    },
    { enabled: parsedId !== null },
  );

  const eventData = data?.data;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingField, setPendingField] = useState<
    keyof typeof formData | null
  >(null);
  const [tempValue, setTempValue] = useState("");

  // todo to change the frontend with hooks ANDREI.
  // Andrei: done
  const handleRemoveGuest = (username: string) => {
    // Remove from view immediately
    setGuests((prev) => prev.filter((g) => g.username !== username));

    // Then call API to remove in backend
    const f = async () => {
      try {
        const res = await fetch(
          `./api/guest-remove?username=${username}&eventId=${eventId}`,
        );

        const apiStatus: { error: string } = (await res.json()) as {
          error: string;
        };
        console.log(apiStatus);
      } catch (error) {
        console.error("Failed to remove guests", error);
      }
    };
    f().catch((err) => {
      console.error("Unexpected error in useEffect:", err);
    });
  };

  const handleAddGuest = () => {
    const name = window.prompt("Enter guest username:");
    const user = guests.find((g) => g.username === name);

    // the user is not already a Guest in this Event
    if (user == null && name?.trim()) {
      const f = async () => {
        try {
          const res = await fetch(
            `./api/guest-invite?username=${name}&eventId=${eventId}`,
          );

          const apiStatus: { error: string } = (await res.json()) as {
            error: string;
          };
          console.log(apiStatus);
          // Do NOT add to view here; guest appears after they accept invitation
        } catch (error) {
          console.error("Failed to insert guests", error);
        }
      };
      f().catch((err) => {
        console.error("Unexpected error in useEffect:", err);
      });
    }
  };
  const handleSaveGuestChanges = () => setShowGuestModal(false);

  // Media list state
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const mediaData = api.media.getMediaByEvent.useQuery(
    { eventId: parsedId },
    { enabled: parsedId !== null && parsedId > 0 },
  );
  const [mediaList, setMediaList] = useState(
    Array.from({ length: 12 }, (_, i) => `/placeholder/image${i + 1}.jpg`),
  );
  const removeMediaMutation = api.media.removeMedia.useMutation();
  const { refetch: mediaRefetch } = api.media.getMediaByEvent.useQuery(
    {
      eventId: parsedId,
    },
    { enabled: parsedId !== null && parsedId > 0 },
  );

  console.log("ID: ", parsedId);

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

  const handleRemoveMedia = async (mediaId: number) => {
    try {
      await removeMediaMutation.mutateAsync({ mediaId });
      // Refresh media list after deletion
      await mediaRefetch();
    } catch (err) {
      console.error("❌ Failed to remove media:", err);
    }
  };

  // inline edit confirmation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof typeof formData,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setPendingField(field);
      setTempValue(e.currentTarget.value);
      setShowConfirm(true);
    }
  };

  const handleConfirm = async () => {
    if (!pendingField) return;

    setFormData((prev) => ({ ...prev, [pendingField]: tempValue }));
    setPendingField(null);
    setShowConfirm(false);

    const payload = {
      eventId: eventId,
      title: pendingField === "title" ? tempValue : formData.title,
      description:
        pendingField === "description" ? tempValue : formData.description,
      date: pendingField === "date" ? tempValue : formData.date,
      time: pendingField === "time" ? tempValue : formData.time,
      location: pendingField === "location" ? tempValue : formData.location,
    };

    try {
      await updateEventMutation.mutateAsync(payload);
      console.log("Event updated!");
    } catch (err) {
      console.error("Failed to update event:", err);
    }
  };

  const handleCancel = () => {
    if (!pendingField) return;

    setShowConfirm(false);
    setPendingField(null);
    setTempValue("");

    setFormData((prev) => ({
      ...prev,
      [pendingField]: (() => {
        if (!eventData) return prev[pendingField];

        switch (pendingField) {
          case "title":
            return eventData.title ?? "";
          case "description":
            return eventData.description ?? "";
          case "location":
            return eventData.location ?? "";
          case "date":
            return eventData.date ? new Date(eventData.date).toISOString().split("T")[0] : "";
          case "time":
            return eventData.date ? new Date(eventData.date).toTimeString().slice(0, 5) : "";
          default:
            return prev[pendingField];
        }
      })(),
    }));
  };


  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      {showGuestModal && (
        <GuestListModal
          loading={loadingGuests}
          eventId={eventId}
          guests={guests}
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
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

       {showDeleteModal && (
                <DeleteEventModal
                    onConfirm={async () => {
                      try {
                        await deleteEventMutation.mutateAsync({ eventId: parsedId });
                        alert("Event deleted successfully.");
                        router.push("/");
                      } catch (err: any) {
                        console.error("Failed to delete event:", err);
                        alert(err.message || "Could not delete event.");
                      } finally {
                        setShowDeleteModal(false);
                      }
                    }}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

      {showMediaModal && (
        <EditMediaModal
          media={mediaData.data ?? []}
          onRemove={handleRemoveMedia}
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
          {pendingField === "title" ? (
            <input
              className={styles.input}
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              onKeyDown={(e) => handleKeyDown(e, "title")}
              autoFocus
              
            />
          ) : (
            <h2
              className={styles.title}
              onClick={() => {
                setPendingField("title");
                setTempValue(formData.title);
              }}
            >
              {formData.title}
            </h2>
          )}

          {/* Delete Event Button */}
          <button
            className={styles.deleteMainButton}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Event
          </button>
        </div>

        <div className={styles.wrapper}>
          {/* Rand: Poză + Data+Locație + Descriere */}
          <div className={styles.topSection}>
            {/* Poza */}
            <div className={styles.photoSection}>
              <img
                className={styles.photoBox}
                src={eventData.pictureUrl ?? undefined}
                alt="the visual representation of the event"
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
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    handleKeyDown(e, "time");
                  }}
                  className={styles.input}
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
              <GuestListPreview
                loading={loadingGuests}
                eventId={eventId}
                guests={guests}
              />
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
                    <img
                      src={mediaItem.url}
                      alt="representation of users' pictogrphic activity"
                    />
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