// src/components/WeekView.js
import React from "react";
import { format, isToday } from "date-fns";
import { eventsForDay, formatTime } from "../utils/calendarUtils";

export default function WeekView({ events, weekDays, weekOffset, onPrev, onNext, onToday }) {
  return (
    <div className="week-view">
      <div className="week-nav">
        <button className="week-btn" onClick={onPrev}>← Prev</button>
        <span className="week-range">
          {format(weekDays[0], "d MMM")} – {format(weekDays[6], "d MMM yyyy")}
        </span>
        {weekOffset !== 0 && (
          <button className="week-btn" onClick={onToday}>Today</button>
        )}
        <button className="week-btn" onClick={onNext}>Next →</button>
      </div>

      <div className="week-grid">
        {weekDays.map(day => {
          const dayEvents = eventsForDay(events, day);
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className={`day-col ${today ? "today" : ""}`}>
              <div className="day-header">
                <span className="day-name">{format(day, "EEE")}</span>
                <span className={`day-num ${today ? "today-num" : ""}`}>{format(day, "d")}</span>
              </div>

              <div className="day-events">
                {dayEvents.length === 0 ? (
                  <div className="no-events">—</div>
                ) : (
                  dayEvents.map(ev => (
                    <EventChip key={ev.id} event={ev} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventChip({ event }) {
  const { member, title, start, allDay, location } = event;
  const color  = member?.color  || "#64748b";
  const bg     = member?.bg     || "#f8fafc";

  return (
    <div
      className="event-chip"
      style={{ background: bg, borderLeftColor: color }}
      title={`${title}${location ? ` · ${location}` : ""}`}
    >
      <div className="ev-name" style={{ color }}>{title}</div>
      <div className="ev-meta">
        {allDay ? "All day" : formatTime(start)}
        {member && <span className="ev-who"> · {member.name}</span>}
      </div>
    </div>
  );
}
