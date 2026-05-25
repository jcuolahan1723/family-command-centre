// src/components/ChoreBoard.js
import React, { useState, useEffect } from "react";
import { format, startOfWeek } from "date-fns";
import { FAMILY_MEMBERS, DEFAULT_CHORES } from "../config/auth";

const STORAGE_KEY = "fcc_chores";
const KIDS = FAMILY_MEMBERS.filter(m => !["mum", "dad"].includes(m.id));

function getWeekKey() {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

function loadChores() {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return all[getWeekKey()] || {};
  } catch { return {}; }
}

function saveChores(data) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    all[getWeekKey()] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export default function ChoreBoard() {
  const [chores, setChores]     = useState(loadChores);
  const [newChore, setNewChore] = useState("");
  const [addingFor, setAddingFor] = useState(null);

  useEffect(() => { saveChores(chores); }, [chores]);

  function toggleChore(memberId, chore) {
    const key = `${memberId}::${chore}`;
    setChores(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function addChore(memberId) {
    if (!newChore.trim()) return;
    const key = `custom::${memberId}`;
    setChores(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newChore.trim()],
    }));
    setNewChore("");
    setAddingFor(null);
  }

  function getChoresForMember(memberId) {
    const defaults = DEFAULT_CHORES[memberId] || [];
    const customs  = chores[`custom::${memberId}`] || [];
    return [...defaults, ...customs];
  }

  const weekLabel = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "d MMM");
  const totalDone = KIDS.reduce((acc, m) => {
    return acc + getChoresForMember(m.id).filter(c => chores[`${m.id}::${c}`]).length;
  }, 0);
  const totalAll = KIDS.reduce((acc, m) => acc + getChoresForMember(m.id).length, 0);

  return (
    <div className="chore-board">
      <div className="section-header">
        <div>
          <h2 className="section-title">Chore board</h2>
          <p className="section-sub">Week of {weekLabel} · Resets every Monday</p>
        </div>
        <div className="chore-progress-badge">
          {totalDone}/{totalAll} done
        </div>
      </div>

      <div className="chore-grid">
        {KIDS.map(member => {
          const memberChores = getChoresForMember(member.id);
          const done = memberChores.filter(c => chores[`${member.id}::${c}`]).length;
          const pct  = memberChores.length ? Math.round((done / memberChores.length) * 100) : 0;

          return (
            <div key={member.id} className="chore-card">
              <div className="chore-card-header">
                <div className="chore-avatar" style={{ background: member.bg, color: member.color }}>
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="chore-member-name">{member.name}</div>
                  <div className="chore-progress-text">{done}/{memberChores.length} complete</div>
                </div>
                <div className="chore-pct" style={{ color: member.color }}>{pct}%</div>
              </div>

              <div className="chore-bar">
                <div className="chore-bar-fill" style={{ width: `${pct}%`, background: member.color }} />
              </div>

              <ul className="chore-list">
                {memberChores.map(chore => {
                  const key   = `${member.id}::${chore}`;
                  const isDone = !!chores[key];
                  return (
                    <li
                      key={chore}
                      className={`chore-item ${isDone ? "done" : ""}`}
                      onClick={() => toggleChore(member.id, chore)}
                    >
                      <div className="chore-checkbox" style={{ borderColor: member.color, background: isDone ? member.color : "transparent" }}>
                        {isDone && <span style={{ color: "white", fontSize: 12 }}>✓</span>}
                      </div>
                      <span>{chore}</span>
                    </li>
                  );
                })}
              </ul>

              {addingFor === member.id ? (
                <div className="chore-add-row">
                  <input
                    autoFocus
                    className="chore-input"
                    value={newChore}
                    onChange={e => setNewChore(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addChore(member.id); if (e.key === "Escape") setAddingFor(null); }}
                    placeholder="New chore…"
                  />
                  <button onClick={() => addChore(member.id)} style={{ color: member.color }}>Add</button>
                </div>
              ) : (
                <button className="chore-add-btn" onClick={() => setAddingFor(member.id)} style={{ color: member.color }}>
                  + Add chore
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
