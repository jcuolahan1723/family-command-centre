// src/App.js
import React, { useState, useMemo } from "react";
import { useGoogleCalendar } from "./hooks/useGoogleCalendar";
import { useOutlookCalendar } from "./hooks/useOutlookCalendar";
import { mergeAndAssignEvents, detectClashes, getSportsEvents, getWeekDays } from "./utils/calendarUtils";
import WeekView from "./components/WeekView";
import TodayView from "./components/TodayView";
import SportsView from "./components/SportsView";
import MealPlanner from "./components/MealPlanner";
import ChoreBoard from "./components/ChoreBoard";
import AuthBar from "./components/AuthBar";
import "./styles/app.css";

const TABS = [
  { id: "week",   label: "Week",   icon: "📅" },
  { id: "today",  label: "Today",  icon: "☀️" },
  { id: "sports", label: "Sports", icon: "🏆" },
  { id: "meals",  label: "Meals",  icon: "🍽️" },
  { id: "chores", label: "Chores", icon: "✅" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("week");
  const [weekOffset, setWeekOffset] = useState(0);

  const google  = useGoogleCalendar();
  const outlook = useOutlookCalendar();

  const allEvents = useMemo(
    () => mergeAndAssignEvents(google.events, outlook.events),
    [google.events, outlook.events]
  );

  const clashes      = useMemo(() => detectClashes(allEvents), [allEvents]);
  const sportsEvents = useMemo(() => getSportsEvents(allEvents), [allEvents]);
  const weekDays     = useMemo(() => getWeekDays(new Date(Date.now() + weekOffset * 7 * 86400000)), [weekOffset]);

  const isLoading = google.loading || outlook.loading;
  const bothSignedIn = google.isSignedIn && outlook.isSignedIn;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">FC</div>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
            title={t.label}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </aside>

      <div className="main-wrapper">
        <header className="top-bar">
          <div>
            <h1 className="app-title">Family Command Centre</h1>
            <p className="app-sub">
              {isLoading ? "Syncing calendars…" : bothSignedIn
                ? `${allEvents.length} events loaded · ${clashes.length} clash${clashes.length !== 1 ? "es" : ""} detected`
                : "Connect your calendars to get started"}
            </p>
          </div>
          <AuthBar google={google} outlook={outlook} />
        </header>

        {!bothSignedIn && (
          <div className="connect-prompt">
            <p>👋 Connect Google Calendar and Outlook to see your family schedule.</p>
          </div>
        )}

        {clashes.length > 0 && activeTab !== "today" && (
          <div className="clash-banner">
            <span>⚠️</span>
            <span>
              <strong>{clashes.length} scheduling clash{clashes.length !== 1 ? "es" : ""} this week</strong>
              {" — "}
              {clashes.slice(0, 2).map((c, i) =>
                `${c.event1.member?.name} (${c.event1.title}) & ${c.event2.member?.name} (${c.event2.title}) overlap`
              ).join("; ")}
            </span>
          </div>
        )}

        <main className="content">
          {activeTab === "week" && (
            <WeekView
              events={allEvents}
              weekDays={weekDays}
              weekOffset={weekOffset}
              onPrev={() => setWeekOffset(o => o - 1)}
              onNext={() => setWeekOffset(o => o + 1)}
              onToday={() => setWeekOffset(0)}
            />
          )}
          {activeTab === "today" && (
            <TodayView events={allEvents} clashes={clashes} />
          )}
          {activeTab === "sports" && (
            <SportsView events={sportsEvents} />
          )}
          {activeTab === "meals" && <MealPlanner />}
          {activeTab === "chores" && <ChoreBoard />}
        </main>
      </div>
    </div>
  );
}
