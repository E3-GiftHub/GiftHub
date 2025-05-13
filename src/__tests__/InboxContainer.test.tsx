import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InboxContainer from "../components/ui/InboxContainer";

// Mock pentru stiluri CSS
jest.mock("../../styles/InboxContainer.module.css", () => ({
  separator: "separator",
  notificationList: "notificationList",
}));

// Mock CustomContainer
const MockCustomContainer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
MockCustomContainer.displayName = "MockCustomContainer";
jest.mock("../components/ui/CustomContainer", () => MockCustomContainer);

// Tipuri pentru InboxContainerHeader props
type InboxContainerHeaderProps = {
  onTabChange: (tab: string) => void;
  onMarkAllAsRead: () => void;
  onOpenMobileFilter: () => void;
};

// Mock InboxContainerHeader
const MockInboxContainerHeader = (props: InboxContainerHeaderProps) => (
  <div>
    <p>Header</p>
    <button onClick={() => props.onTabChange("Invitations")}>Go to Invitations</button>
    <button onClick={props.onMarkAllAsRead}>Mark all</button>
    <button onClick={props.onOpenMobileFilter}>Open Filter</button>
  </div>
);
MockInboxContainerHeader.displayName = "MockInboxContainerHeader";
jest.mock("../components/ui/InboxContainerHeader", () => MockInboxContainerHeader);

// Mock MobileFilterMenu
type MobileFilterMenuProps = { visible: boolean };
const MockMobileFilterMenu = (props: MobileFilterMenuProps) =>
  props.visible ? <div>Mobile Menu Visible</div> : null;
MockMobileFilterMenu.displayName = "MockMobileFilterMenu";
jest.mock("../components/ui/MobileFilterMenu", () => MockMobileFilterMenu);

// Testele propriu-zise
describe("InboxContainer", () => {
  it("renders all notifications initially", () => {
    render(<InboxContainer />);
    expect(screen.getByText(/John's Birthday/i)).toBeInTheDocument();
    expect(screen.getByText(/Ana's Baby Shower/i)).toBeInTheDocument();
  });

  it("filters notifications when tab is changed", () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Go to Invitations"));
    expect(screen.getByText(/John's Birthday/i)).toBeInTheDocument();
    expect(screen.queryByText(/Alex contributed/i)).not.toBeInTheDocument();
  });

  it("marks all notifications as read", () => {
    render(<InboxContainer />);
    const notif = screen.getByText(/John's Birthday/i);
    expect(notif).toHaveStyle({ opacity: "1" });

    fireEvent.click(screen.getByText("Mark all"));
    expect(notif).toHaveStyle({ opacity: "0.6" });
  });

  it("shows mobile filter when triggered", () => {
    render(<InboxContainer />);
    fireEvent.click(screen.getByText("Open Filter"));
    expect(screen.getByText("Mobile Menu Visible")).toBeInTheDocument();
  });

  it("marks one notification as read on click", () => {
    render(<InboxContainer />);
    const notif = screen.getByText(/Maria's Wedding/i);
    fireEvent.click(notif);
    expect(notif).toHaveStyle({ opacity: "0.6" });
  });
});
