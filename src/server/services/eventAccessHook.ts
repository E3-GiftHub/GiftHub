import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";

export function useEventAccess(eventId: number | null) {
  const { data: session } = useSession();
  const username = session?.user?.name;

  const { data: event, isLoading } = api.eventPlanner.getEventID.useQuery(
    { eventId: eventId ?? -1 },
    { enabled: eventId != null && eventId > 0 }
  );

  const isPlanner = event?.data?.createdByUsername === username;

  return {
    loading: isLoading,
    hasAccess: isPlanner ?? false,
  };
}
