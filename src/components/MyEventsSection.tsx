import {
  Container,
  ContainerBorderStyle,
  SeeMoreButton,
} from "~/components/ui/Container";
import ContainerEventTitle from "~/components/ui/ContainerEventTitle";
import { ContainerEventRow } from "~/components/ui/ContainerEventRow";
import styles from "~/styles/HomePageStyle.module.css";
import { ButtonComponent, ButtonStyle } from "~/components/ui/ButtonComponent";
import React from "react";
import { api } from "~/trpc/react";
import Modal from "~/components/Modal";
import { useState } from "react";


const MyEventsSection: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const {
    data: eventsData = [],
    isLoading,
    isError,
  } = api.eventPreview.getUpcomingEvents.useQuery();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Failed to load events.</p>;
  }
  const trimmedEvents = eventsData.slice(0, 3);

  return (
    <Container borderStyle={ContainerBorderStyle.TOP}>
      <ContainerEventTitle title={"My events"} />
      {trimmedEvents.map((event, index) => (
        <ContainerEventRow key={index} eventData={event} />
      ))}
      <SeeMoreButton onClick={openModal} />

      <Modal isOpen={showModal} onClose={closeModal} title="All My Events">
        {eventsData.map((event, index) => (
          <ContainerEventRow key={index} eventData={event} />
        ))}
      </Modal>

      <div className={styles["buttons-wrapper"]}>
        <ButtonComponent text={"Add new event"} style={ButtonStyle.PRIMARY} />
      </div>
    </Container>
  );
};

export default MyEventsSection;
