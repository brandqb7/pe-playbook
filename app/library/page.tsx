"use client";

import { useState } from "react";
import { GAME_CARDS, GameCard } from "../../data/gameCards";
import { SKILL_CARDS, SkillCard } from "../../data/skillCards";

type CardType = "all" | "game" | "skill";
type AllCard = (GameCard & { cardType: "game" }) | (SkillCard & { cardType: "skill" });

const ALL_CARDS: AllCard[] = [
  ...GAME_CARDS.map((c) => ({ ...c, cardType: "game" as const })),
  ...SKILL_CARDS.map((c) => ({ ...c, cardType: "skill" as const })),
];

const MVPA_COLORS: Record<string, string> = {
  "Very High": "#22c55e",
  High: "#84cc16",
  "Moderate-High": "#f59e0b",
  Moderate: "#f97316",
  Low: "#6b7280",
};

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CardType>("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected] = useState<AllCard | null>(null);

  const categories = ["All", ...Array.from(new Set(ALL_CARDS.map((c) => c.category)))].sort();

  const filtered = ALL_CARDS.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.unit.toLowerCase().includes(search.toLowerCase());
    const matchType = filter === "all" || c.cardType === filter;
    const matchCat = categoryFilter === "All" || c.category === categoryFilter;
    return matchSearch && matchType && matchCat;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bebas text-5xl tracking-wider mb-1" style={{ color: "var(--text)" }}>
            RESOURCE LIBRARY
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            19 game cards · 12 skill cue cards — ready to use in any lesson
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search games, skills, units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-dm-sans)",
            }}
          />

          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {(["all", "game", "skill"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className="px-4 py-2 text-sm font-bold transition-all"
                style={{
                  background: filter === t ? "var(--green)" : "var(--surface)",
                  color: filter === t ? "#000" : "var(--muted)",
                }}
              >
                {t === "all" ? `All (${ALL_CARDS.length})` : t === "game" ? `Games (${GAME_CARDS.length})` : `Skills (${SKILL_CARDS.length})`}
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="text-xs font-bold mb-4" style={{ color: "var(--muted)" }}>
          {filtered.length} {filtered.length === 1 ? "card" : "cards"} found
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Card list */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((card) => (
                <button
                  key={`${card.cardType}-${card.id}`}
                  onClick={() => setSelected(selected?.id === card.id ? null : card)}
                  className="text-left rounded-2xl p-5 transition-all hover:scale-[1.01]"
                  style={{
                    background: selected?.id === card.id ? "var(--surface2)" : "var(--surface)",
                    border: `1px solid ${selected?.id === card.id ? "var(--border2)" : "var(--border)"}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          background: card.cardType === "game" ? "rgba(249,115,22,0.15)" : "rgba(59,130,246,0.15)",
                          color: card.cardType === "game" ? "#f97316" : "#3b82f6",
                        }}
                      >
                        {card.cardType === "game" ? "🎮 Game" : "📘 Skill"}
                      </span>
                      {card.cardType === "game" && card.mvpa && (
                        <span
                          className="text-xs font-bold px-2 py-1 rounded"
                          style={{
                            background: `${MVPA_COLORS[card.mvpa] ?? "#6b7280"}20`,
                            color: MVPA_COLORS[card.mvpa] ?? "#6b7280",
                          }}
                        >
                          {card.mvpa} MVPA
                        </span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: "var(--dim)" }}>
                      {card.grades}
                    </span>
                  </div>

                  <div className="font-bold text-base mb-1" style={{ color: "var(--text)" }}>
                    {card.name}
                  </div>
                  <div className="text-xs mb-2" style={{ color: "var(--green)" }}>
                    {card.category}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {card.description.length > 100 ? card.description.slice(0, 100) + "…" : card.description}
                  </p>
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-3xl mb-3">🔍</div>
                <div className="font-bold text-base mb-2" style={{ color: "var(--text)" }}>
                  No cards found
                </div>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Try a different search term or filter
                </p>
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div>
            {selected ? (
              <div
                className="rounded-2xl p-5 sticky top-20"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${selected.cardType === "game" ? "rgba(249,115,22,0.3)" : "rgba(59,130,246,0.3)"}`,
                  maxHeight: "calc(100vh - 140px)",
                  overflowY: "auto",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded mb-2 inline-block"
                      style={{
                        background: selected.cardType === "game" ? "rgba(249,115,22,0.15)" : "rgba(59,130,246,0.15)",
                        color: selected.cardType === "game" ? "#f97316" : "#3b82f6",
                      }}
                    >
                      {selected.cardType === "game" ? "🎮 Game Card" : "📘 Skill Cue Card"}
                    </span>
                    <div className="font-bold text-lg mt-1" style={{ color: "var(--text)" }}>
                      {selected.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {selected.category} · {selected.grades}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs px-2 py-1 rounded hover:opacity-70"
                    style={{ color: "var(--dim)" }}
                  >
                    ✕
                  </button>
                </div>

                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
                  {selected.description}
                </p>

                {selected.cardType === "game" ? (
                  <GameCardDetail card={selected as GameCard} />
                ) : (
                  <SkillCardDetail card={selected as SkillCard} />
                )}
              </div>
            ) : (
              <div
                className="rounded-2xl p-5"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="text-center py-12">
                  <div className="text-3xl mb-3">🃏</div>
                  <div className="font-bold text-sm mb-2" style={{ color: "var(--text)" }}>
                    Select a Card
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Click any game or skill card to see the full setup, instructions, and teaching tips.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GameCardDetail({ card }: { card: GameCard }) {
  return (
    <div className="space-y-4 text-xs">
      <DetailSection title="Equipment">{card.equipment}</DetailSection>
      <DetailSection title="Players">{card.players}</DetailSection>
      {card.mvpa && <DetailSection title="MVPA Level">{card.mvpa}</DetailSection>}
      <DetailSection title="Setup">
        <ul className="space-y-1.5">
          {card.setup.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: "var(--green)" }} className="flex-shrink-0">{i + 1}.</span>
              <span style={{ color: "var(--muted)" }}>{s}</span>
            </li>
          ))}
        </ul>
      </DetailSection>
      <DetailSection title="How to Play">
        <ul className="space-y-1.5">
          {card.howToPlay.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: "var(--blue)" }} className="flex-shrink-0">▶</span>
              <span style={{ color: "var(--muted)" }}>{s}</span>
            </li>
          ))}
        </ul>
      </DetailSection>
      <DetailSection title="Variations">
        <ul className="space-y-1.5">
          {card.variations.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: "var(--purple)" }} className="flex-shrink-0">•</span>
              <span style={{ color: "var(--muted)" }}>{s}</span>
            </li>
          ))}
        </ul>
      </DetailSection>
      <DetailSection title="Safety">
        {card.safety.map((s, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <span style={{ color: "#ef4444" }} className="flex-shrink-0">⚠</span>
            <span style={{ color: "var(--muted)" }}>{s}</span>
          </div>
        ))}
      </DetailSection>
    </div>
  );
}

function SkillCardDetail({ card }: { card: SkillCard }) {
  return (
    <div className="space-y-4 text-xs">
      <DetailSection title="TEKS">{card.teks}</DetailSection>
      <DetailSection title="Skill Cues">
        <div className="space-y-3">
          {card.cues.map((cue, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-bebas text-xl w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                >
                  {cue.letter}
                </span>
                <span className="font-bold" style={{ color: "var(--text)" }}>{cue.name}</span>
              </div>
              <p style={{ color: "var(--muted)" }} className="mb-1">{cue.description}</p>
              <p style={{ color: "#ef4444" }}>⚠ {cue.commonMistake}</p>
            </div>
          ))}
        </div>
      </DetailSection>
      <DetailSection title="Teacher Tips">{card.teacherTips}</DetailSection>
      <DetailSection title="Progression">
        <ol className="space-y-1.5">
          {card.progression.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: "#3b82f6" }} className="flex-shrink-0">{i + 1}.</span>
              <span style={{ color: "var(--muted)" }}>{p}</span>
            </li>
          ))}
        </ol>
      </DetailSection>
      <DetailSection title="Equipment">{card.equipment}</DetailSection>
      <DetailSection title="Unit">{card.unit}</DetailSection>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-bold mb-1.5 uppercase tracking-wide text-xs" style={{ color: "var(--dim)" }}>
        {title}
      </div>
      {typeof children === "string" ? (
        <div style={{ color: "var(--muted)" }}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
