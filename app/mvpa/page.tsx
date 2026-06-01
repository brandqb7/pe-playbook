"use client";

import { useState, useMemo } from "react";
import { CURRICULUM } from "../../data/curriculum";

type Intensity = "light" | "moderate" | "vigorous";

interface Activity {
  id: string;
  name: string;
  icon: string;
  mins: number;
  intensity: Intensity;
  type: "warmup" | "station" | "cooldown" | "instruction";
  stationType?: "skill" | "activity";
}

const INTENSITY_COLORS: Record<Intensity, string> = {
  light: "#6b7280",
  moderate: "#f59e0b",
  vigorous: "#ef4444",
};

const CLASS_MINUTES = 55;

function defaultActivities(weekNum: number): Activity[] {
  const week = CURRICULUM[weekNum];
  const wu: Activity[] = [
    { id: "wu1", name: "High Knees", icon: "🏃", mins: 0.8, intensity: "vigorous", type: "warmup" },
    { id: "wu2", name: "Jumping Jacks", icon: "⭐", mins: 0.8, intensity: "moderate", type: "warmup" },
    { id: "wu3", name: "Arm Circles", icon: "💫", mins: 0.8, intensity: "light", type: "warmup" },
    { id: "wu4", name: "Butt Kicks", icon: "🦵", mins: 0.8, intensity: "vigorous", type: "warmup" },
    { id: "wu5", name: "Side Shuffles", icon: "↔️", mins: 0.8, intensity: "moderate", type: "warmup" },
    { id: "wu6", name: "Inchworms", icon: "🐛", mins: 0.8, intensity: "moderate", type: "warmup" },
    { id: "wu7", name: "Plank Hold", icon: "💪", mins: 0.8, intensity: "moderate", type: "warmup" },
    { id: "wu8", name: "Mountain Climbers", icon: "⛰️", mins: 0.8, intensity: "vigorous", type: "warmup" },
    { id: "wu9", name: "Frankensteins", icon: "🧟", mins: 0.8, intensity: "moderate", type: "warmup" },
    { id: "wu10", name: "Skip in Place", icon: "🎵", mins: 0.8, intensity: "moderate", type: "warmup" },
  ];

  const instruction: Activity[] = [
    { id: "instr", name: "Instruction & Demo", icon: "📋", mins: 5, intensity: "light", type: "instruction" },
  ];

  const s1 = week?.k2_s1 ?? "Skill Station 1";
  const s2 = week?.k2_s2 ?? "Skill Station 2";
  const g1 = week?.k2_g1 ?? "Activity Station 1";
  const g2 = week?.k2_g2 ?? "Activity Station 2";

  const stations: Activity[] = [
    { id: "st1", name: s1, icon: "📘", mins: 4, intensity: "moderate", type: "station", stationType: "skill" },
    { id: "st2", name: s2, icon: "📘", mins: 4, intensity: "moderate", type: "station", stationType: "skill" },
    { id: "st3", name: g1, icon: "🏃", mins: 4, intensity: "vigorous", type: "station", stationType: "activity" },
    { id: "st4", name: g2, icon: "🏃", mins: 4, intensity: "vigorous", type: "station", stationType: "activity" },
  ];

  const cd: Activity[] = [
    { id: "cd1", name: "Latissimus Dorsi", icon: "🧘", mins: 0.39, intensity: "light", type: "cooldown" },
    { id: "cd2", name: "Trapezius Right", icon: "🧘", mins: 0.33, intensity: "light", type: "cooldown" },
    { id: "cd3", name: "Trapezius Left", icon: "🧘", mins: 0.33, intensity: "light", type: "cooldown" },
    { id: "cd4", name: "Deltoids Right", icon: "🧘", mins: 0.33, intensity: "light", type: "cooldown" },
    { id: "cd5", name: "Deltoids Left", icon: "🧘", mins: 0.33, intensity: "light", type: "cooldown" },
    { id: "cd6", name: "Quadriceps Right", icon: "🧘", mins: 0.33, intensity: "light", type: "cooldown" },
    { id: "cd7", name: "Quadriceps Left", icon: "🧘", mins: 0.33, intensity: "light", type: "cooldown" },
    { id: "cd8", name: "Hamstrings Right", icon: "🧘", mins: 0.33, intensity: "light", type: "cooldown" },
    { id: "cd9", name: "Hamstrings Left", icon: "🧘", mins: 0.33, intensity: "light", type: "cooldown" },
    { id: "cd10", name: "Butterfly", icon: "🧘", mins: 0.39, intensity: "light", type: "cooldown" },
  ];

  return [...wu, ...instruction, ...stations, ...cd];
}

function getMvpaStatus(pct: number) {
  if (pct >= 60) return { label: "Excellent", color: "#22c55e", cls: "excellent" };
  if (pct >= 50) return { label: "Goal Met ✓", color: "#84cc16", cls: "good" };
  if (pct >= 40) return { label: "Getting Close", color: "#f59e0b", cls: "caution" };
  if (pct >= 30) return { label: "Below Goal", color: "#f97316", cls: "warning" };
  return { label: "Needs Work", color: "#ef4444", cls: "danger" };
}

export default function MVPAPage() {
  const [weekNum, setWeekNum] = useState(1);
  const [activities, setActivities] = useState<Activity[]>(() => defaultActivities(1));
  const mvpaMins = useMemo(
    () => activities.filter((a) => a.intensity !== "light" && a.type !== "instruction").reduce((a, b) => a + b.mins, 0),
    [activities]
  );
  const mvpaPct = CLASS_MINUTES > 0 ? Math.round((mvpaMins / CLASS_MINUTES) * 100) : 0;
  const status = getMvpaStatus(mvpaPct);

  const warmupMins = useMemo(() => activities.filter((a) => a.type === "warmup").reduce((a, b) => a + b.mins, 0), [activities]);
  const stationMins = useMemo(() => activities.filter((a) => a.type === "station").reduce((a, b) => a + b.mins, 0), [activities]);
  const cdMins = useMemo(() => activities.filter((a) => a.type === "cooldown").reduce((a, b) => a + b.mins, 0), [activities]);

  function changeWeek(num: number) {
    setWeekNum(num);
    setActivities(defaultActivities(num));
  }

  function toggleIntensity(id: string) {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const cycle: Intensity[] = ["light", "moderate", "vigorous"];
        const next = cycle[(cycle.indexOf(a.intensity) + 1) % cycle.length];
        return { ...a, intensity: next };
      })
    );
  }

  function updateMins(id: string, val: number) {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, mins: Math.max(0.1, val) } : a)));
  }

  const grouped = {
    warmup: activities.filter((a) => a.type === "warmup"),
    instruction: activities.filter((a) => a.type === "instruction"),
    station: activities.filter((a) => a.type === "station"),
    cooldown: activities.filter((a) => a.type === "cooldown"),
  };

  const progressWidth = Math.min(100, mvpaPct);
  const progressBg =
    mvpaPct >= 50 ? "#22c55e" : mvpaPct >= 40 ? "#f59e0b" : "#ef4444";

  const guidanceMsg =
    mvpaPct >= 60
      ? "Outstanding! Your class is designed for maximum movement. Students will hit the MVPA target with room to spare."
      : mvpaPct >= 50
      ? "You've hit the 50% MVPA goal. Students will get 30+ minutes of moderate-to-vigorous activity in a 60-minute class."
      : mvpaPct >= 40
      ? "Almost there! Try bumping up the intensity of 1-2 activities from Moderate to Vigorous to reach the 50% target."
      : "This class plan is below the MVPA goal. Consider adding more vigorous stations or extending station time to increase movement.";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 300px", minHeight: "calc(100vh - 56px)" }}>
        {/* Main */}
        <div className="p-5 border-r" style={{ borderColor: "var(--border)" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-bebas text-4xl tracking-wider" style={{ color: "var(--text)" }}>
                MVPA PLANNER
              </h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Movement by design, not by accident.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold" style={{ color: "var(--muted)" }}>Week</label>
              <select
                value={weekNum}
                onChange={(e) => changeWeek(Number(e.target.value))}
                className="rounded-lg px-3 py-2 text-sm font-semibold"
                style={{ background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)" }}
              >
                {Array.from({ length: 36 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Week {w} — {CURRICULUM[w]?.unit ?? ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Score card */}
          <div
            className="rounded-2xl p-5 mb-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "var(--muted)" }}>
                  Planned MVPA
                </div>
                <div className="font-bebas text-6xl tracking-wider leading-none" style={{ color: progressBg }}>
                  {mvpaPct}%
                </div>
                <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  {mvpaMins.toFixed(1)} min MVPA of {CLASS_MINUTES} min class
                </div>
              </div>
              <span
                className="text-sm font-bold px-4 py-2 rounded-full"
                style={{ background: `${status.color}20`, color: status.color }}
              >
                {status.label}
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 rounded-full overflow-hidden mb-2" style={{ background: "var(--surface3)" }}>
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressWidth}%`, background: progressBg }}
              />
              {/* 50% goal line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 opacity-60"
                style={{ left: "50%", background: "var(--text)" }}
              />
            </div>
            <div className="flex justify-between text-xs" style={{ color: "var(--dim)" }}>
              <span>0%</span>
              <span>50% Goal</span>
              <span>100%</span>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Warm-Up", val: warmupMins.toFixed(1), unit: "min" },
                { label: "Stations", val: stationMins.toFixed(1), unit: "min" },
                { label: "Cool-Down", val: cdMins.toFixed(1), unit: "min" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                >
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--muted)" }}>
                    {b.label}
                  </div>
                  <div className="font-bebas text-2xl" style={{ color: "var(--text)" }}>{b.val}</div>
                  <div className="text-xs" style={{ color: "var(--dim)" }}>{b.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidance */}
          <div
            className="rounded-xl p-4 mb-5 flex gap-3"
            style={{
              background: `${status.color}10`,
              border: `1px solid ${status.color}44`,
            }}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">
              {mvpaPct >= 50 ? "✅" : mvpaPct >= 40 ? "⚡" : "⚠️"}
            </span>
            <div>
              <div className="font-bold text-sm mb-1" style={{ color: status.color }}>
                {status.label}
              </div>
              <div className="text-sm" style={{ color: "var(--muted)" }}>
                {guidanceMsg}
              </div>
            </div>
          </div>

          {/* Phase sections */}
          {(["warmup", "instruction", "station", "cooldown"] as const).map((type) => {
            const acts = grouped[type];
            if (!acts.length) return null;
            const typeTotal = acts.reduce((a, b) => a + b.mins, 0);
            const typeMvpa = acts.filter((a) => a.intensity !== "light" && type !== "instruction").reduce((a, b) => a + b.mins, 0);
            const phaseColors: Record<string, string> = {
              warmup: "#06b6d4",
              instruction: "#a855f7",
              station: "#22c55e",
              cooldown: "#a855f7",
            };
            const phaseLabels: Record<string, string> = {
              warmup: "Warm-Up",
              instruction: "Instruction",
              station: "Stations",
              cooldown: "Cool-Down",
            };

            return (
              <div key={type} className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <h2
                    className="font-bebas text-xl tracking-wider"
                    style={{ color: phaseColors[type] }}
                  >
                    {phaseLabels[type]}
                  </h2>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    {typeTotal.toFixed(1)} min
                  </span>
                  {typeMvpa > 0 && (
                    <span
                      className="text-xs px-2 py-1 rounded-full font-bold"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                    >
                      {typeMvpa.toFixed(1)} min MVPA
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {acts.map((act) => (
                    <div
                      key={act.id}
                      className="rounded-xl overflow-hidden"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className="text-xl w-7 flex-shrink-0">{act.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>
                            {act.name}
                          </div>
                          {act.stationType && (
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: act.stationType === "skill" ? "#3b82f6" : "#f97316" }}
                            >
                              {act.stationType === "skill" ? "📘 Skill Station" : "🏃 Activity Station"}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={act.mins}
                            min={0.1}
                            max={20}
                            step={0.5}
                            onChange={(e) => updateMins(act.id, parseFloat(e.target.value))}
                            className="w-16 text-center text-xs font-bold rounded-lg px-1 py-1"
                            style={{
                              background: "var(--surface3)",
                              border: "1px solid var(--border2)",
                              color: "var(--text)",
                            }}
                          />
                          <span className="text-xs" style={{ color: "var(--dim)" }}>min</span>
                          {type !== "instruction" && type !== "cooldown" && (
                            <button
                              onClick={() => toggleIntensity(act.id)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                              style={{
                                background: `${INTENSITY_COLORS[act.intensity]}20`,
                                color: INTENSITY_COLORS[act.intensity],
                                border: `1px solid ${INTENSITY_COLORS[act.intensity]}40`,
                              }}
                            >
                              {act.intensity}
                            </button>
                          )}
                          {type === "cooldown" && (
                            <span
                              className="text-xs font-bold px-3 py-1.5 rounded-lg"
                              style={{
                                background: `${INTENSITY_COLORS.light}20`,
                                color: INTENSITY_COLORS.light,
                              }}
                            >
                              light
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right sidebar: standards reference */}
        <div className="p-4" style={{ background: "var(--surface)", position: "sticky", top: "56px", height: "calc(100vh - 56px)", overflowY: "auto" }}>
          <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--muted)" }}>
            Standards Reference
          </div>

          {CURRICULUM[weekNum] && (
            <div className="space-y-3">
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs font-bold mb-1" style={{ color: "var(--green)" }}>Week {weekNum}</div>
                <div className="font-semibold text-sm mb-2" style={{ color: "var(--text)" }}>
                  {CURRICULUM[weekNum].unit}
                </div>
                <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                  {CURRICULUM[weekNum].focus}
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="font-bold mb-0.5" style={{ color: "var(--dim)" }}>K–2 TEKS</div>
                    <div style={{ color: "var(--muted)" }}>{CURRICULUM[weekNum].k2_teks}</div>
                  </div>
                  <div>
                    <div className="font-bold mb-0.5" style={{ color: "var(--dim)" }}>3–5 TEKS</div>
                    <div style={{ color: "var(--muted)" }}>{CURRICULUM[weekNum].g35_teks}</div>
                  </div>
                </div>
              </div>

              {/* MVPA benchmarks */}
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs font-bold mb-3" style={{ color: "var(--muted)" }}>
                  MVPA Benchmarks
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { label: "SHAPE America", val: "50% class time", color: "#22c55e" },
                    { label: "Texas SBOE", val: "30 min MVPA", color: "#3b82f6" },
                    { label: "NASPE", val: "150 min/week", color: "#a855f7" },
                    { label: "CDC", val: "60 min/day total", color: "#f59e0b" },
                  ].map((b) => (
                    <div key={b.label} className="flex justify-between">
                      <span style={{ color: "var(--muted)" }}>{b.label}</span>
                      <span className="font-bold" style={{ color: b.color }}>{b.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick tip */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <div className="text-xs font-bold mb-2" style={{ color: "var(--green)" }}>
                  MVPA Tip
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  Click any intensity badge (Light / Moderate / Vigorous) to cycle it. Watch the MVPA % update in real
                  time as you adjust your planned class intensity.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
