// src/hooks/useGoogleCalendar.js
import { useState, useEffect, useCallback } from "react";
import { GOOGLE_CONFIG } from "../config/auth";

const GAPI_URL = "https://apis.google.com/js/api.js";

export function useGoogleCalendar() {
  const [events, setEvents]       = useState([]);
  const [isSignedIn, setSignedIn] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Load gapi script once
  useEffect(() => {
    if (window.gapi) { initClient(); return; }
    const script = document.createElement("script");
    script.src = GAPI_URL;
    script.onload = initClient;
    script.onerror = () => setError("Failed to load Google API");
    document.body.appendChild(script);
  }, []); // eslint-disable-line

  const initClient = useCallback(() => {
    window.gapi.load("client:auth2", async () => {
      try {
       const initClient = useCallback(() => {
        window.gapi.load("client:auth2", async () => {
        try {
        await window.gapi.client.init({
        clientId: GOOGLE_CONFIG.clientId,
        discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
        scope: GOOGLE_CONFIG.scopes,
      });
      const authInstance = window.gapi.auth2.getAuthInstance();
      setSignedIn(authInstance.isSignedIn.get());
      authInstance.isSignedIn.listen(setSignedIn);
      if (authInstance.isSignedIn.get()) await fetchEvents();
      setLoading(false);
    } catch (e) {
      setError(e.details || e.message || "Google auth error");
      setLoading(false);
    }
  });
}, []); // eslint-disable-line await window.gapi.client.init({
          clientId: GOOGLE_CONFIG.clientId,
          discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
          scope: GOOGLE_CONFIG.scopes,
        });
        const authInstance = window.gapi.auth2.getAuthInstance();
        setSignedIn(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(setSignedIn);
        if (authInstance.isSignedIn.get()) await fetchEvents();
        setLoading(false);
      } catch (e) {
        setError(e.details || e.message || "Google auth error");
        setLoading(false);
      }
    });
  }, []); // eslint-disable-line

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);

    try {
      const allEvents = [];
      for (const calId of GOOGLE_CONFIG.calendarIds) {
        const res = await window.gapi.client.calendar.events.list({
          calendarId: calId,
          timeMin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          timeMax: twoWeeksLater.toISOString(),
          showDeleted: false,
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 100,
        });
        console.log("Google calendar response:", res.result);
        console.log("Items found:", res.result.items ? res.result.items.length : 0);
        const items = res.result.items || [];
        items.forEach(ev => {
          allEvents.push({
            id:       ev.id,
            title:    ev.summary || "Untitled",
            start:    ev.start.dateTime || ev.start.date,
            end:      ev.end?.dateTime || ev.end?.date,
            allDay:   !ev.start.dateTime,
            location: ev.location || "",
            source:   "google",
            calId,
          });
        });
      }
      setEvents(allEvents);
    } catch (e) {
      setError(e.result?.error?.message || "Failed to fetch Google events");
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(() => {
  window.gapi.auth2.getAuthInstance().signIn({
      prompt: "consent",
      scope: GOOGLE_CONFIG.scopes,
    }).then(fetchEvents);
    }, [fetchEvents]);

  const signOut = useCallback(() => {
    window.gapi.auth2.getAuthInstance().signOut();
    setEvents([]);
  }, []);

  return { events, isSignedIn, loading, error, signIn, signOut, refetch: fetchEvents };
}
