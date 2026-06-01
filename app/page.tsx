import Link from "next/link";

const features = [
  {
    icon: "⏱",
    color: "#22c55e",
    title: "Smart Timer",
    tagline: "From warm-up to cool-down — fully organized.",
    desc: "Sequence-based class runner with auto cool-down trigger, rotation alerts, and phase tracking. Built for the gym — not the office.",
    href: "/timer",
    badge: "Live",
  },
  {
    icon: "📊",
    color: "#f59e0b",
    title: "MVPA Planner",
    tagline: "Hit 50% by design.",
    desc: "Visual class builder that calculates MVPA percentage in real time. Don't hope your class hits the target — plan it.",
    href: "/mvpa",
  },
  {
    icon: "📋",
    color: "#3b82f6",
    title: "Lesson Plan Editor",
    tagline: "Every station has a purpose. Every minute has a plan.",
    desc: "Build, save, and print standards-aligned lesson plans for K–5. Drag-and-drop warm-ups, skill stations, and game cards.",
    href: "/lessons",
  },
  {
    icon: "📅",
    color: "#a855f7",
    title: "Year at a Glance",
    tagline: "36 weeks, planned before August.",
    desc: "Full-year curriculum map organized by unit, week, and grade band. See the whole picture before you write a single lesson plan.",
    href: "/year",
  },
  {
    icon: "📚",
    color: "#06b6d4",
    title: "Standards Library",
    tagline: "432 Texas TEKS + 121 SHAPE America indicators.",
    desc: "Search, filter, and reference every K-12 PE standard. Tag lessons to standards with one click.",
    href: "/standards",
  },
  {
    icon: "🏪",
    color: "#f97316",
    title: "Marketplace",
    tagline: "Great PE teachers can share and sell their plans.",
    desc: "Browse community lesson plans, game cards, and unit packs. Or sell your own curriculum to fellow PE teachers.",
    href: "/marketplace",
  },
];

const whoFor = [
  {
    emoji: "🏃",
    title: "Elementary PE Teachers",
    items: [
      "K–5 curriculum mapped to 36 weeks",
      "TEKS & SHAPE standards built in",
      "Age-appropriate game and skill cards",
    ],
  },
  {
    emoji: "🏫",
    title: "PE Department Leads",
    items: [
      "Consistent curriculum across teachers",
      "MVPA documentation for admin",
      "Shareable lesson plan templates",
    ],
  },
  {
    emoji: "🎓",
    title: "PE Teachers Tired of 5 Apps",
    items: [
      "Timer, planner, and library in one place",
      "No more Google Sheets MVPA tracking",
      "Everything saves automatically",
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <section className="px-6 pt-20 pb-24 text-center max-w-4xl mx-auto">
        <div
          className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-6 tracking-widest uppercase"
          style={{ background: "rgba(34,197,94,0.12)", color: "var(--green)", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          Built by a PE Teacher · For PE Teachers
        </div>

        <h1
          className="font-bebas text-6xl md:text-8xl tracking-wider leading-none mb-6"
          style={{ color: "var(--text)" }}
        >
          The Operating System
          <br />
          <span style={{ color: "var(--green)" }}>for Modern PE Teachers.</span>
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
          One screen. Everything in one place. Smart Timer, MVPA Planner, Lesson Editor, Year at a Glance, and a
          Standards Library — all built the way PE teachers actually teach.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="font-dm font-bold text-base px-8 py-4 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--green)", color: "#000" }}
          >
            Open Your Dashboard →
          </Link>
          <Link
            href="/timer"
            className="font-dm font-semibold text-base px-8 py-4 rounded-xl transition-all hover:opacity-80"
            style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}
          >
            Try the Smart Timer
          </Link>
        </div>

        <p className="text-sm mt-5" style={{ color: "var(--dim)" }}>
          No account required · All data stays on your device
        </p>
      </section>

      {/* Stats bar */}
      <div className="border-y px-6 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: "36", label: "Weeks of Curriculum" },
            { num: "432", label: "TEKS Standards" },
            { num: "19", label: "Game Cards" },
            { num: "12", label: "Skill Cue Cards" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-bebas text-4xl tracking-wider" style={{ color: "var(--green)" }}>
                {s.num}
              </div>
              <div className="text-xs font-semibold tracking-wide uppercase mt-1" style={{ color: "var(--muted)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-bebas text-5xl tracking-wider mb-3" style={{ color: "var(--text)" }}>
            Everything PE Teachers Need
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
            PE teachers shouldn&apos;t need five different apps just to run one class.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group rounded-2xl p-6 transition-all hover:scale-[1.02]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="text-2xl w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}40` }}
                >
                  {f.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-dm font-bold text-base" style={{ color: "var(--text)" }}>
                      {f.title}
                    </span>
                    {f.badge && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.15)", color: "var(--green)" }}
                      >
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: f.color }}>
                    {f.tagline}
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {f.desc}
              </p>
              <div
                className="mt-4 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all"
                style={{ color: f.color }}
              >
                Open {f.title} →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="px-6 py-20 border-t" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-bebas text-5xl tracking-wider mb-3" style={{ color: "var(--text)" }}>
              Built for Real PE Teachers
            </h2>
            <p className="text-base" style={{ color: "var(--muted)" }}>
              Not a generic teaching tool repurposed for PE — built specifically for how PE works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {whoFor.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl p-6"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <div className="text-3xl mb-3">{w.emoji}</div>
                <h3 className="font-dm font-bold text-base mb-4" style={{ color: "var(--text)" }}>
                  {w.title}
                </h3>
                <ul className="space-y-3">
                  {w.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "var(--muted)" }}>
                      <span style={{ color: "var(--green)" }} className="mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder voice section */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <div
          className="rounded-2xl p-10"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="font-bebas text-2xl tracking-wider mb-6"
            style={{ color: "var(--green)", letterSpacing: "4px" }}
          >
            The PE Playbook Story
          </div>
          <blockquote className="text-xl font-dm font-semibold leading-relaxed mb-6" style={{ color: "var(--text)" }}>
            &ldquo;I don&apos;t teach games. I teach skills. The games come from the skills.&rdquo;
          </blockquote>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--muted)" }}>
            Built by a PE teacher who spent 10 years doing it the hard way — cobbling together timers, spreadsheets,
            Google Docs, and sticky notes to run a single class. The PE Playbook is what I wish I had on day one.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/pricing"
              className="font-dm font-bold text-sm px-6 py-3 rounded-xl transition-all hover:opacity-90"
              style={{ background: "var(--green)", color: "#000" }}
            >
              Start Free Trial →
            </Link>
            <Link
              href="/dashboard"
              className="font-dm font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:opacity-80"
              style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}
            >
              Explore the App
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-10" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bebas text-xl tracking-widest" style={{ color: "var(--text)" }}>
              The PE <span style={{ color: "var(--green)" }}>PLAYBOOK</span>
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--dim)" }}>
              Built by a PE teacher · For PE teachers
            </div>
          </div>
          <div className="flex gap-6 text-sm" style={{ color: "var(--muted)" }}>
            {[
              ["Dashboard", "/dashboard"],
              ["Timer", "/timer"],
              ["MVPA", "/mvpa"],
              ["Lessons", "/lessons"],
              ["Pricing", "/pricing"],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
