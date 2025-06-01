import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";

import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { UploadButton } from "~/utils/uploadthing";
import { api } from "~/trpc/react"; // <-- FIXED: use the React hooks client

import Head from "next/head";
import EventView from "~/components/EventView";
import Navbar from "~/components/Navbar";
import MediaModal from "~/components/MediaModal";
import Footer from "~/components/Footer";
import type { MediaHeader } from "~/models/MediaHeader";

export default function EventViewPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [doesShowMedia, setDoesShowMedia] = useState(false);
  const [mediaArray, setMediaArray] = useState<MediaHeader[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { eventIdTemp } = router.query;
    if (!eventIdTemp) return;
    console.log("Router is ready, id:", eventIdTemp);
  }, [router.isReady]);

  const { id } = router.query;
  const eventId: number = Number(id);

  const {
    data: eventData,
    isLoading,
    error,
  } = api.event.getById.useQuery(
    { id: eventId },
    { enabled: Boolean(id) && !isNaN(eventId) },
  );

  //! FUNCTIONS
  const handleReport = async (reason: string) => {
    if (status !== "authenticated") return;

    try {
      const res = await fetch("./api/event-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: session.user?.name ?? "",
          eventId: eventId,
          reason: reason,
        }),
      });

      console.log(res);
      alert(`Event reported for: ${reason}`);
    } catch (error) {
      console.error("Failed to load guests", error);
    }
  };

  const handleViewProfile = (username: string) => {
    void router.push(`/view-profile?username=${username}`);
  };

  const handleViewWishlist = () => {
    void router.push(`/wishlist?eventId=${eventId}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDoesShowMedia(false);
        setShowUploadModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  //! GET MEDIA
  useEffect(() => {
    if (!router.isReady || !id) return;

    (async () => {
      try {
        const res = await fetch(`./api/media-query?eventId=${eventId}`);
        const data = (await res.json()) as MediaHeader[];
        setMediaArray(data);
      } catch (error) {
        console.error("Failed to load media", error);
      } finally {
        setLoadingMedia(false);
      }
    })().catch((err) => {
      console.error("Unexpected error in useEffect:", err);
    });
  }, [eventId]);

  //! RENDER ALL DATA
  if (!id || !eventData || isNaN(eventId) || error) {
    return <p>error: Invalid event ID - {error?.message}</p>;
  }

  if (isLoading) {
    return <p>Loading event...</p>;
  }

  return (
    <>
      <Head>
        <title>Event View - GiftHub</title>
        <meta
          name="description"
          content="View event details and manage contributions"
        />
      </Head>

      <Navbar />
      <div className={styles.container}>
        <main>
          <EventView
            eventData={{
              id: String(eventData.id), // <-- Fix: convert number to string
              title: eventData.title,
              picture: eventData.pictureUrl,
              description: eventData.description,
              location: eventData.location,
              date: eventData.date,
              planner: eventData.planner,
              guests: eventData.guests,
            }}
            onContribute={() => {
              router.push(`/payment?eventId=${eventId}`);
            }}
            onViewWishlist={handleViewWishlist}
            onMediaView={() => setDoesShowMedia(true)}
            onReport={handleReport}
            onViewProfile={handleViewProfile}
          />

          {/* MEDIA MODAL WITH A BUTTON TO UPLOAD */}
          {doesShowMedia && (
            <MediaModal
              isLoading={loadingMedia}
              media={mediaArray}
              onUpload={() => setShowUploadModal(true)}
              onClose={() => setDoesShowMedia(false)}
            />
          )}

          {/* THE UPLOADING MODAL */}
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
        </main>
      </div>
      <Footer />
    </>
  );
}
