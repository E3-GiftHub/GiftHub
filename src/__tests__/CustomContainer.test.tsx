import React from "react";
import { render, screen } from "@testing-library/react";
import CustomContainer from "../components/ui/CustomContainer";


jest.mock("../../styles/CustomContainer.module.css", () => ({
  container: "container",
}));

describe("CustomContainer", () => {
  it("renders children correctly", () => {
    render(
      <CustomContainer>
        <p>Test content</p>
      </CustomContainer>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("applies default container class", () => {
    const { container } = render(
      <CustomContainer>
        <div>Content</div>
      </CustomContainer>
    );
    expect(container.firstChild).toHaveClass("container");
  });

  it("applies additional className when provided", () => {
    const { container } = render(
      <CustomContainer className="extra-class">
        <div>Another content</div>
      </CustomContainer>
    );
    expect(container.firstChild).toHaveClass("container");
    expect(container.firstChild).toHaveClass("extra-class");
  });
});
