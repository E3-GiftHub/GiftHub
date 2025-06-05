import styles from "../styles/EventView.module.css";
import loadingStyles from "../styles/wishlistcomponent.module.css";

import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react"; // <-- FIXED: use the React hooks client

import Head from "next/head";
import EventView from "~/components/EventView";
import Navbar from "~/components/Navbar";
import MediaModal from "~/components/MediaModal";
import Footer from "~/components/Footer";
import UploadModal from "~/components/UploadMediaModal";
import type { MediaHeader } from "~/models/MediaHeader";
import NotInvited from "@/components/notinvited";
import Termination from "~/components/Termination";

export default function EventViewPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [doesShowMedia, setDoesShowMedia] = useState(false);
  const [mediaArray, setMediaArray] = useState<MediaHeader[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [captionInput, setCaptionInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { eventIdTemp } = router.query;
    if (!eventIdTemp) return;
    console.log("Router is ready, id:", eventIdTemp);
  }, [router.isReady]);
  const { id } = router.query;
  const eventId = Number(id);

  const {
    data: eventData,
    isLoading,
    error,
  } = api.event.getById.useQuery(
    { id: eventId },
    { enabled: Boolean(id) && !isNaN(eventId) },
  );

  const { data: invitationData, isLoading: isInvitationLoading } =
    api.invitationPreview.getInvitationForUserEvent.useQuery(
      { eventId: Number(eventId), guestUsername: session?.user?.name ?? "" },
      { enabled: !!eventId && !!session?.user?.name && !isLoading },
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
    void router.push(`/profile-view?username=${username}`);
  };

  const handleViewWishlist = () => {
    void router.push(`/wishlist-view?eventId=${eventId}`);
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

  // to refresh media after upload is completed
  const refetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch(`./api/media-query?eventId=${eventId}`);
      const data = (await res.json()) as MediaHeader[];
      setMediaArray(data);
    } catch (error) {
      console.error("Failed to refetch media", error);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleUploadClose = () => {
    setShowUploadModal(false);
    setCaptionInput("");
    setIsUploading(false);
  };

  const handleUploadBegin = () => {
    setIsUploading(true);
  };

  const handleUploadComplete = () => {
    setIsUploading(false);
    setShowUploadModal(false);
    setCaptionInput("");
  };

  const handleUploadError = (err: Error) => {
    setIsUploading(false);
    alert(`Error: ${err.message}`);
  };

  //! RENDER ALL DATA
  if (!isLoading && !session?.user) return <p>Please login first...</p>;

  // Show loading spinner while either event or invitation data is loading
  if (isLoading || isInvitationLoading) {
    return (
      <div className={loadingStyles.loadingContainer}>
        <div className={loadingStyles.spinner}></div>
      </div>
    );
  }

  // Check for errors or missing data after loading
  if (error || !id || !eventData) {
    return (
      <div className={loadingStyles.loadingContainer}>
        <div className={loadingStyles.spinner}></div>
      </div>
    );
  }

  // Check if user is invited
  if (invitationData?.status !== "ACCEPTED") {
    return (
      <>
        <Head>
          <title>Event View - GiftHub</title>
        </Head>
        <Navbar />
        <div className={styles.containerNotInvited}>
          <NotInvited />
        </div>
        <Footer />
      </>
    );
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
              id: String(eventData.id),
              title: eventData.title,
              picture: eventData.pictureUrl,
              description: eventData.description,
              location: eventData.location,
              date: eventData.date,
              planner: eventData.planner,
              guests: eventData.guests,
            }}
            onContribute={() => {
              void router.push(`/payment?eventid=${eventId}`);
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
          <UploadModal
            showUploadModal={showUploadModal}
            captionInput={captionInput}
            isUploading={isUploading}
            eventId={eventId}
            onClose={handleUploadClose}
            onCaptionChange={setCaptionInput}
            onUploadBegin={handleUploadBegin}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onRefetchMedia={refetchMedia}
          />
        </main>
      </div>
      <Footer />
      <Termination eventId={eventId} invitationId={null} articleId={null} />
    </>
  );
}
