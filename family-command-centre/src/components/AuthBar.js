// src/components/AuthBar.js
import React from "react";

export default function AuthBar({ google, outlook }) {
  return (
    <div className="auth-bar">
      <div className="auth-item">
        {google.isSignedIn ? (
          <>
            <span className="auth-badge connected">✓ Google</span>
            <button className="auth-link" onClick={google.signOut}>Sign out</button>
          </>
        ) : (
          <button className="auth-btn google" onClick={google.signIn} disabled={google.loading}>
            {google.loading ? "Loading…" : "Connect Google"}
          </button>
        )}
        {google.error && <span className="auth-error" title={google.error}>⚠</span>}
      </div>

      <div className="auth-item">
        {outlook.isSignedIn ? (
          <>
            <span className="auth-badge connected">✓ Outlook</span>
            <button className="auth-link" onClick={outlook.signOut}>Sign out</button>
          </>
        ) : (
          <button className="auth-btn microsoft" onClick={outlook.signIn} disabled={outlook.loading}>
            {outlook.loading ? "Loading…" : "Connect Outlook"}
          </button>
        )}
        {outlook.error && <span className="auth-error" title={outlook.error}>⚠</span>}
      </div>
    </div>
  );
}
