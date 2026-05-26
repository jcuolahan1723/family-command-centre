/* eslint-disable */
import { useState, useEffect } from "react";
import { GOOGLE_CONFIG } from "../config/auth";

export function useGoogleCalendar() {
  const [events, setEvents] = useState([]);
  const [isSignedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);

  useEffect(function() {
    loadScripts();
  }, []);

  function loadScripts() {
    var gisLoaded = false;
    var gapiLoaded = false;

    var gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.onload = function() {
      gisLoaded = true;
      if (gapiLoaded) initTokenClient();
    };
    document.body.appendChild(gisScript);

    var gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.onload = function() {
      window.gapi.load("client", function() {
        window.gapi.client.init({
          discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
        }).then(function() {
          gapiLoaded = true;
          if (gisLoaded) initTokenClient();
        });
      });
    };
    document.body.appendChild(gapiScript);
  }

  function initTokenClient() {
    var client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CONFIG.clientId,
      scope: GOOGLE_CONFIG.scopes,
      callback: function(response) {
        if (response.error) {
          setError(response.error);
          return;
        }
        setSignedIn(true);
        fetchEvents();
      },
    });
    setTokenClient(client);
  }

  function signIn() {
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      setError("Google not loaded yet, please try again");
    }
  }

  function signOut() {
    var token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken(null);
    }
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

  return {
    events: events,
    isSignedIn: isSignedIn,
    loading: loading,
    error: error,
    signIn: signIn,
    signOut: signOut,
    refetch: fetchEvents
  };
}
