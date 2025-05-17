import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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
  onMarkAllAsRead: () => void;
  onOpenMobileFilter: () => void;
};

jest.mock("../components/ui/InboxContainerHeader", () => ({
  __esModule: true,
  default: (props: InboxContainerHeaderProps) => (
    <div>
      <button onClick={() => props.onTabChange("Invitations")}>Invitations Tab</button>
      <button onClick={() => props.onTabChange("My events")}>Events Tab</button>
      <button onClick={props.onMarkAllAsRead}>Mark All as Read</button>
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


describe("InboxContainer", () => {
  it("renders all notifications initially", () => {
    render(<InboxContainer />);
    expect(screen.getByText(/John's Birthday/i)).toBeInTheDocument();
    expect(screen.getByText(/Alex contributed/i)).toBeInTheDocument();
  });

  it("filters notifications by 'Invitations' tab", () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Invitations Tab"));
    expect(screen.getByText(/John's Birthday/i)).toBeInTheDocument();
    expect(screen.queryByText(/Alex contributed/i)).not.toBeInTheDocument();
  });

  it("filters notifications by 'My events' tab", () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Events Tab"));
    expect(screen.getByText(/Alex contributed/i)).toBeInTheDocument();
    expect(screen.queryByText(/John's Birthday/i)).not.toBeInTheDocument();
  });

  it("marks all notifications as read", () => {
    render(<InboxContainer />);
    const p = screen.getByText(/John's Birthday/i);
    expect(p).toHaveStyle({ opacity: "1" });

    fireEvent.click(screen.getByText("Mark All as Read"));
    expect(p).toHaveStyle({ opacity: "0.6" });
  });

  it("shows mobile filter when triggered", () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Open Filter"));
    expect(screen.getByText("Mobile Filter Visible")).toBeInTheDocument();
  });

  it("selects tab from mobile filter", () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Open Filter"));
    fireEvent.click(screen.getByText("Select Invitations"));
    expect(screen.getByText(/John's Birthday/i)).toBeInTheDocument();
    expect(screen.queryByText(/Alex contributed/i)).not.toBeInTheDocument();
  });

  it("closes the mobile filter", () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Open Filter"));
    fireEvent.click(screen.getByText("Close Filter"));
    expect(screen.queryByText("Mobile Filter Visible")).not.toBeInTheDocument();
  });

  it("marks single notification as read on click", () => {
    Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
  });

    render(<InboxContainer />);
    const notif = screen.getByText(/Maria's Wedding/i);
    expect(notif).toHaveStyle({ opacity: "1" });
    fireEvent.click(notif);
    expect(notif).toHaveStyle({ opacity: "0.6" });
  });
});
