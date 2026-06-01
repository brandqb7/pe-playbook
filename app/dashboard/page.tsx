"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CURRICULUM } from "../../data/curriculum";

interface QuickStat {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: string;
}

export default function DashboardPage() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [gradeFilter, setGradeFilter] = useState<"k2" | "35">("k2");

  useEffect(() => {
    // Calculate current week based on school year (Aug start)
    const now = new Date();
    const schoolStart = new Date(now.getFullYear(), 7, 1); // Aug 1
    if (now < schoolStart) schoolStart.setFullYear(now.getFullYear() - 1);
    const weekNum = Math.min(36, Math.max(1, Math.ceil((now.getTime() - schoolStart.getTime()) / (7 * 86400000))));
    setCurrentWeek(weekNum);
  }, []);

  const week = CURRICULUM[currentWeek];
  const prevWeek = currentWeek > 1 ? CURRICULUM[currentWeek - 1] : null;
  const nextWeek = currentWeek < 36 ? CURRICULUM[currentWeek + 1] : null;

  const stats: QuickStat[] = [
    { label: "Current Week", value: `${currentWeek}`, sub: "of 36", color: "#22c55e", icon: "📅" },
    { label: "Current Unit", value: week?.unit ?? "—", sub: week?.cat ?? "", color: "#3b82f6", icon: "📚" },
    { label: "Standards", value: "432", sub: "TEKS loaded", color: "#a855f7", icon: "📋" },
    { label: "Game Cards", value: "19", sub: "ready to use", color: "#f97316", icon: "🎮" },
  ];

  const quickActions = [
    { label: "Start Smart Timer", icon: "⏱", href: "/timer", color: "#22c55e", desc: "Run today's class" },
    { label: "Plan MVPA", icon: "📊", href: "/mvpa", color: "#f59e0b", desc: "Hit 50% by design" },
    { label: "Write Lesson Plan", icon: "📋", href: "/lessons", color: "#3b82f6", desc: "Build today's lesson" },
    { label: "Browse Game Cards", icon: "🎮", href: "/library", color: "#f97316", desc: "Find the right game" },
    { label: "Standards Library", icon: "📚", href: "/standards", color: "#a855f7", desc: "Search all TEKS" },
    { label: "Year at a Glance", icon: "📅", href: "/year", color: "#06b6d4", desc: "Full curriculum map" },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bebas text-5xl tracking-wider mb-1" style={{ color: "var(--text)" }}>
            DASHBOARD
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Welcome back — here&apos;s where you left off.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{s.icon}</span>
                <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--dim)" }}>
                  {s.label}
                </span>
              </div>
              <div className="font-bebas text-3xl tracking-wider leading-none" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: current week focus */}
          <div className="lg:col-span-2 space-y-5">
            {/* This week card */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "var(--muted)" }}>
                    This Week
                  </div>
                  <h2 className="font-bebas text-3xl tracking-wider" style={{ color: "var(--text)" }}>
                    Week {currentWeek} — {week?.unit}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentWeek((w) => Math.max(1, w - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors hover:bg-white/10"
                    style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentWeek((w) => Math.min(36, w + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors hover:bg-white/10"
                    style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    ›
                  </button>
                </div>
              </div>

              {week && (
                <>
                  <div className="flex gap-2 mb-5">
                    <button
                      onClick={() => setGradeFilter("k2")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: gradeFilter === "k2" ? "var(--green)" : "var(--surface2)",
                        color: gradeFilter === "k2" ? "#000" : "var(--muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      K–2
                    </button>
                    <button
                      onClick={() => setGradeFilter("35")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: gradeFilter === "35" ? "var(--blue)" : "var(--surface2)",
                        color: gradeFilter === "35" ? "#fff" : "var(--muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      3–5
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div
                      className="rounded-xl p-4"
                      style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                    >
                      <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
                        Focus
                      </div>
                      <div className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
                        {week.focus}
                      </div>
                      <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>
                        <span className="font-semibold" style={{ color: "var(--dim)" }}>TEKS: </span>
                        {gradeFilter === "k2" ? week.k2_teks : week.g35_teks}
                      </div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        <span className="font-semibold" style={{ color: "var(--dim)" }}>Learning Goal: </span>
                        {gradeFilter === "k2" ? week.k2_lg : week.g35_lg}
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-4"
                      style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                    >
                      <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
                        Today&apos;s Setup
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs" style={{ color: "var(--dim)" }}>Skill Station 1</div>
                          <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                            {gradeFilter === "k2" ? week.k2_s1 : week.g35_s1}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: "var(--dim)" }}>Skill Station 2</div>
                          <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                            {gradeFilter === "k2" ? week.k2_s2 : week.g35_s2}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Equipment & vocab */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
                        Equipment
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {week.eq.map((e) => (
                          <span
                            key={e}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ background: "var(--surface3)", color: "var(--muted)", border: "1px solid var(--border)" }}
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
                        Vocabulary
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {week.vocab.map((v) => (
                          <span
                            key={v}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ background: "var(--surface3)", color: "var(--muted)", border: "1px solid var(--border)" }}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Adjacent weeks */}
            <div className="grid grid-cols-2 gap-4">
              {prevWeek && (
                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", opacity: 0.7 }}
                >
                  <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "var(--dim)" }}>
                    Last Week
                  </div>
                  <div className="font-bebas text-lg tracking-wider" style={{ color: "var(--text)" }}>
                    Wk {currentWeek - 1} — {prevWeek.unit}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{prevWeek.focus}</div>
                </div>
              )}
              {nextWeek && (
                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", opacity: 0.7 }}
                >
                  <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "var(--dim)" }}>
                    Next Week
                  </div>
                  <div className="font-bebas text-lg tracking-wider" style={{ color: "var(--text)" }}>
                    Wk {currentWeek + 1} — {nextWeek.unit}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{nextWeek.focus}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: quick actions */}
          <div>
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--muted)" }}>
                Quick Actions
              </div>
              <div className="space-y-2">
                {quickActions.map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${a.color}18`, border: `1px solid ${a.color}40` }}
                    >
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                        {a.label}
                      </div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {a.desc}
                      </div>
                    </div>
                    <span style={{ color: "var(--dim)" }} className="text-sm">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* PE Tip */}
            <div
              className="mt-4 rounded-2xl p-5"
              style={{
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <div
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "var(--green)" }}
              >
                PE Tip
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                &ldquo;From the moment students walk into the gym, they know exactly what&apos;s going to happen.&rdquo; — Structure
                is the foundation of a great PE class.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
