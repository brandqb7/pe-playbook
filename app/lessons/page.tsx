"use client";

import { useState, useEffect } from "react";
import { CURRICULUM } from "../../data/curriculum";
import { getItem, setItemDebounced, KEYS } from "../../lib/storage";
import { showToast } from "../../lib/toast";

interface LessonPlan {
  id: string;
  week: number;
  grade: "k2" | "35";
  title: string;
  date: string;
  objectives: string;
  warmup: string[];
  stations: { name: string; type: "skill" | "activity"; notes: string }[];
  gameCard?: string;
  skillCard?: string;
  assessment: string;
  equipment: string[];
  createdAt: string;
  updatedAt: string;
}

function newPlan(week: number, grade: "k2" | "35"): LessonPlan {
  const w = CURRICULUM[week];
  return {
    id: `plan_${Date.now()}`,
    week,
    grade,
    title: w ? `Week ${week} — ${w.unit}` : `Lesson Plan Week ${week}`,
    date: new Date().toISOString().slice(0, 10),
    objectives: w ? (grade === "k2" ? w.k2_lg : w.g35_lg) : "",
    warmup: ["High Knees", "Jumping Jacks", "Mountain Climbers", "Arm Circles"],
    stations: w
      ? [
          { name: grade === "k2" ? w.k2_s1 : w.g35_s1, type: "skill", notes: "" },
          { name: grade === "k2" ? w.k2_s2 : w.g35_s2, type: "skill", notes: "" },
          { name: grade === "k2" ? w.k2_g1 : w.g35_g1, type: "activity", notes: "" },
          { name: grade === "k2" ? w.k2_g2 : w.g35_g2, type: "activity", notes: "" },
        ]
      : [
          { name: "Station 1", type: "skill", notes: "" },
          { name: "Station 2", type: "skill", notes: "" },
          { name: "Station 3", type: "activity", notes: "" },
          { name: "Station 4", type: "activity", notes: "" },
        ],
    assessment: "",
    equipment: w ? w.eq : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function LessonsPage() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [activePlan, setActivePlan] = useState<LessonPlan | null>(null);
  const [view, setView] = useState<"list" | "editor">("list");
  const [week, setWeek] = useState(1);
  const [grade, setGrade] = useState<"k2" | "35">("k2");

  useEffect(() => {
    const saved = getItem<LessonPlan[]>(KEYS.LESSON_PLANS, []);
    setPlans(saved);
  }, []);

  function savePlans(updated: LessonPlan[]) {
    setPlans(updated);
    setItemDebounced(KEYS.LESSON_PLANS, updated);
  }

  function createPlan() {
    const plan = newPlan(week, grade);
    const updated = [plan, ...plans];
    savePlans(updated);
    setActivePlan(plan);
    setView("editor");
    showToast("Lesson plan created!", "success");
  }

  function updatePlan(field: keyof LessonPlan, val: unknown) {
    if (!activePlan) return;
    const updated = { ...activePlan, [field]: val, updatedAt: new Date().toISOString() };
    setActivePlan(updated);
    const newPlans = plans.map((p) => (p.id === updated.id ? updated : p));
    savePlans(newPlans);
  }

  function deletePlan(id: string) {
    const updated = plans.filter((p) => p.id !== id);
    savePlans(updated);
    if (activePlan?.id === id) { setActivePlan(null); setView("list"); }
    showToast("Plan deleted", "info");
  }

  function printPlan() {
    window.print();
  }

  if (view === "editor" && activePlan) {
    const w = CURRICULUM[activePlan.week];
    return (
      <div className="min-h-screen p-6" style={{ background: "var(--bg)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("list")}
                className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
              >
                ← Back
              </button>
              <h1 className="font-bebas text-3xl tracking-wider" style={{ color: "var(--text)" }}>
                {activePlan.title}
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={printPlan}
                className="text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80"
                style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
              >
                🖨 Print
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Main editor */}
            <div className="md:col-span-2 space-y-5">
              {/* Title/date/grade */}
              <Card title="Lesson Info">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Title</label>
                    <input
                      value={activePlan.title}
                      onChange={(e) => updatePlan("title", e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input type="date" value={activePlan.date} onChange={(e) => updatePlan("date", e.target.value)} className="input w-full" />
                  </div>
                  <div>
                    <label className="label">Grade Band</label>
                    <select
                      value={activePlan.grade}
                      onChange={(e) => updatePlan("grade", e.target.value)}
                      className="input w-full"
                    >
                      <option value="k2">K–2</option>
                      <option value="35">3–5</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Objectives */}
              <Card title="Learning Objectives & Standards">
                <label className="label">Learning Objective</label>
                <textarea
                  value={activePlan.objectives}
                  onChange={(e) => updatePlan("objectives", e.target.value)}
                  rows={3}
                  className="input w-full resize-none"
                  placeholder="Students will be able to..."
                />
                {w && (
                  <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                    <div className="font-bold mb-1" style={{ color: "var(--muted)" }}>
                      TEKS Reference ({activePlan.grade === "k2" ? "K–2" : "3–5"})
                    </div>
                    <div style={{ color: "var(--text)" }}>
                      {activePlan.grade === "k2" ? w.k2_teks : w.g35_teks}
                    </div>
                  </div>
                )}
              </Card>

              {/* Warm-up */}
              <Card title="Warm-Up Exercises">
                <div className="space-y-2">
                  {activePlan.warmup.map((ex, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={ex}
                        onChange={(e) => {
                          const wu = [...activePlan.warmup];
                          wu[i] = e.target.value;
                          updatePlan("warmup", wu);
                        }}
                        className="input flex-1"
                        placeholder="Exercise name"
                      />
                      <button
                        onClick={() => updatePlan("warmup", activePlan.warmup.filter((_, idx) => idx !== i))}
                        className="px-2 rounded text-xs hover:opacity-70"
                        style={{ color: "var(--dim)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updatePlan("warmup", [...activePlan.warmup, ""])}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-80"
                    style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    + Add Exercise
                  </button>
                </div>
              </Card>

              {/* Stations */}
              <Card title="Station Rotation">
                <div className="space-y-3">
                  {activePlan.stations.map((st, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                      <div className="flex gap-2 mb-2">
                        <span className="text-xs font-bold w-6 text-center pt-2" style={{ color: "var(--dim)" }}>{i + 1}</span>
                        <button
                          onClick={() => {
                            const sts = [...activePlan.stations];
                            sts[i] = { ...sts[i], type: sts[i].type === "skill" ? "activity" : "skill" };
                            updatePlan("stations", sts);
                          }}
                          className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded"
                          style={{
                            background: st.type === "skill" ? "rgba(59,130,246,0.2)" : "rgba(249,115,22,0.2)",
                            color: st.type === "skill" ? "#3b82f6" : "#f97316",
                          }}
                        >
                          {st.type === "skill" ? "📘 Skill" : "🏃 Activity"}
                        </button>
                        <input
                          value={st.name}
                          onChange={(e) => {
                            const sts = [...activePlan.stations];
                            sts[i] = { ...sts[i], name: e.target.value };
                            updatePlan("stations", sts);
                          }}
                          className="input flex-1"
                          placeholder="Station name"
                        />
                      </div>
                      <input
                        value={st.notes}
                        onChange={(e) => {
                          const sts = [...activePlan.stations];
                          sts[i] = { ...sts[i], notes: e.target.value };
                          updatePlan("stations", sts);
                        }}
                        className="input w-full ml-8"
                        placeholder="Setup notes, cues, modifications..."
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updatePlan("stations", [...activePlan.stations, { name: "", type: "skill" as const, notes: "" }])}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-80"
                    style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    + Add Station
                  </button>
                </div>
              </Card>

              {/* Assessment */}
              <Card title="Assessment / Reflection">
                <textarea
                  value={activePlan.assessment}
                  onChange={(e) => updatePlan("assessment", e.target.value)}
                  rows={3}
                  className="input w-full resize-none"
                  placeholder="How will you assess student learning? What went well? What to adjust?"
                />
              </Card>
            </div>

            {/* Right: equipment + quick ref */}
            <div className="space-y-4">
              <Card title="Equipment">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {activePlan.equipment.map((eq, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{ background: "var(--surface3)", color: "var(--muted)", border: "1px solid var(--border)" }}
                    >
                      {eq}
                    </span>
                  ))}
                </div>
                {w && (
                  <div className="text-xs" style={{ color: "var(--dim)" }}>
                    Curriculum default for Week {activePlan.week}
                  </div>
                )}
              </Card>

              {w && (
                <Card title={`Week ${activePlan.week} Reference`}>
                  <div className="text-xs space-y-2">
                    <div>
                      <div className="font-bold mb-0.5" style={{ color: "var(--dim)" }}>Vocabulary</div>
                      <div className="flex flex-wrap gap-1">
                        {w.vocab.map((v) => (
                          <span key={v} className="px-1.5 py-0.5 rounded" style={{ background: "var(--surface3)", color: "var(--muted)" }}>
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold mb-0.5" style={{ color: "var(--dim)" }}>Skill Cue</div>
                      <div style={{ color: "var(--text)" }}>{activePlan.grade === "k2" ? w.k2_sc : w.g35_sc}</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          .input {
            background: var(--surface2);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px 12px;
            color: var(--text);
            font-size: 13px;
            font-family: var(--font-dm-sans);
            outline: none;
          }
          .input:focus { border-color: var(--border2); }
          .label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-bebas text-5xl tracking-wider mb-1" style={{ color: "var(--text)" }}>
              LESSON PLANS
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Every station has a purpose. Every minute has a plan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)" }}
            >
              {Array.from({ length: 36 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Week {w}{CURRICULUM[w] ? ` — ${CURRICULUM[w].unit}` : ""}
                </option>
              ))}
            </select>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as "k2" | "35")}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)" }}
            >
              <option value="k2">K–2</option>
              <option value="35">3–5</option>
            </select>
            <button
              onClick={createPlan}
              className="font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
              style={{ background: "var(--green)", color: "#000" }}
            >
              + New Plan
            </button>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="font-bebas text-3xl tracking-wider mb-3" style={{ color: "var(--text)" }}>
              No Lesson Plans Yet
            </h2>
            <p className="text-base mb-6" style={{ color: "var(--muted)" }}>
              Select a week and grade band above, then click New Plan to get started.
            </p>
            <button
              onClick={createPlan}
              className="font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90"
              style={{ background: "var(--green)", color: "#000" }}
            >
              Create Your First Plan →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              return (
                <div
                  key={plan.id}
                  className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onClick={() => { setActivePlan(plan); setView("editor"); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs font-bold mb-1" style={{ color: "var(--green)" }}>
                        Week {plan.week} · {plan.grade === "k2" ? "K–2" : "3–5"}
                      </div>
                      <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                        {plan.title}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePlan(plan.id); }}
                      className="text-xs px-2 py-1 rounded hover:opacity-70"
                      style={{ color: "var(--dim)" }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                    {plan.date}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.stations.slice(0, 3).map((st, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: st.type === "skill" ? "rgba(59,130,246,0.15)" : "rgba(249,115,22,0.15)",
                          color: st.type === "skill" ? "#3b82f6" : "#f97316",
                        }}
                      >
                        {st.name.length > 18 ? st.name.slice(0, 18) + "…" : st.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--muted)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}
