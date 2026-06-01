"use client";

import Link from "next/link";
import { showToast } from "../../lib/toast";

const FEATURED = [
  {
    id: "m1",
    title: "Complete Basketball Unit — Weeks 19–22",
    author: "Brandon (PE Playbook)",
    type: "Unit Pack",
    price: 12,
    rating: 4.9,
    reviews: 47,
    grades: "K–5",
    desc: "Four-week basketball curriculum with lesson plans, MVPA data, game cards, and skill cue cards for dribbling, chest pass, and BEEF shooting.",
    tags: ["Basketball", "4 weeks", "TEKS aligned"],
    color: "#f97316",
    badge: "Featured",
  },
  {
    id: "m2",
    title: "Soccer Unit — Pass, Trap & Shoot",
    author: "Brandon (PE Playbook)",
    type: "Unit Pack",
    price: 10,
    rating: 4.8,
    reviews: 31,
    grades: "K–5",
    desc: "Four-week soccer unit covering dribbling, passing, kicking technique, and game application. Includes Sharks & Minnows Dribble and Mini Soccer.",
    tags: ["Soccer", "4 weeks", "MVPA 60%+"],
    color: "#22c55e",
    badge: "Best Seller",
  },
  {
    id: "m3",
    title: "Management & Procedures — Week 1",
    author: "Brandon (PE Playbook)",
    type: "Lesson Plans",
    price: 0,
    rating: 5.0,
    reviews: 89,
    grades: "K–5",
    desc: "Free complete Week 1 lesson plans for setting up a structured PE environment. Home base, rotation practice, freeze signal, and exit procedures.",
    tags: ["Free", "Management", "First week"],
    color: "#3b82f6",
    badge: "Free",
  },
  {
    id: "m4",
    title: "Jump Rope Mastery — Weeks 23–24",
    author: "Coach Jenna PE",
    type: "Lesson Plans",
    price: 8,
    rating: 4.7,
    reviews: 22,
    grades: "K–5",
    desc: "Two-week jump rope unit with progressions from pool noodle to double dutch. Includes long rope, self-turning, and jump rope rhymes.",
    tags: ["Jump Rope", "2 weeks", "Cardio"],
    color: "#a855f7",
  },
  {
    id: "m5",
    title: "Gymnastics Body Rolls Unit",
    author: "PE Teacher Pro",
    type: "Lesson Plans",
    price: 9,
    rating: 4.6,
    reviews: 18,
    grades: "K–3",
    desc: "Two-week gymnastics unit focusing on log rolls, egg rolls, and forward rolls with progression guides and safety protocols.",
    tags: ["Gymnastics", "Safety focus", "K–3"],
    color: "#06b6d4",
  },
  {
    id: "m6",
    title: "Warm-Up Exercise Library — 40 Exercises",
    author: "FitPE Resources",
    type: "Resource",
    price: 5,
    rating: 4.8,
    reviews: 63,
    grades: "K–5",
    desc: "40 warm-up exercises with cues, modifications, and timing guide. Organized by intensity level and body area.",
    tags: ["Warm-Up", "Reference", "40 exercises"],
    color: "#f59e0b",
  },
];

const CATEGORIES = [
  { name: "Unit Packs", icon: "📦", count: 14, color: "#f97316" },
  { name: "Lesson Plans", icon: "📋", count: 38, color: "#3b82f6" },
  { name: "Game Cards", icon: "🎮", count: 12, color: "#22c55e" },
  { name: "Skill Cards", icon: "📘", count: 8, color: "#a855f7" },
  { name: "Assessment Tools", icon: "📊", count: 6, color: "#f59e0b" },
  { name: "Free Resources", icon: "🎁", count: 9, color: "#06b6d4" },
];

export default function MarketplacePage() {
  function handleBuy(item: typeof FEATURED[0]) {
    if (item.price === 0) {
      showToast(`"${item.title}" downloaded!`, "success");
    } else {
      showToast("Checkout coming soon — join the waitlist!", "info");
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <div className="border-b px-6 py-12 text-center" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div
          className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-widest uppercase"
          style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)" }}
        >
          Community Marketplace
        </div>
        <h1 className="font-bebas text-5xl md:text-6xl tracking-wider mb-4" style={{ color: "var(--text)" }}>
          Where PE Teachers
          <br />
          <span style={{ color: "#f97316" }}>Teach, Create, and Get Paid.</span>
        </h1>
        <p className="text-base max-w-xl mx-auto mb-8" style={{ color: "var(--muted)" }}>
          Great PE teachers already create amazing lessons. Now they can share and sell them.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => showToast("Seller accounts coming soon — join the waitlist!", "info")}
            className="font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90"
            style={{ background: "#f97316", color: "#000" }}
          >
            Become a Seller →
          </button>
          <Link
            href="#browse"
            className="font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-80"
            style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}
          >
            Browse Resources
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Categories */}
        <div className="mb-10">
          <h2 className="font-bebas text-3xl tracking-wider mb-5" style={{ color: "var(--text)" }}>
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => showToast(`Browsing ${cat.name}`, "info")}
                className="rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="text-xs font-bold" style={{ color: "var(--text)" }}>
                  {cat.name}
                </div>
                <div className="text-xs mt-1" style={{ color: cat.color }}>
                  {cat.count} items
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        <div id="browse">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bebas text-3xl tracking-wider" style={{ color: "var(--text)" }}>
              Featured Resources
            </h2>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              {FEATURED.length} items shown
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl p-5 flex flex-col"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{ background: `${item.color}18`, color: item.color }}
                    >
                      {item.type}
                    </span>
                    {item.badge && (
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          background: item.badge === "Free" ? "rgba(34,197,94,0.15)" : item.badge === "Best Seller" ? "rgba(245,158,11,0.15)" : "rgba(249,115,22,0.15)",
                          color: item.badge === "Free" ? "#22c55e" : item.badge === "Best Seller" ? "#f59e0b" : "#f97316",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bebas text-xl" style={{ color: item.price === 0 ? "#22c55e" : "var(--text)" }}>
                      {item.price === 0 ? "FREE" : `$${item.price}`}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm mb-1" style={{ color: "var(--text)" }}>
                  {item.title}
                </h3>
                <div className="text-xs mb-3" style={{ color: item.color }}>
                  {item.author} · {item.grades}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-xs font-bold" style={{ color: "#f59e0b" }}>★</span>
                  <span className="text-xs font-bold" style={{ color: "var(--text)" }}>{item.rating}</span>
                  <span className="text-xs" style={{ color: "var(--dim)" }}>({item.reviews} reviews)</span>
                </div>

                {/* Description */}
                <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: "var(--muted)" }}>
                  {item.desc}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: "var(--surface2)", color: "var(--dim)", border: "1px solid var(--border)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleBuy(item)}
                  className="w-full font-bold text-sm py-2.5 rounded-xl transition-all hover:opacity-90"
                  style={{
                    background: item.price === 0 ? "#22c55e" : item.color,
                    color: "#000",
                  }}
                >
                  {item.price === 0 ? "Download Free →" : `Add to Cart — $${item.price}`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Seller CTA */}
        <div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{ background: "var(--surface)", border: "1px solid rgba(249,115,22,0.3)" }}
        >
          <div className="font-bebas text-3xl tracking-wider mb-3" style={{ color: "#f97316" }}>
            Become a Seller
          </div>
          <p className="text-sm max-w-xl mx-auto mb-6" style={{ color: "var(--muted)" }}>
            Share your lesson plans, unit packs, and game cards with PE teachers across the country. Set your own prices
            and earn passive income doing what you already do — build amazing PE curriculum.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            {[
              { label: "Your Price", val: "You Set It" },
              { label: "Your Cut", val: "70%" },
              { label: "Setup", val: "Free" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-bebas text-2xl" style={{ color: "#f97316" }}>{s.val}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => showToast("Seller applications open soon — we'll notify you!", "info")}
            className="font-bold text-sm px-8 py-3 rounded-xl hover:opacity-90"
            style={{ background: "#f97316", color: "#000" }}
          >
            Apply to Sell →
          </button>
        </div>
      </div>
    </div>
  );
}
