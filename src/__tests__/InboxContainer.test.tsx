import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InboxContainer from "../components/ui/InboxContainer";


jest.mock("../../styles/InboxContainer.module.css", () => ({
  separator: "separator",
  notificationList: "notificationList",
}));


jest.mock("../components/ui/CustomContainer", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));


type InboxContainerHeaderProps = {
  onTabChange: (tab: string) => void;
  onOpenMobileFilter: () => void;
};

jest.mock("../components/ui/InboxContainerHeader", () => ({
  __esModule: true,
  default: (props: InboxContainerHeaderProps) => (
    <div>
      <button onClick={() => props.onTabChange("Invitations")}>Invitations Tab</button>
      <button onClick={() => props.onTabChange("My events")}>Events Tab</button>
      <button onClick={props.onOpenMobileFilter}>Open Filter</button>
    </div>
  ),
}));


type MobileFilterMenuProps = {
  visible: boolean;
  activeTab: string;
  onSelect: (tab: string) => void;
  onClose: () => void;
};

jest.mock("../components/ui/MobileFilterMenu", () => ({
  __esModule: true,
  default: (props: MobileFilterMenuProps) =>
    props.visible ? (
      <div>
        <p>Mobile Filter Visible</p>
        <button onClick={() => props.onSelect("Invitations")}>Select Invitations</button>
        <button onClick={props.onClose}>Close Filter</button>
      </div>
    ) : null,
}));


jest.mock("../components/ui/InboxNotification", () => ({
  __esModule: true,
  default: ({ data }: any) => <div>{data.text}</div>,
}));


jest.mock("~/trpc/react", () => ({
  api: {
    contributions: {
      getContributionsForUserEvents: {
        useQuery: () => ({
          data: [
            {
              id: "1",
              text: "Alex contributed 50 lei to your gift",
              type: "event",
              link: "/event#1",
              firstName: "Alex",
              lastName: "Ionescu",
              profilePicture: "",
              notificationDate: "2023-09-15T14:30:00Z",
            },
          ],
        }),
      },
      getPurchasedItemsForUserEvents: {
        useQuery: () => ({
          data: [],
        }),
      },
    },
    invitationsNotification: {
      getUserInvitations: {
        useQuery: () => ({
          data: [
            {
              id: 2,
              description: "You are invited to John's Birthday. See more",
              type: "invitation",
              link: "/invite#2",
              firstName: "John",
              lastName: "Johnes",
              profilePicture: "",
              createdAt: "2023-09-14T12:00:00Z",
            },
          ],
        }),
      },
    },
  },
}));


describe("InboxContainer", () => {
  it("renders all notifications initially", async () => {
    render(<InboxContainer />);
    await waitFor(() => {
      expect(screen.getByText(/John's Birthday/i)).toBeInTheDocument();
      expect(screen.getByText(/Alex contributed/i)).toBeInTheDocument();
    });
  });

  it("filters notifications by 'Invitations' tab", async () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Invitations Tab"));
    await waitFor(() => {
      expect(screen.getByText(/John's Birthday/i)).toBeInTheDocument();
      expect(screen.queryByText(/Alex contributed/i)).not.toBeInTheDocument();
    });
  });

  it("filters notifications by 'My events' tab", async () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Events Tab"));
    await waitFor(() => {
      expect(screen.getByText(/Alex contributed/i)).toBeInTheDocument();
      expect(screen.queryByText(/John's Birthday/i)).not.toBeInTheDocument();
    });
  });

  it("shows mobile filter when triggered", () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Open Filter"));
    expect(screen.getByText("Mobile Filter Visible")).toBeInTheDocument();
  });

  it("selects tab from mobile filter", async () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Open Filter"));
    fireEvent.click(screen.getByText("Select Invitations"));
    await waitFor(() => {
      expect(screen.getByText(/John's Birthday/i)).toBeInTheDocument();
      expect(screen.queryByText(/Alex contributed/i)).not.toBeInTheDocument();
    });
  });

  it("closes the mobile filter", () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Open Filter"));
    fireEvent.click(screen.getByText("Close Filter"));
    expect(screen.queryByText("Mobile Filter Visible")).not.toBeInTheDocument();
  });
});
