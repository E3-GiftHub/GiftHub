import {
  Container,
  ContainerBorderStyle,
  SeeMoreButton,
} from "~/components/ui/Container";
import ContainerEventTitle from "~/components/ui/ContainerEventTitle";
import { ContainerEventRow } from "~/components/ui/ContainerEventRow";
import React from "react";
import shortEventsMockResponse from "~/components/mock-data/shortEventsMockResponse";
import type { ShortEventResponse } from "~/models/ShortEventResponse";

const UpcomingEventsSection: React.FC = () => {
  const [eventsData, setEventsData] = React.useState<ShortEventResponse[]>([]);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        //const response = await fetch("/api/getShortEvents");
        //const data = (await response.json()) as ShortEventResponse[];
        const data = shortEventsMockResponse;
        const trimmedData = data.slice(0, 2);
        setEventsData(trimmedData);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    void fetchEvents();
  }, []);

  return (
    <Container borderStyle={ContainerBorderStyle.BOTTOM}>
      <ContainerEventTitle title={"My invitations"} />
      <div
        style={{
          backgroundColor: "#b9b1b1",
          width: "70%",
          height: "100%",
          borderRadius: "10px",
          color: "#000",
          textAlign: "center",
        }}
      >
        Calendar here
      </div>
      {eventsData.map((event, index) => (
        <ContainerEventRow key={index} eventData={event} />
      ))}
      <SeeMoreButton />
    </Container>
  );
};

export default UpcomingEventsSection;
