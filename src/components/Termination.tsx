import { useEffect } from "react";

interface TerminationProps {
  eventId: number | null;
  invitationId: number | null;
  articleId: number | null;
}

export default function Termination({
  eventId,
  invitationId,
  articleId,
}: Readonly<TerminationProps>) {
  useEffect(() => {
    if (!eventId) return;
    (async () => {
      try {
        const res = await fetch(
          `./api/stripe/countdown?eventId=${eventId}&invitationId=${invitationId}&articleId=${articleId}`,
        );
        const data = (await res.json()) as string;
        console.log("termination", data);
      } catch (error) {
        console.error("Failed to load guests", error);
      }
    })().catch((err) => {
      console.error("Unexpected error in useEffect:", err);
    });
  }, [eventId]);

  return <></>;
}
