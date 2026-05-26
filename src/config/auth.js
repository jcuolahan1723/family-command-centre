// ============================================================
// src/config/auth.js
// Fill in YOUR credentials from Google Cloud Console and Azure
// ========================================================+====

// --- GOOGLE CALENDAR ---
// 1. Go to https://console.cloud.google.com/
// 2. Create a project, enable "Google Calendar API"
// 3. Create OAuth 2.0 credentials (Web application)
// 4. Add your GitHub Pages URL to Authorised JavaScript origins
//    e.g. https://YOUR_GITHUB_USERNAME.github.io
export const GOOGLE_CONFIG = {
  clientId: "315162916664-l1231s9u1gpgru8jveo1u8g5q3kto8ke.apps.googleusercontent.com",
  calendarIds: [
    "jcuolahan@gmail.com",
  ],
  scopes: "https://www.googleapis.com/auth/calendar.readonly",
  discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
};
  scopes: "https://www.googleapis.com/auth/calendar.readonly",
  discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
};

// --- MICROSOFT OUTLOOK ---
// 1. Go to https://portal.azure.com/ (you already have credentials)
// 2. Azure Active Directory > App registrations > New registration
// 3. Name: "Family Command Centre"
// 4. Supported account types: "Personal Microsoft accounts only" (or Accounts in any org)
// 5. Redirect URI: Single-page application (SPA) > https://YOUR_GITHUB_USERNAME.github.io
// 6. Under "API permissions" add: Calendars.Read (delegated)
export const MSAL_CONFIG = {
  auth: {
    clientId: "5461126e-7209-492d-a20c-4fb8f769e291",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const GRAPH_SCOPES = ["Calendars.Read", "User.Read"];

// --- FAMILY MEMBERS ---
// Add/rename each family member and assign a colour
export const FAMILY_MEMBERS = [
  { id: "mum",   name: "Mum",   color: "#3b82f6", bg: "#eff6ff", calSource: "google" },
  { id: "dad",   name: "Dad",   color: "#22c55e", bg: "#f0fdf4", calSource: "outlook" },
  { id: "poppy",  name: "Poppy",  color: "#a855f7", bg: "#fdf4ff", calSource: "google" },
  { id: "tex",  name: "Tex",  color: "#f43f5e", bg: "#fff1f2", calSource: "google" },
  { id: "betty",  name: "Betty",  color: "#f59e0b", bg: "#fffbeb", calSource: "google" },
  { id: "coco",  name: "Coco",  color: "#14b8a6", bg: "#f0fdfa", calSource: "google" },
  { id: "roy",   name: "Roy",   color: "#ec4899", bg: "#fdf2f8", calSource: "google" },
];

// --- SPORTS KEYWORDS ---
// Events containing any of these words (case-insensitive) appear in the Sports tab
export const SPORTS_KEYWORDS = [
  "AFL", "swimming", "basketball","netball", "dance", "crossfit", "upstate",
  "gym", "training", "practice", "game", "match", "meet", "fixture",
];

// --- CHORES (edit weekly defaults here) ---
export const DEFAULT_CHORES = {
  poppy: ["Dishes", "Cooking"],
  tex: ["Pets"],
  betty: ["Bins"],
  coco: ["Laundry"],
  roy:  ["Table"],
};
