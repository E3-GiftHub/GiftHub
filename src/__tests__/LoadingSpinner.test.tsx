import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoadingSpinner from "~/components/loadingspinner";

// Mock the CSS module
jest.mock("../styles/LoadingSpinner.module.css", () => ({
  loadingContainer: "loadingContainer",
  spinner: "spinner",
}));

describe("LoadingSpinner", () => {
  test("renders loading spinner container", () => {
    const { container } = render(<LoadingSpinner />);

    const loadingContainer = container.firstChild;
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer).toHaveClass("loadingContainer");
  });

  test("renders spinner element", () => {
    const { container } = render(<LoadingSpinner />);

    const spinnerElement = container.querySelector(".spinner");
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveClass("spinner");
  });

  test("has correct structure", () => {
    const { container } = render(<LoadingSpinner />);

    const outerDiv = container.firstChild;
    expect(outerDiv).toHaveClass("loadingContainer");

    const innerDiv = outerDiv?.firstChild;
    expect(innerDiv).toHaveClass("spinner");
  });

  test("renders without any text content", () => {
    const { container } = render(<LoadingSpinner />);

    expect(container.textContent).toBe("");
  });

  test("renders as a functional component", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test("has proper nested div structure", () => {
    const { container } = render(<LoadingSpinner />);

    const containerDiv = container.firstChild as HTMLElement;
    const spinnerDiv = containerDiv.firstChild as HTMLElement;

    expect(containerDiv.tagName).toBe("DIV");
    expect(spinnerDiv.tagName).toBe("DIV");
    expect(containerDiv.children.length).toBe(1);
  });
});
