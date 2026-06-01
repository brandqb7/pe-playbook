"use client";

import { useState } from "react";

interface Standard {
  id: string;
  grade: string;
  code: string;
  text: string;
  strand: string;
  set: "teks" | "shape";
}

// A representative sample of Texas PE TEKS standards
const TEKS_STANDARDS: Standard[] = [
  // Kindergarten
  { id: "k1a", grade: "K", code: "K.1A", strand: "Movement", set: "teks", text: "Travel in general space using locomotor movements such as walking, hopping, galloping, and skipping while maintaining personal space." },
  { id: "k1b", grade: "K", code: "K.1B", strand: "Balance", set: "teks", text: "Demonstrate weight-bearing skills using a variety of body parts." },
  { id: "k1c", grade: "K", code: "K.1C", strand: "Balance", set: "teks", text: "Demonstrate balance using different body parts as bases on the floor and low equipment." },
  { id: "k1d", grade: "K", code: "K.1D", strand: "Gymnastics", set: "teks", text: "Demonstrate smooth transitions between locomotor and non-locomotor movements." },
  { id: "k1e", grade: "K", code: "K.1E", strand: "Rhythm", set: "teks", text: "Respond to even and uneven rhythms while moving." },
  { id: "k1f", grade: "K", code: "K.1F", strand: "Body Awareness", set: "teks", text: "Identify body parts and demonstrate fundamental movement concepts." },
  { id: "k1g", grade: "K", code: "K.1G", strand: "Space Awareness", set: "teks", text: "Demonstrate movement concepts such as space, direction, level, and speed." },
  { id: "k1h", grade: "K", code: "K.1H", strand: "Object Control", set: "teks", text: "Demonstrate fundamental movement skills with objects such as throwing, catching, kicking, and striking." },
  { id: "k2a", grade: "K", code: "K.2A", strand: "Fitness", set: "teks", text: "Identify the heart as a muscle that gets stronger with physical activity." },
  { id: "k2b", grade: "K", code: "K.2B", strand: "Fitness", set: "teks", text: "Identify ways the body responds to physical activity." },
  { id: "k3a", grade: "K", code: "K.3A", strand: "Self-Management", set: "teks", text: "Follow rules and procedures in physical education class." },
  { id: "k3b", grade: "K", code: "K.3B", strand: "Social", set: "teks", text: "Demonstrate cooperation with a partner during physical activities." },
  { id: "k4a", grade: "K", code: "K.4A", strand: "Health", set: "teks", text: "Identify the components of health-related fitness." },
  { id: "k5a", grade: "K", code: "K.5A", strand: "Lifetime Activity", set: "teks", text: "Identify physical activities that can be done at school and at home." },
  // 1st Grade
  { id: "1st1a", grade: "1st", code: "1st.1A", strand: "Movement", set: "teks", text: "Travel in general space using combined locomotor movements such as skipping, sliding, and galloping." },
  { id: "1st1b", grade: "1st", code: "1st.1B", strand: "Gymnastics", set: "teks", text: "Demonstrate weight transfer to various body parts with control." },
  { id: "1st1c", grade: "1st", code: "1st.1C", strand: "Balance", set: "teks", text: "Demonstrate static and dynamic balance on equipment and on the floor." },
  { id: "1st1h", grade: "1st", code: "1st.1H", strand: "Object Control", set: "teks", text: "Demonstrate overhand and underhand throwing using the critical elements of form." },
  { id: "1st2a", grade: "1st", code: "1st.2A", strand: "Fitness", set: "teks", text: "Distinguish between moderate and vigorous physical activity." },
  { id: "1st3a", grade: "1st", code: "1st.3A", strand: "Self-Management", set: "teks", text: "Follow rules, procedures, and etiquette for physical education activities." },
  // 2nd Grade
  { id: "2nd1n", grade: "2nd", code: "2nd.1N", strand: "Object Control", set: "teks", text: "Demonstrate the critical elements for overhand throwing, underhand throwing, catching, and kicking." },
  { id: "2nd1d", grade: "2nd", code: "2nd.1D", strand: "Gymnastics", set: "teks", text: "Demonstrate a forward roll with correct technique including chin-to-chest tuck." },
  { id: "2nd2a", grade: "2nd", code: "2nd.2A", strand: "Fitness", set: "teks", text: "Identify the relationship between physical activity and personal health." },
  // 3rd Grade
  { id: "3rd1j", grade: "3rd", code: "3rd.1J", strand: "Object Control", set: "teks", text: "Demonstrate the overhand throw, catching, and dribbling with increasing accuracy and consistency." },
  { id: "3rd1c", grade: "3rd", code: "3rd.1C", strand: "Gymnastics", set: "teks", text: "Demonstrate a sequence of gymnastics skills combining locomotor and non-locomotor skills." },
  { id: "3rd3a", grade: "3rd", code: "3rd.3A", strand: "Social", set: "teks", text: "Work cooperatively with others regardless of personal differences." },
  // 4th Grade
  { id: "4th1k", grade: "4th", code: "4th.1K", strand: "Object Control", set: "teks", text: "Apply the critical elements of catching, throwing, kicking, dribbling, and striking in modified game settings." },
  { id: "4th2a", grade: "4th", code: "4th.2A", strand: "Fitness", set: "teks", text: "Identify the components of health-related fitness and assess personal fitness levels." },
  // 5th Grade
  { id: "5th1k", grade: "5th", code: "5th.1K", strand: "Object Control", set: "teks", text: "Apply the critical elements of sport-specific skills in game situations with consistency." },
  { id: "5th3a", grade: "5th", code: "5th.3A", strand: "Social", set: "teks", text: "Demonstrate responsible behaviors that contribute to a positive team environment." },
  { id: "5th4a", grade: "5th", code: "5th.4A", strand: "Health", set: "teks", text: "Design a personal fitness plan that includes all components of health-related fitness." },
  { id: "5th5a", grade: "5th", code: "5th.5A", strand: "Lifetime Activity", set: "teks", text: "Identify lifetime physical activities that promote personal health and wellness." },
];

// SHAPE America Grade-Level Outcomes (sample)
const SHAPE_STANDARDS: Standard[] = [
  { id: "shape_s1e1", grade: "K", code: "S1.E1.Ka", strand: "Standard 1", set: "shape", text: "Performs locomotor skills (hopping, galloping, running, sliding, skipping) while maintaining balance." },
  { id: "shape_s1e2", grade: "K", code: "S1.E2.Ka", strand: "Standard 1", set: "shape", text: "Maintains momentary stillness on different bases of support." },
  { id: "shape_s1e13", grade: "K", code: "S1.E13.Ka", strand: "Standard 1", set: "shape", text: "Throws underhand with opposite foot forward." },
  { id: "shape_s1e14", grade: "K", code: "S1.E14.Ka", strand: "Standard 1", set: "shape", text: "Catches a gently tossed hand-size ball from a partner, demonstrating two-handed catching." },
  { id: "shape_s2e1", grade: "K", code: "S2.E1.Ka", strand: "Standard 2", set: "shape", text: "Differentiates between movement in personal (self-space) and general space." },
  { id: "shape_s3e1", grade: "K", code: "S3.E1.Ka", strand: "Standard 3", set: "shape", text: "Recognizes that when you move fast, your heart beats faster and you breathe faster." },
  { id: "shape_s4e1", grade: "K", code: "S4.E1.Ka", strand: "Standard 4", set: "shape", text: "Shares equipment and space with others." },
  { id: "shape_s5e1", grade: "K", code: "S5.E1.Ka", strand: "Standard 5", set: "shape", text: "Recognizes that physical activity is important for good health." },
  { id: "shape_s1e1_2", grade: "2nd", code: "S1.E1.2", strand: "Standard 1", set: "shape", text: "Combines locomotor skills in general space to a rhythm." },
  { id: "shape_s1e13_2", grade: "2nd", code: "S1.E13.2", strand: "Standard 1", set: "shape", text: "Throws underhand to a partner or target with reasonable accuracy." },
  { id: "shape_s1e14_2", grade: "2nd", code: "S1.E14.2", strand: "Standard 1", set: "shape", text: "Catches a thrown ball above the waist using a receiving action with hands." },
  { id: "shape_s1e17_3", grade: "3rd", code: "S1.E17.3", strand: "Standard 1", set: "shape", text: "Dribbles in self-space with preferred hand demonstrating a mature pattern." },
  { id: "shape_s1e24_3", grade: "3rd", code: "S1.E24.3", strand: "Standard 1", set: "shape", text: "Strikes a ball with a paddle using a forehand pattern." },
  { id: "shape_s3e2_3", grade: "3rd", code: "S3.E2.3", strand: "Standard 3", set: "shape", text: "Describes the concept of fitness and provides examples of physical activity to enhance fitness." },
  { id: "shape_s4e2_4", grade: "4th", code: "S4.E2.4", strand: "Standard 4", set: "shape", text: "Accepts responsibility for improving personal health behaviors." },
  { id: "shape_s5e3_5", grade: "5th", code: "S5.E3.5", strand: "Standard 5", set: "shape", text: "Identifies the five components of health-related fitness and how they relate to overall health." },
];

const ALL_STANDARDS: Standard[] = [...TEKS_STANDARDS, ...SHAPE_STANDARDS];

const GRADES = ["All", "K", "1st", "2nd", "3rd", "4th", "5th"];
const STRANDS = ["All", ...Array.from(new Set(ALL_STANDARDS.map((s) => s.strand))).sort()];

export default function StandardsPage() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [strandFilter, setStrandFilter] = useState("All");
  const [setFilter, setSetFilter] = useState<"all" | "teks" | "shape">("all");
  const [selected, setSelected] = useState<Standard | null>(null);

  const filtered = ALL_STANDARDS.filter((s) => {
    const matchSearch =
      !search ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.text.toLowerCase().includes(search.toLowerCase()) ||
      s.strand.toLowerCase().includes(search.toLowerCase());
    const matchGrade = gradeFilter === "All" || s.grade === gradeFilter;
    const matchStrand = strandFilter === "All" || s.strand === strandFilter;
    const matchSet = setFilter === "all" || s.set === setFilter;
    return matchSearch && matchGrade && matchStrand && matchSet;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bebas text-5xl tracking-wider mb-1" style={{ color: "var(--text)" }}>
            STANDARDS LIBRARY
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Texas TEKS + SHAPE America indicators · Search and reference any standard
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Texas TEKS", val: TEKS_STANDARDS.length.toString(), color: "#3b82f6" },
            { label: "SHAPE America", val: SHAPE_STANDARDS.length.toString(), color: "#a855f7" },
            { label: "Total Standards", val: ALL_STANDARDS.length.toString(), color: "#22c55e" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4 text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="font-bebas text-3xl" style={{ color: s.color }}>{s.val}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Search standards (e.g. K.1H, overhand throw)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-64 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-dm-sans)" }}
          />

          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {(["all", "teks", "shape"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSetFilter(t)}
                className="px-4 py-2 text-sm font-bold transition-all"
                style={{
                  background: setFilter === t ? (t === "teks" ? "#3b82f6" : t === "shape" ? "#a855f7" : "#22c55e") : "var(--surface)",
                  color: setFilter === t ? "#fff" : "var(--muted)",
                }}
              >
                {t === "all" ? "All" : t === "teks" ? "Texas TEKS" : "SHAPE America"}
              </button>
            ))}
          </div>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            {GRADES.map((g) => <option key={g} value={g}>{g === "All" ? "All Grades" : `Grade ${g}`}</option>)}
          </select>

          <select
            value={strandFilter}
            onChange={(e) => setStrandFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            {STRANDS.map((s) => <option key={s} value={s}>{s === "All" ? "All Strands" : s}</option>)}
          </select>
        </div>

        <div className="text-xs font-bold mb-4" style={{ color: "var(--muted)" }}>
          {filtered.length} standard{filtered.length !== 1 ? "s" : ""} found
        </div>

        {/* Standards table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}>
                {["Standard", "Grade", "Strand", "Text"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={() => setSelected(selected?.id === s.id ? null : s)}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : undefined,
                    background:
                      selected?.id === s.id
                        ? s.set === "teks"
                          ? "rgba(59,130,246,0.08)"
                          : "rgba(168,85,247,0.08)"
                        : undefined,
                  }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{
                        background: s.set === "teks" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)",
                        color: s.set === "teks" ? "#3b82f6" : "#a855f7",
                      }}
                    >
                      {s.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    {s.grade}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                    {s.strand}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{
                      color: "var(--text)",
                      maxWidth: "400px",
                    }}
                  >
                    {selected?.id === s.id ? s.text : s.text.length > 90 ? s.text.slice(0, 90) + "…" : s.text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">📚</div>
              <div className="font-bold text-sm" style={{ color: "var(--text)" }}>No standards found</div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Try different search terms or filters</p>
            </div>
          )}
        </div>

        <p className="text-xs mt-4" style={{ color: "var(--dim)" }}>
          Note: This is a representative sample of standards. The full database will include all 432 Texas TEKS and 121 SHAPE America indicators.
        </p>
      </div>
    </div>
  );
}
