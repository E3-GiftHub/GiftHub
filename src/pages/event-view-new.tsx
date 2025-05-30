"use client"

import React, { useState, useEffect } from "react";
//styles
import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";
import "./../styles/globals.css";

//components
import Navbar from "~/components/Navbar";
import GuestListModal from "~/components/EventView/GuestListModal";
import EditMediaModal from "~/components/EventView/EditMediaModal";
import EventInfoForm from "~/components/EventView/EventInfoForm";
import Guests from "~/components/EventView/Guests";
import Media from "~/components/EventView/Media";
import ConfirmModal from "~/components/EventView/ConfirmModal";
import WishlistComponent from "~/components/EventView/Wishlist";
import Footer from "../components/Footer";

//backend
import { api } from "~/trpc/react";
import { useRouter } from "next/router";
import { UploadButton } from "~/utils/uploadthing";
import { type GuestHeader } from "~/models/GuestHeader";

//TODO
function parseId(param: string | string[] | undefined): number | null {
  if (typeof param === "string") {
    const num = Number(param);
    return isNaN(num) ? null : num;
  }
  return null; // ignore arrays or undefined
}

//TODO
interface GuestListPreviewProps {
  eventId: number;
}

//TODO
/*function GuestListPreview({ eventId }: GuestListPreviewProps) {
  const [guests, setGuests] = useState<GuestHeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(/api/guest-list?eventId=${eventId});
        const data = (await res.json()) as GuestHeader[];
        setGuests(data);
      } catch (error) {
        console.error("Failed to load guests", error);
      } finally {
        setLoading(false);
      }
    })().catch((err) => {
      console.error("Unexpected error in useEffect:", err);
    });
  }, [eventId]);

  if (loading) return <div>Loading guests...</div>;

  return (
    <div className={styles.guestList}>
      {guests.map((guest) => (
        <div className={styles.guestItem} key={guest.username}>
          <p>{guest.username}</p>
          <p>{guest.fname}</p>
          <p>{guest.lname}</p>
          <img src={guest.pictureUrl ?? ""} alt="user visual description" />
        </div>
      ))}
    </div>
  );
}*/

export default function EventViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const idParam = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;
  const evId = Number(idParam) ?? 0;

  const eventId = parseId(id) ?? 0;


  // ─── Queries & Mutations ─────────────────────────────────────────────
  const getEventQ = api.event.getEventID.useQuery(
    { eventId },
    { enabled: eventId > 0 }
  );
  const updateEventM = api.event.updateEvent.useMutation();
  const getMediaQ = api.media.getMediaByEvent.useQuery(
    { eventId },
    { enabled: eventId > 0 }
  );
  const removeMediaM = api.media.removeMedia.useMutation();
  const getGuestsQ = api.guest.getGuestsForEvent.useQuery(
    { eventId },
    { enabled: eventId > 0 }
  );

  // ─── Local state ─────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingField, setPendingField] = useState<keyof typeof formData | null>(null);

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (getEventQ.data?.data) {
      const e = getEventQ.data.data;
      const dateObj = new Date(eventData.date);
      const date = dateObj.toISOString().split("T")[0] ?? "";
      setFormData({
        title: e.title ?? "",
        description: e.description ?? "",
        date: d.toISOString().slice(0, 10),
        time: d.toTimeString().slice(0, 5),
        location: e.location ?? "",
      });
    }
  }, [getEventQ.data]);

  // ─── Handlers ───────────────────────────────────────────────────────
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof typeof formData
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setPendingField(field);
      setShowConfirm(true);
    }
  };

  const handleConfirm = async () => {
    if (!pendingField) return;
    setShowConfirm(false);
    try {
      await updateEventM.mutateAsync({
        eventId,
        ...formData,
      });
    } catch (err) {
      console.error("Failed to update event:", err);
    }
    setPendingField(null);
  };

  const handleRemoveMedia = async (mediaId: number) => {
    try {
      await removeMediaM.mutateAsync({ mediaId });
      getMediaQ.refetch();
    } catch (err) {
      console.error("Failed to delete media:", err);
    }
  };

  // ─── Loading / Error states ─────────────────────────────────────────
  if (getEventQ.isLoading) {
    return <p className={styles.center}>Loading event…</p>;
  }
  if (getEventQ.isError || !getEventQ.data?.data) {
    return <p className={styles.center}>Failed to load event.</p>;
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      {/* Confirm edit modal */}
      {showConfirm && pendingField && (
        <ConfirmModal
          pendingField={pendingField}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Delete event */}
      {
        //TODO: add delete event modal
      }

      {/* Guest list editor */}
      {//TODO: add guest modal
      }

      {/* Media editor */}
      {//TODO : add media modal
      }

      {/* Upload new media */}
      {showUploadModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3>Upload new media</h3>
            <UploadButton
              endpoint="imageUploader"
              input={{ eventId }}
              onClientUploadComplete={() => {
                getMediaQ.refetch();
                setShowUploadModal(false);
              }}
              onUploadError={(e) => alert(e.message)}
            />
            <button
              className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{formData.title || "Untitled event"}</h2>
          <button
            className={styles.deleteButton}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Event
          </button>
        </div>

        <div className={styles.wrapper}>
          {/* Top section: photo & form */}
          <div className={styles.topSection}>
            <div className={styles.photoSection}>
              <img
                className={styles.photoBox}
                src={getEventQ.data.data.pictureUrl ?? ""}
                alt="Event"
              />
            </div>
            <EventInfoForm
              formData={formData}
              setFormData={setFormData}
              handleKeyDown={handleKeyDown}
            />
          </div>

          {/* Bottom row: Guests, Media, Wishlist */}
          {/* {<div className={styles.bottomRow}>
            <Guests onOpenModal={() => setShowGuestModal(true)} guestCount={getGuestsQ.data?.data.length ?? 0} />
            <Media onOpenModal={() => setShowMediaModal(true)} mediaCount={getMediaQ.data?.data.length ?? 0} />
            <WishlistComponent eventId={eventId} />
          </div>} */}
        </div>
      </div>

      <Footer />
    </div>
  );
}