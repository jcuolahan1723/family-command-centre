// src/hooks/useOutlookCalendar.js
import { useState, useEffect, useCallback } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import { MSAL_CONFIG, GRAPH_SCOPES } from "../config/auth";

let msalInstance = null;
function getMsal() {
  if (!msalInstance) msalInstance = new PublicClientApplication(MSAL_CONFIG);
  return msalInstance;
}

export function useOutlookCalendar() {
  const [events, setEvents]       = useState([]);
  const [isSignedIn, setSignedIn] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const msal = getMsal();
    msal.initialize().then(() => {
      const accounts = msal.getAllAccounts();
      if (accounts.length > 0) {
        setSignedIn(true);
        fetchEvents();
      }
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, []); // eslint-disable-line

  const getToken = useCallback(async () => {
    const msal = getMsal();
    const accounts = msal.getAllAccounts();
    if (accounts.length === 0) throw new Error("Not signed in");
    const result = await msal.acquireTokenSilent({
      scopes: GRAPH_SCOPES,
      account: accounts[0],
    });
    return result.accessToken;
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const client = Client.init({
        authProvider: (done) => done(null, token),
      });
      const now = new Date().toISOString();
      const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const res = await client
        .api("/me/calendarView")
        .query({ startDateTime: now, endDateTime: twoWeeksLater })
        .select("subject,start,end,location,isAllDay")
        .orderby("start/dateTime")
        .top(100)
        .get();

      const items = (res.value || []).map(ev => ({
        id:       ev.id,
        title:    ev.subject || "Untitled",
        start:    ev.start.dateTime || ev.start.date,
        end:      ev.end?.dateTime || ev.end?.date,
        allDay:   ev.isAllDay,
        location: ev.location?.displayName || "",
        source:   "outlook",
      }));
      setEvents(items);
    } catch (e) {
      setError(e.message || "Failed to fetch Outlook events");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const signIn = useCallback(async () => {
    const msal = getMsal();
    try {
      await msal.loginPopup({ scopes: GRAPH_SCOPES });
      setSignedIn(true);
      await fetchEvents();
    } catch (e) {
      setError(e.message);
    }
  }, [fetchEvents]);

  const signOut = useCallback(() => {
    const msal = getMsal();
    const accounts = msal.getAllAccounts();
    if (accounts.length > 0) msal.logoutPopup({ account: accounts[0] });
    setSignedIn(false);
    setEvents([]);
  }, []);

  return { events, isSignedIn, loading, error, signIn, signOut, refetch: fetchEvents };
}
