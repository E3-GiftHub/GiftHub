import React from "react";
import { render, screen } from "@testing-library/react";
import InboxContainerHeader from "../components/ui/InboxContainerHeader";

describe("InboxContainerHeader", () => {
  it("renders the header with correct props", () => {
    render(
      <InboxContainerHeader
        activeTab="All"
        onTabChange={jest.fn()}
        onOpenMobileFilter={jest.fn()}
        totalCount={3}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});