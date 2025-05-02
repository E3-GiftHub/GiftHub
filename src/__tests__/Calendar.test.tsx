import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Calendar from "../components/ui/Calendar";
import "@testing-library/jest-dom";
import { format } from "date-fns";

describe("Calendar component", () => {
  test("renders calendar header with current month and year", () => {
    render(<Calendar />);
    const today = new Date();
    const expectedHeader = format(today, "MMMM yyyy");
    expect(screen.getByText(expectedHeader)).toBeInTheDocument();
  });

  test("renders all weekday headers", () => {
    render(<Calendar />);
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test("renders at least 28 day cells", () => {
    render(<Calendar />);
    const dayCells = screen.getAllByText(/^\d+$/); // any digit-only text
    expect(dayCells.length).toBeGreaterThanOrEqual(28); // minimal case
  });

  test("highlights preselected dates (e.g., 8 and 23 April 2025)", () => {
    render(<Calendar />);
    const selectedDates = ["8", "23"];
    selectedDates.forEach((day) => {
      const dateElement = screen.getByText(day);
      expect(dateElement.parentElement).toHaveClass("selected");
    });
  });

  test("disabled class is applied to out-of-month days", () => {
    render(<Calendar />);
    const disabledCells = document.querySelectorAll(".disabled");
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  test("clicking '>' navigates to next month", () => {
    render(<Calendar />);
    const nextButton = screen.getByText(">");
    const currentMonth = screen.getByText(format(new Date(), "MMMM yyyy"));
    fireEvent.click(nextButton);
    expect(screen.getByText(currentMonth.textContent ?? "")).not.toBeInTheDocument();
  });

  test("clicking '<' navigates to previous month", () => {
    render(<Calendar />);
    const prevButton = screen.getByText("<");
    const currentMonth = screen.getByText(format(new Date(), "MMMM yyyy"));
    fireEvent.click(prevButton);
    expect(screen.getByText(currentMonth.textContent ?? "")).not.toBeInTheDocument();
  });
});
