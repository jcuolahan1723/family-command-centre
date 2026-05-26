/* eslint-disable */
import { useState, useEffect } from "react";
import { GOOGLE_CONFIG } from "../config/auth";

export function useGoogleCalendar() {
  const [events, setEvents] = useState([]);
  const [isSignedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function loadGapi() {
    if (window.gapi) { setup(); return; }
    var s = document.createElement("script");
    s.src = "https://apis.google.com/js/api.js";
    s.onload = setup;
    document.body.appendChild(s);
  }

  function setup() {
    window.gapi.load("client:auth2", function() {
      window.gapi.client.init({
        clientId: GOOGLE_CONFIG.clientId,
        discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
        scope: GOOGLE_CONFIG.scopes,
      }).then(function() {
        var auth = window.gapi.auth2.getAuthInstance();
        setSignedIn(auth.isSignedIn.get());
        auth.isSignedIn.listen(setSignedIn);
      });
    });
  }

  useEffect(function() { loadGapi(); }, []);

  function signIn() {
    window.gapi.auth2.getAuthInstance().signIn({
      prompt: "consent"
    }).then(function() {
      setSignedIn(true);
      fetchEvents();
    });
  }

  function signOut() {
    window.gapi.auth2.getAuthInstance().signOut();
    setSignedIn(false);
    setEvents([]);
  }

  function fetchEvents() {
    setLoading(true);
    var now = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    var later = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);
    var all = [];
    var pending = GOOGLE_CONFIG.calendarIds.length;

    GOOGLE_CONFIG.calendarIds.forEach(function(calId) {
      window.gapi.client.calendar.events.list({
        calendarId: calId,
        timeMin: now.toISOString(),
        timeMax: later.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 100,
      }).then(function(res) {
        var items = res.result.items || [];
        console.log("Events from", calId, items.length);
        items.forEach(function(ev) {
          all.push({
            id: ev.id,
            title: ev.summary || "Untitled",
            start: ev.start.dateTime || ev.start.date,
            end: ev.end ? (ev.end.dateTime || ev.end.date) : null,
            allDay: !ev.start.dateTime,
            location: ev.location || "",
            source: "google",
            calId: calId,
          });
        });
        pending--;
        if (pending === 0) {
          setEvents(all);
          setLoading(false);
        }
      }).catch(function(e) {
        console.error("Error fetching", calId, e);
        setError("Failed to fetch calendar");
        setLoading(false);
      });
    });
  }

  return { events: events, isSignedIn: isSignedIn, loading: loading, error: error, signIn: signIn, signOut: signOut, refetch: fetchEvents };
} 
