// src/components/MealPlanner.js
import React, { useState, useEffect } from "react";
import { getWeekDays } from "../utils/calendarUtils";
import { format } from "date-fns";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"];
const STORAGE_KEY = "fcc_meals";

function getWeekKey(days) {
  return format(days[0], "yyyy-MM-dd");
}

export default function MealPlanner() {
  const weekDays = getWeekDays();
  const weekKey  = getWeekKey(weekDays);

  const [meals, setMeals]       = useState({});
  const [editing, setEditing]   = useState(null); // "Mon-Dinner"
  const [editValue, setEditValue] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setMeals(saved[weekKey] || {});
    } catch {}
  }, [weekKey]);

  function saveMeals(updated) {
    setMeals(updated);
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      all[weekKey] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }

  function cellKey(day, type) {
    return `${format(day, "EEE")}-${type}`;
  }

  function startEdit(day, type) {
    const key = cellKey(day, type);
    setEditing(key);
    setEditValue(meals[key] || "");
  }

  function commitEdit(day, type) {
    const key = cellKey(day, type);
    const updated = { ...meals, [key]: editValue.trim() };
    saveMeals(updated);
    setEditing(null);
  }

  function handleKeyDown(e, day, type) {
    if (e.key === "Enter") commitEdit(day, type);
    if (e.key === "Escape") setEditing(null);
  }

  return (
    <div className="meal-planner">
      <div className="section-header">
        <h2 className="section-title">Weekly meal planner</h2>
        <p className="section-sub">Tap any cell to edit · Saves automatically</p>
      </div>

      <div className="meal-table-wrapper">
        <table className="meal-table">
          <thead>
            <tr>
              <th></th>
              {weekDays.map(d => (
                <th key={d.toISOString()} className="meal-day-hdr">
                  <div>{format(d, "EEE")}</div>
                  <div className="meal-day-num">{format(d, "d")}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_TYPES.map(type => (
              <tr key={type}>
                <td className="meal-type-label">{type}</td>
                {weekDays.map(day => {
                  const key = cellKey(day, type);
                  const isEditing = editing === key;
                  return (
                    <td key={day.toISOString()} className="meal-cell">
                      {isEditing ? (
                        <input
                          autoFocus
                          className="meal-input"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => commitEdit(day, type)}
                          onKeyDown={e => handleKeyDown(e, day, type)}
                          placeholder="Type meal…"
                        />
                      ) : (
                        <div
                          className={`meal-value ${meals[key] ? "filled" : "empty"}`}
                          onClick={() => startEdit(day, type)}
                        >
                          {meals[key] || <span className="meal-placeholder">+ Add</span>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="meal-tip">
        💡 <strong>Tip:</strong> On nights with sports fixtures, the app highlights the cell automatically. Plan easy meals for those evenings!
      </div>
    </div>
  );
}
