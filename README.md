# 🏠 Family Command Centre

A family dashboard that combines **Google Calendar**, **Microsoft Outlook**, a **meal planner**, and a **chore board** — all in one tablet-friendly web app hosted free on GitHub Pages.

---

## ✨ Features

| Tab | What it does |
|-----|-------------|
| 📅 Week | 7-day grid, colour-coded by family member, clash alerts |
| ☀️ Today | Timeline view of today's events with clash warnings |
| 🏆 Sports | Auto-filtered upcoming sports fixtures across all kids |
| 🍽️ Meals | Editable weekly meal planner (saves locally) |
| ✅ Chores | Per-child chore board with progress bar, resets weekly |

---

## 🚀 One-time setup (about 30 minutes)

### Step 1 — Fork & clone this repo

```bash
git clone https://github.com/YOUR_USERNAME/family-command-centre.git
cd family-command-centre
npm install
```

---

### Step 2 — Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Create a new project** → name it "Family Command Centre"
3. **APIs & Services → Enable APIs** → search for and enable **Google Calendar API**
4. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: Family Command Centre
   - Authorised JavaScript origins: `https://YOUR_USERNAME.github.io`
   - (Also add `http://localhost:3000` for local dev)
5. Copy the **Client ID**

---

### Step 3 — Microsoft Azure (you already have credentials)

1. Go to [Azure Portal](https://portal.azure.com/)
2. **Azure Active Directory → App registrations → New registration**
   - Name: Family Command Centre
   - Supported account types: **Accounts in any organisational directory and personal Microsoft accounts**
   - Redirect URI: **Single-page application (SPA)** → `https://YOUR_USERNAME.github.io`
   - (Also add `http://localhost:3000` for local dev)
3. **API permissions → Add a permission → Microsoft Graph → Delegated**
   - Add: `Calendars.Read` and `User.Read`
   - Click **Grant admin consent** (if you're the Azure admin)
4. Copy the **Application (client) ID** from the Overview page

---

### Step 4 — Configure the app

Edit `src/config/auth.js`:

```js
export const GOOGLE_CONFIG = {
  clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  calendarIds: [
    "primary",             // Your Gmail
    "partner@gmail.com",   // Partner's Gmail (they must share with you)
  ],
  ...
};

export const MSAL_CONFIG = {
  auth: {
    clientId: "YOUR_AZURE_APP_CLIENT_ID",
    ...
  },
};

export const FAMILY_MEMBERS = [
  { id: "mum",  name: "Mum",   color: "#3b82f6", calSource: "google"  },
  { id: "dad",  name: "Dad",   color: "#22c55e", calSource: "outlook" },
  { id: "liam", name: "Liam",  color: "#a855f7", calSource: "google"  },
  // ... update names for your kids
];
```

Update family members' names and colours to match your family.

---

### Step 5 — Add GitHub Secrets

In your GitHub repo → **Settings → Secrets and variables → Actions**:

| Secret name | Value |
|-------------|-------|
| `REACT_APP_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `REACT_APP_AZURE_CLIENT_ID` | Your Azure App Client ID |

Then update `src/config/auth.js` to use env vars:

```js
clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
```

---

### Step 6 — Enable GitHub Pages

1. Repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / root

---

### Step 7 — Deploy

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

GitHub Actions will automatically build and deploy. Your app will be live at:
`https://YOUR_USERNAME.github.io/family-command-centre`

---

## 🖥️ Running locally

```bash
npm start
```

Opens at `http://localhost:3000`. You'll need to add this URL to your Google and Azure allowed origins.

---

## 📅 Calendar mapping

Events are automatically assigned to family members based on which calendar they come from.

- `primary` Google Calendar → Mum
- Partner's shared Google Calendar → assign by email in `calendarIds`
- Outlook → Dad's work calendar

For **kids' calendars**: add their school or sports calendar IDs to `GOOGLE_CONFIG.calendarIds`. Google often provides public `.ics` feeds for school sport schedules — these can be imported into a shared Google Calendar.

---

## 🏆 Sports auto-detection

Any calendar event whose title contains sport keywords (soccer, swim, rugby, etc.) automatically appears in the Sports tab. Edit `SPORTS_KEYWORDS` in `auth.js` to add your kids' specific sports.

---

## 📱 Tablet setup

For the best wall-mounted experience:
- Open the app in **Chrome** on your tablet
- Tap the **share button → Add to Home Screen** (iOS) or **Install app** (Android)
- The app works offline once loaded (meals + chores always available)

---

## 🔧 Customisation

| File | What to change |
|------|---------------|
| `src/config/auth.js` | Family members, colours, calendar IDs, chores |
| `src/styles/app.css` | Visual theme, colours |
| `src/components/ChoreBoard.js` | Chore logic |
| `src/components/MealPlanner.js` | Meal slots (add Breakfast etc.) |

---

## 🆘 Troubleshooting

**Google Calendar not loading** — Check your Client ID in `auth.js` and ensure `http://localhost:3000` (or your Pages URL) is in Authorised JS origins.

**Outlook sign-in fails** — Ensure your Azure Redirect URI exactly matches `window.location.origin`. Check API permissions include `Calendars.Read`.

**Events not showing for kids** — Partner needs to share their Google Calendar with your account, or add their calendar ID to `calendarIds`.
