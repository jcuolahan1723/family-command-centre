// src/components/CountdownWidget.js
/* eslint-disable */
import { useState, useEffect } from "react";
import { format, differenceInDays, parseISO } from "date-fns";

const STORAGE_KEY = "fcc_countdowns";

function loadCountdowns() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function saveCountdowns(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export default function CountdownWidget() {
  const [countdowns, setCountdowns] = useState(loadCountdowns);
  const [adding, setAdding]         = useState(false);
  const [newName, setNewName]       = useState("");
  const [newDate, setNewDate]       = useState("");

  useEffect(function() {
    saveCountdowns(countdowns);
  }, [countdowns]);

  function addCountdown() {
    if (!newName.trim() || !newDate) return;
    var item = {
      id:   Date.now(),
      name: newName.trim(),
      date: newDate,
    };
    setCountdowns(function(prev) { return prev.concat(item); });
    setNewName("");
    setNewDate("");
    setAdding(false);
  }

  function removeCountdown(id) {
    setCountdowns(function(prev) { return prev.filter(function(c) { return c.id !== id; }); });
  }

  var today = new Date();
  var active = countdowns
    .map(function(c) {
      var days = differenceInDays(parseISO(c.date), today);
      return Object.assign({}, c, { days: days });
    })
    .filter(function(c) { return c.days >= 0; })
    .sort(function(a, b) { return a.days - b.days; });

  return (
    <div className="countdown-widget">
      <div className="countdown-header">
        <div className="countdown-title">📅 Countdowns</div>
        <button className="countdown-add" onClick={function() { setAdding(true); }}>+ Add</button>
      </div>

      {active.length === 0 && !adding && (
        <div style={{ color: "var(--muted2)", fontSize: 14 }}>
          No countdowns yet — add a holiday or event!
        </div>
      )}

      <div className="countdown-list">
        {active.map(function(c) {
          var daysClass = c.days <= 3 ? "very-soon" : c.days <= 14 ? "soon" : "";
          return (
            <div key={c.id} className="countdown-item">
              <div className={"countdown-days " + daysClass}>
                {c.days === 0 ? "🎉" : c.days}
                {c.days > 0 && <span style={{ fontSize: 14, color: "var(--muted2)", marginLeft: 2 }}>d</span>}
              </div>
              <div className="countdown-info">
                <div className="countdown-name">{c.name}</div>
                <div className="countdown-date">
                  {format(parseISO(c.date), "EEE d MMM yyyy")}
                </div>
              </div>
              <button className="countdown-delete" onClick={function() { removeCountdown(c.id); }}>×</button>
            </div>
          );
        })}
      </div>

      {adding && (
        <div className="countdown-form">
          <input
            autoFocus
            placeholder="Event name (e.g. Bali Holiday)"
            value={newName}
            onChange={function(e) { setNewName(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") addCountdown(); if (e.key === "Escape") setAdding(false); }}
          />
          <div className="countdown-form-row">
            <input
              type="date"
              value={newDate}
              onChange={function(e) { setNewDate(e.target.value); }}
              style={{ flex: 1 }}
            />
            <button className="countdown-save" onClick={addCountdown}>Save</button>
            <button className="countdown-cancel" onClick={function() { setAdding(false); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
