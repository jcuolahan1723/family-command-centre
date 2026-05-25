// src/components/SportsView.js
import React from "react";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { parseEventDate, formatTime } from "../utils/calendarUtils";

const SPORT_EMOJIS = {
  soccer: "⚽", football: "⚽", rugby: "🏉", swim: "🏊", swimming: "🏊",
  basketball: "🏀", netball: "🏐", tennis: "🎾", cricket: "🏏",
  hockey: "🏑", gymnastics: "🤸", dance: "💃", athletics: "🏃",
  default: "🏆",
};

function getSportEmoji(title) {
  const lower = title.toLowerCase();
  for (const [kw, emoji] of Object.entries(SPORT_EMOJIS)) {
    if (lower.includes(kw)) return emoji;
  }
  return SPORT_EMOJIS.default;
}

function getWhenLabel(dateStr) {
  const d = parseEventDate(dateStr);
  if (!d) return "";
  if (isToday(d))    return { label: "Today",    cls: "badge-today"    };
  if (isTomorrow(d)) return { label: "Tomorrow", cls: "badge-tomorrow" };
  const diff = differenceInDays(d, new Date());
  if (diff <= 7)     return { label: `In ${diff}d`,  cls: "badge-week"     };
  return { label: format(d, "d MMM"), cls: "badge-later" };
}

export default function SportsView({ events }) {
  if (events.length === 0) {
    return (
      <div className="empty-day">
        <span>🏆</span>
        <p>No upcoming sports events detected. Make sure sport events are in your calendar with sport keywords (soccer, swim, rugby, etc.).</p>
      </div>
    );
  }

  return (
    <div className="sports-view">
      <h2 className="section-title">Upcoming sports &amp; training</h2>
      <div className="sports-list">
        {events.map(ev => {
          const d = parseEventDate(ev.start);
          const when = getWhenLabel(ev.start);
          return (
            <div key={ev.id} className="sport-card">
              <div className="sport-emoji">{getSportEmoji(ev.title)}</div>
              <div className="sport-info">
                <div className="sport-name">{ev.title}</div>
                <div className="sport-meta">
                  {d && format(d, "EEE d MMM")} · {formatTime(ev.start)}
                  {ev.location && <span> · 📍 {ev.location}</span>}
                </div>
                {ev.member && (
                  <div className="sport-who" style={{ color: ev.member.color, background: ev.member.bg }}>
                    {ev.member.name}
                  </div>
                )}
              </div>
              {when && <div className={`sport-badge ${when.cls}`}>{when.label}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
