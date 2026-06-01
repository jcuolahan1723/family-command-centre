// src/utils/calendarUtils.js
import { format, isSameDay, parseISO, startOfWeek, addDays } from "date-fns";
import { FAMILY_MEMBERS, SPORTS_KEYWORDS } from "../config/auth";

// ---- Date helpers ----
export function getWeekDays(baseDate = new Date()) {
  const start = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function parseEventDate(dateStr) {
  if (!dateStr) return null;
  // Google returns "2025-05-14T16:30:00+10:00" or "2025-05-14" for all-day
  try { return parseISO(dateStr); } catch { return new Date(dateStr); }
}

export function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = parseEventDate(dateStr);
  return format(d, "h:mma").toLowerCase();
}

export function formatDate(date) {
  return format(date, "EEE d MMM");
}

// ---- Merge google + outlook events into one list ----
// Each event gets an assigned "member" based on which calendar it came from.
// You can extend this mapping by checking calId or event title patterns.
export function mergeAndAssignEvents(googleEvents, outlookEvents) {
  const assigned = [];

  googleEvents.forEach(ev => {
    const member = guessMemberFromCalId(ev.calId) || FAMILY_MEMBERS[0];
    assigned.push({ ...ev, member });
  });

  outlookEvents.forEach(ev => {
    // Outlook = Dad's work calendar by default
    const member = FAMILY_MEMBERS.find(m => m.calSource === "outlook") || FAMILY_MEMBERS[1];
    assigned.push({ ...ev, member });
  });

  return assigned.sort((a, b) =>
    parseEventDate(a.start) - parseEventDate(b.start)
  );
}

function guessMemberFromCalId(calId) {
  if (!calId) return FAMILY_MEMBERS[0];
  return FAMILY_MEMBERS.find(function(m) {
    return m.calId === calId;
  }) || FAMILY_MEMBERS[0];
}

// ---- Events for a specific day ----
export function eventsForDay(allEvents, day) {
  return allEvents.filter(ev => {
    const start = parseEventDate(ev.start);
    return start && isSameDay(start, day);
  });
}

// ---- Sports filter ----
export function isSportsEvent(event) {
  const title = (event.title || "").toLowerCase();
  return SPORTS_KEYWORDS.some(kw => title.includes(kw.toLowerCase()));
}

export function getSportsEvents(allEvents) {
  const now = new Date();
  return allEvents
    .filter(ev => isSportsEvent(ev) && parseEventDate(ev.start) >= now)
    .sort((a, b) => parseEventDate(a.start) - parseEventDate(b.start));
}

// ---- Clash detection ----
// A "clash" = 2+ events overlapping in time for different people
export function detectClashes(allEvents) {
  const clashes = [];
  const sorted = [...allEvents]
    .filter(ev => !ev.allDay)
    .sort((a, b) => parseEventDate(a.start) - parseEventDate(b.start));

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i], b = sorted[j];
      const aStart = parseEventDate(a.start), aEnd = parseEventDate(a.end || a.start);
      const bStart = parseEventDate(b.start);

      if (bStart >= aEnd) break; // sorted — no more overlaps possible with a

      if (a.member?.id !== b.member?.id) {
        clashes.push({ event1: a, event2: b });
      }
    }
  }
  return clashes;
}
