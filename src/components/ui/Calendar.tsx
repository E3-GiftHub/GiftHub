import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns";
import styles from "../../styles/Calendar.module.css";
import { api } from "~/utils/api";

type CalendarProps = {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
};

export default function Calendar({
  currentDate,
  setCurrentDate,
}: CalendarProps) {
  const { data: events, isLoading } = api.calendar.getEventsByMonth.useQuery({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

  const selectedDates =
    events
      ?.map((event) => (event.date ? new Date(event.date) : null))
      .filter((d): d is Date => d !== null) ?? [];

  const renderHeader = () => (
    <div className={styles.header}>
      <span>{format(currentDate, "MMMM yyyy")}</span>
      <div className={styles.nav}>
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
          {"<"}
        </button>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
          {">"}
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return (
      <div className={styles.days}>
        {days.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isSelected = selectedDates.some((d) => isSameDay(d, cloneDay));
        const isDisabled = !isSameMonth(cloneDay, monthStart);

        days.push(
          <div
            className={`${styles.cell} ${isDisabled ? styles.disabled : ""} ${
              isSelected ? styles.selected : ""
            }`}
            key={cloneDay.toISOString()}
          >
            <span>{format(cloneDay, "d")}</span>
          </div>,
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className={styles.week} key={day.toISOString()}>
          {days}
        </div>,
      );
      days = [];
    }

    return <div className={styles.body}>{rows}</div>;
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading events...</div>;
  }

  return (
    <div className={styles.calendar}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
