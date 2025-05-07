import {
  Container,
  ContainerBorderStyle,
  SeeMoreButton,
} from "~/components/ui/Container";
import ContainerEventTitle from "~/components/ui/ContainerEventTitle";
import { ContainerEventRow } from "~/components/ui/ContainerEventRow";
import Calendar from "~/components/ui/Calendar";
import { api } from "~/trpc/react";

const UpcomingEventsSection: React.FC = () => {
   const {
      data: eventsData = [],
      isLoading,
      isError,
    } = api.invitationPreview.getRecentInvitations.useQuery();
    
    if (isLoading) {
      return <p>Loading...</p>;
    }
  
    if (isError) {
      return <p>Failed to load events.</p>;
    }

    const trimmedEvents = eventsData.slice(0, 2);

  return (
    <Container borderStyle={ContainerBorderStyle.BOTTOM}>
      <ContainerEventTitle title={"My invitations"} />

      <div
        style={{  }}
      >
        <Calendar />
      </div>

      {trimmedEvents.map((event, index) => (
        <ContainerEventRow key={index} eventData={event} />
      ))}

      <SeeMoreButton />
    </Container>
  );
};

export default UpcomingEventsSection;
