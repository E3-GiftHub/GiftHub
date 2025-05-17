import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InboxNotification from "../components/ui/InboxNotification";
import type { NotificationResponse } from "~/components/ui/InboxContainer";

const mockNotification: NotificationResponse = {
  id: 1,
  text: "Test notification",
  type: "event",
  read: false,
  link: "/test",
  firstName: "John",
  lastName: "Doe",
  profilePicture: undefined,
  notificationDate: "2023-09-15T14:30:00Z",
};

describe("InboxNotification", () => {
  it("renders notification with initials when no profile picture is provided", () => {
    render(
      <InboxNotification
        data={mockNotification}
        onClick={jest.fn()}
        isExpanded={false}
        onExpand={jest.fn()}
      />,
    );

    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getByText("Test notification")).toBeInTheDocument();
  });

  it("renders notification with profile picture when provided", () => {
    const notificationWithPic = {
      ...mockNotification,
      profilePicture: "pic.png",
    };
    render(
      <InboxNotification
        data={notificationWithPic}
        onClick={jest.fn()}
        isExpanded={false}
        onExpand={jest.fn()}
      />,
    );

    expect(screen.getByRole("img")).toHaveAttribute("src", "pic.png");
  });

  it("calls onClick when notification is clicked", () => {
    const onClickMock = jest.fn();
    render(
      <InboxNotification
        data={mockNotification}
        onClick={onClickMock}
        isExpanded={false}
        onExpand={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Test notification"));
    expect(onClickMock).toHaveBeenCalled();
  });

  it("renders options menu when expanded", () => {
    render(
      <InboxNotification
        data={mockNotification}
        onClick={jest.fn()}
        isExpanded={true}
        onExpand={jest.fn()}
      />,
    );

    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Mark as read")).toBeInTheDocument();
  });

  it("calls onExpand when options button is clicked", () => {
    const onExpandMock = jest.fn();
    render(
      <InboxNotification
        data={mockNotification}
        onClick={jest.fn()}
        isExpanded={false}
        onExpand={onExpandMock}
      />,
    );

    fireEvent.click(screen.getByTestId("options-button"));
    expect(onExpandMock).toHaveBeenCalled();
  });
});
