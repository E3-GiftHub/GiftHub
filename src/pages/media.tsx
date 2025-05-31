import { UploadButton } from "~/utils/uploadthing";
import { useRouter } from "next/router";
import type { MediaHeader } from "~/models/MediaHeader";
import { useState, useEffect } from "react";
import { MediaList } from "~/components/MediaList";

export default function Media() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { eventId } = router.query;
    console.log("Router is ready, id:", eventId);
  }, [router.isReady]);

  const { eventId } = router.query;
  console.log("dadadadadada", eventId);
  const [mediaArray, setMediaArray] = useState<MediaHeader[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

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

  // todo button to upload, list of media
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />

      <MediaList loading={loadingMedia} media={mediaArray} />
    </main>
  );
}
