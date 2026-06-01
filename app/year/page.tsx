"use client";

import { useState } from "react";
import Link from "next/link";
import { CURRICULUM } from "../../data/curriculum";

export default function YearPage() {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [gradeFilter, setGradeFilter] = useState<"k2" | "35">("k2");

  const selected = selectedWeek ? CURRICULUM[selectedWeek] : null;

  // Group weeks by category for the legend
  const categories = new Map<string, { color: string; weeks: number[] }>();
  for (let w = 1; w <= 36; w++) {
    const week = CURRICULUM[w];
    if (!week) continue;
    if (!categories.has(week.cat)) {
      categories.set(week.cat, { color: week.color, weeks: [] });
    }
    categories.get(week.cat)!.weeks.push(w);
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-bebas text-5xl tracking-wider mb-1" style={{ color: "var(--text)" }}>
              YEAR AT A GLANCE
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              36 weeks, planned before August. The complete K-5 PE curriculum map.
            </p>
          </div>
          <div className="flex gap-2">
            {(["k2", "35"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: gradeFilter === g ? (g === "k2" ? "#22c55e" : "#3b82f6") : "var(--surface2)",
                  color: gradeFilter === g ? (g === "k2" ? "#000" : "#fff") : "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {g === "k2" ? "K–2" : "3–5"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-3">
            {/* Column headers */}
            <div className="grid grid-cols-9 gap-1.5 mb-2">
              {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                <div
                  key={q}
                  className="col-span-2 text-center text-xs font-bold tracking-widest uppercase"
                  style={{ color: "var(--dim)", gridColumn: `span 2` }}
                >
                  {q}
                </div>
              ))}
              <div />
            </div>

            {/* Week grid — 4 rows of 9 = 36 weeks */}
            <div className="space-y-1.5">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(9, 1fr)" }}>
                  {Array.from({ length: 9 }, (_, col) => {
                    const weekNum = row * 9 + col + 1;
                    if (weekNum > 36) return <div key={col} />;
                    const week = CURRICULUM[weekNum];
                    if (!week) return <div key={col} />;
                    const isHovered = hoveredWeek === weekNum;
                    const isSelected = selectedWeek === weekNum;
                    return (
                      <button
                        key={col}
                        onMouseEnter={() => setHoveredWeek(weekNum)}
                        onMouseLeave={() => setHoveredWeek(null)}
                        onClick={() => setSelectedWeek(selectedWeek === weekNum ? null : weekNum)}
                        className="relative rounded-xl p-2 text-left transition-all"
                        style={{
                          background: isSelected
                            ? `${week.color}30`
                            : isHovered
                            ? `${week.color}18`
                            : "var(--surface)",
                          border: `1px solid ${isSelected ? week.color : isHovered ? `${week.color}80` : "var(--border)"}`,
                          transform: isHovered ? "scale(1.03)" : undefined,
                        }}
                        title={`Week ${weekNum}: ${week.unit} — ${week.focus}`}
                      >
                        <div
                          className="text-xs font-bold mb-1 font-bebas tracking-wider"
                          style={{ color: week.color }}
                        >
                          W{weekNum}
                        </div>
                        <div
                          className="text-xs leading-tight"
                          style={{
                            color: isSelected || isHovered ? "var(--text)" : "var(--muted)",
                            fontSize: "10px",
                            lineHeight: "1.3",
                          }}
                        >
                          {week.unit.length > 14 ? week.unit.slice(0, 14) + "…" : week.unit}
                        </div>
                        {/* Color dot */}
                        <div
                          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                          style={{ background: week.color }}
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-2">
              {Array.from(categories.entries()).map(([cat, { color, weeks }]) => (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ background: `${color}15`, border: `1px solid ${color}40`, color }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} ({weeks.length}w)
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div>
            {selected && selectedWeek ? (
              <div
                className="rounded-2xl p-5 sticky top-20"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${selected.color}40`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div
                      className="font-bebas text-2xl tracking-wider"
                      style={{ color: selected.color }}
                    >
                      Week {selectedWeek}
                    </div>
                    <div className="font-bold text-sm" style={{ color: "var(--text)" }}>
                      {selected.unit}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedWeek(null)}
                    className="text-xs px-2 py-1 rounded hover:opacity-70"
                    style={{ color: "var(--dim)" }}
                  >
                    ✕
                  </button>
                </div>

                <div className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                  {selected.focus}
                </div>

                {/* Grade band content */}
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="font-bold mb-1" style={{ color: "var(--dim)" }}>
                      {gradeFilter === "k2" ? "K–2" : "3–5"} Learning Goal
                    </div>
                    <div style={{ color: "var(--muted)" }}>
                      {gradeFilter === "k2" ? selected.k2_lg : selected.g35_lg}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold mb-1" style={{ color: "var(--dim)" }}>TEKS</div>
                    <div style={{ color: "var(--muted)" }}>
                      {gradeFilter === "k2" ? selected.k2_teks : selected.g35_teks}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold mb-1" style={{ color: "var(--dim)" }}>Skill Cue</div>
                    <div className="font-semibold" style={{ color: "var(--text)" }}>
                      {gradeFilter === "k2" ? selected.k2_sc : selected.g35_sc}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold mb-1" style={{ color: "var(--dim)" }}>Stations</div>
                    <div className="space-y-1">
                      {[
                        { name: gradeFilter === "k2" ? selected.k2_s1 : selected.g35_s1, type: "skill" },
                        { name: gradeFilter === "k2" ? selected.k2_s2 : selected.g35_s2, type: "skill" },
                        { name: gradeFilter === "k2" ? selected.k2_g1 : selected.g35_g1, type: "activity" },
                        { name: gradeFilter === "k2" ? selected.k2_g2 : selected.g35_g2, type: "activity" },
                      ].map((st, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span style={{ color: st.type === "skill" ? "#3b82f6" : "#f97316", fontSize: "10px" }}>
                            {st.type === "skill" ? "📘" : "🏃"}
                          </span>
                          <span style={{ color: "var(--muted)" }}>{st.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold mb-1" style={{ color: "var(--dim)" }}>Equipment</div>
                    <div className="flex flex-wrap gap-1">
                      {selected.eq.map((e) => (
                        <span
                          key={e}
                          className="px-1.5 py-0.5 rounded"
                          style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                  <Link
                    href={`/lessons?week=${selectedWeek}&grade=${gradeFilter}`}
                    className="w-full flex justify-center font-bold text-sm py-2.5 rounded-xl hover:opacity-90"
                    style={{ background: selected.color, color: "#000" }}
                  >
                    Build Lesson Plan →
                  </Link>
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl p-5"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="text-center py-8">
                  <div className="text-3xl mb-3">📅</div>
                  <div className="font-bold text-sm mb-2" style={{ color: "var(--text)" }}>
                    Select Any Week
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Click any week in the calendar to see the full curriculum details for that week.
                  </p>
                </div>

                {/* Quick stats */}
                <div className="space-y-2 text-xs">
                  {Array.from(categories.entries()).map(([cat, { color, weeks }]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="flex-1 capitalize" style={{ color: "var(--muted)" }}>
                        {cat}
                      </span>
                      <span className="font-bold" style={{ color }}>
                        {weeks.length}w
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
