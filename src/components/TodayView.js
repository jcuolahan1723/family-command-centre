// src/components/TodayView.js
import React from "react";
import { format, isToday, parseISO } from "date-fns";
import { eventsForDay, formatTime } from "../utils/calendarUtils";

export default function TodayView({ events, clashes }) {
  const today = new Date();
  const todayEvents = eventsForDay(events, today);

  const now = new Date();
  const upcoming = todayEvents.filter(ev => {
    if (ev.allDay) return true;
    try { return parseISO(ev.start) >= now; } catch { return true; }
  });
  const past = todayEvents.filter(ev => !upcoming.includes(ev));

  return (
    <div className="today-view">
      <div className="today-header">
        <h2>{format(today, "EEEE d MMMM yyyy")}</h2>
        <span className="event-count">{todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""} today</span>
      </div>

      {clashes.filter(c => {
        try { return isToday(parseISO(c.event1.start)); } catch { return false; }
      }).map((clash, i) => (
        <div key={i} className="clash-card">
          <span className="clash-icon">⚠️</span>
          <div>
            <strong>Clash: </strong>
            {clash.event1.title} ({clash.event1.member?.name}) and{" "}
            {clash.event2.title} ({clash.event2.member?.name}) overlap at{" "}
            {formatTime(clash.event1.start)}
          </div>
        </div>
      ))}

      {upcoming.length > 0 && (
        <section className="today-section">
          <h3>Coming up</h3>
          <div className="timeline">
            {upcoming.map(ev => <TimelineEvent key={ev.id} event={ev} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="today-section muted">
          <h3>Earlier today</h3>
          <div className="timeline">
            {past.map(ev => <TimelineEvent key={ev.id} event={ev} done />)}
          </div>
        </section>
      )}

      {todayEvents.length === 0 && (
        <div className="empty-day">
          <span>🎉</span>
          <p>Nothing scheduled today — enjoy the break!</p>
        </div>
      )}
    </div>
  );
}

function TimelineEvent({ event, done }) {
  const { member, title, start, end, allDay, location } = event;
  const color = member?.color || "#64748b";
  const bg    = member?.bg    || "#f8fafc";

  return (
    <div className={`timeline-event ${done ? "done" : ""}`}>
      <div className="tl-time">
        {allDay ? "All day" : (
          <>
            {formatTime(start)}
            {end && <><br/><span className="tl-end">{formatTime(end)}</span></>}
          </>
        )}
      </div>
      <div className="tl-dot" style={{ background: color }} />
      <div className="tl-content" style={{ background: bg, borderColor: color }}>
        <div className="tl-title" style={{ color }}>{title}</div>
        {location && <div className="tl-loc">📍 {location}</div>}
        {member && <div className="tl-who">{member.name}</div>}
      </div>
    </div>
  );
}
