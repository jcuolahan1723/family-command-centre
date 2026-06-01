// src/App.js
/* eslint-disable */
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
import WeatherWidget from "./components/WeatherWidget";
import CountdownWidget from "./components/CountdownWidget";
import "./styles/app.css";

const TABS = [
  { id: "week",      label: "Week",    icon: "📅" },
  { id: "today",     label: "Today",   icon: "☀️" },
  { id: "sports",    label: "Sports",  icon: "🏆" },
  { id: "meals",     label: "Meals",   icon: "🍽️" },
  { id: "chores",    label: "Chores",  icon: "✅" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("week");
  const [weekOffset, setWeekOffset] = useState(0);

  const google  = useGoogleCalendar();
  const outlook = useOutlookCalendar();

  const allEvents = useMemo(
    function() { return mergeAndAssignEvents(google.events, outlook.events); },
    [google.events, outlook.events]
  );

  const clashes      = useMemo(function() { return detectClashes(allEvents); }, [allEvents]);
  const sportsEvents = useMemo(function() { return getSportsEvents(allEvents); }, [allEvents]);
  const weekDays     = useMemo(function() {
    return getWeekDays(new Date(Date.now() + weekOffset * 7 * 86400000));
  }, [weekOffset]);

  var isLoading   = google.loading || outlook.loading;
  var eventCount  = allEvents.length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">Cuolahan Planner</div>
        {TABS.map(function(t) {
          return (
            <button
              key={t.id}
              className={"nav-btn " + (activeTab === t.id ? "active" : "")}
              onClick={function() { setActiveTab(t.id); }}
              title={t.label}
            >
              <span className="nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
            </button>
          );
        })}
      </aside>

      <div className="main-wrapper">
        <header className="top-bar">
          <div>
            <h1 className="app-title">Cuolahan Planner</h1>
            <p className="app-sub">
              {isLoading
                ? "Syncing calendars…"
                : eventCount > 0
                  ? eventCount + " events loaded · " + clashes.length + " clash" + (clashes.length !== 1 ? "es" : "") + " detected"
                  : "Connect your calendars to get started"}
            </p>
          </div>
          <AuthBar google={google} outlook={outlook} />
        </header>

        {!google.isSignedIn && (
          <div className="connect-prompt">
            👋 Connect Google Calendar to see your family schedule.
          </div>
        )}

        {clashes.length > 0 && activeTab === "week" && (
          <div className="clash-banner" style={{ margin: "0 32px" }}>
            <span>⚠️</span>
            <span>
              <strong>{clashes.length} scheduling clash{clashes.length !== 1 ? "es" : ""} — </strong>
              {clashes.slice(0, 2).map(function(c, i) {
                return c.event1.member && c.event2.member
                  ? c.event1.member.name + " (" + c.event1.title + ") & " + c.event2.member.name + " (" + c.event2.title + ") overlap"
                  : "";
              }).filter(Boolean).join("; ")}
            </span>
          </div>
        )}

        <main className="content">
          {(activeTab === "week" || activeTab === "today") && (
            <div className="widgets-row">
              <WeatherWidget />
              <CountdownWidget />
            </div>
          )}

          {activeTab === "week" && (
            <WeekView
              events={allEvents}
              weekDays={weekDays}
              weekOffset={weekOffset}
              onPrev={function() { setWeekOffset(function(o) { return o - 1; }); }}
              onNext={function() { setWeekOffset(function(o) { return o + 1; }); }}
              onToday={function() { setWeekOffset(0); }}
            />
          )}
          {activeTab === "today" && (
            <TodayView events={allEvents} clashes={clashes} />
          )}
          {activeTab === "sports" && (
            <SportsView events={sportsEvents} />
          )}
          {activeTab === "meals"  && <MealPlanner />}
          {activeTab === "chores" && <ChoreBoard />}
        </main>
      </div>
    </div>
  );
}
