import React from "react";
import { render, screen } from "@testing-library/react";
import { Container, ContainerBorderStyle } from "../components/ui/Container";

describe("Container", () => {
  it("renders children inside", () => {
    render(<Container>Test Content</Container>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies top border style when ContainerBorderStyle.TOP is passed", () => {
    const { container } = render(
      <Container borderStyle={ContainerBorderStyle.TOP}>Top Border</Container>,
    );
    expect(container.firstChild).toHaveClass("container-border-top");
  });

  it("applies bottom border style when ContainerBorderStyle.BOTTOM is passed", () => {
    const { container } = render(
      <Container borderStyle={ContainerBorderStyle.BOTTOM}>
        Bottom Border
      </Container>,
    );
    expect(container.firstChild).toHaveClass("container-border-bottom");
  });
});
