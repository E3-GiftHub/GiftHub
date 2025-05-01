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
import shortEventsMockResponse from "~/components/mock-data/shortEventsMockResponse";
import type { ShortEventResponse } from "~/models/ShortEventResponse";

const MyEventsSection: React.FC = () => {
  const [eventsData, setEventsData] = React.useState<ShortEventResponse[]>([]);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        //const response = await fetch("/api/getShortEvents");
        //const data = (await response.json()) as ShortEventResponse[];
        const data = shortEventsMockResponse;
        const trimmedData = data.slice(0, 3);
        setEventsData(trimmedData);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    void fetchEvents();
  }, []);

  return (
    <Container borderStyle={ContainerBorderStyle.TOP}>
      <ContainerEventTitle title={"My events"} />
      {eventsData.map((event, index) => (
        <ContainerEventRow key={index} eventData={event} />
      ))}
      <SeeMoreButton />
      <div className={styles["buttons-wrapper"]}>
        <ButtonComponent text={"Add new event"} style={ButtonStyle.PRIMARY} />
      </div>
    </Container>
  );
};

export default MyEventsSection;
