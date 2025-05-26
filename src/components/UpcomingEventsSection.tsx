import {
  Container,
  ContainerBorderStyle,
  SeeMoreButton,
} from "~/components/ui/Container";
import ContainerEventTitle from "~/components/ui/ContainerEventTitle";
import { ContainerEventRow } from "~/components/ui/ContainerEventRow";
import Calendar from "~/components/ui/Calendar";
import { api } from "~/trpc/react";
import Modal from "~/components/Modal";
import React, { useState } from "react";

const UpcomingEventsSection: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    data: eventsData = [],
    isLoading = false,
    isError = false,
  } = api.invitationPreview.getRecentInvitations.useQuery({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

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

      <div style={{}}>
        <Calendar currentDate={currentDate} setCurrentDate={setCurrentDate} />
      </div>

      {trimmedEvents.map((event, index) => (
        <ContainerEventRow key={index} eventData={event} />
      ))}

      <SeeMoreButton onClick={openModal} />

      <Modal isOpen={showModal} onClose={closeModal} title="All My Invitations">
        {eventsData.map((event, index) => (
          <ContainerEventRow key={index} eventData={event} />
        ))}
      </Modal>
    </Container>
  );
};

export default UpcomingEventsSection;
