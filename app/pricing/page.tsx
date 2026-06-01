"use client";

import Link from "next/link";
import { showToast } from "../../lib/toast";

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "",
    tagline: "Everything you need to get started",
    color: "#6b7280",
    features: [
      "Smart Timer — full access",
      "MVPA Planner — 3 lesson slots",
      "Year at a Glance — view only",
      "Resource Library — 5 cards",
      "Standards Library — browse",
    ],
    cta: "Get Started Free",
    ctaLink: "/dashboard",
    highlight: false,
  },
  {
    name: "Teacher",
    price: 9,
    period: "/month",
    tagline: "Everything a PE teacher needs",
    color: "#22c55e",
    features: [
      "Smart Timer — full access",
      "MVPA Planner — unlimited",
      "Year at a Glance — full 36 weeks",
      "Resource Library — all 31 cards",
      "Standards Library — all 553 standards",
      "Lesson Plan Editor — unlimited plans",
      "PDF print & export",
      "MVPA history & reports",
      "Priority support",
    ],
    cta: "Start Free Trial →",
    ctaLink: "/dashboard",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "School",
    price: 49,
    period: "/month",
    tagline: "For PE departments and campuses",
    color: "#3b82f6",
    features: [
      "Everything in Teacher",
      "Up to 5 teacher accounts",
      "Shared curriculum library",
      "Admin dashboard & reports",
      "MVPA compliance documentation",
      "Campus-wide lesson templates",
      "Dedicated onboarding call",
      "Annual curriculum review",
    ],
    cta: "Contact Us",
    ctaLink: "/dashboard",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Do I need to create an account to use the app?",
    a: "No — the app opens straight to your dashboard with no login required. All your data is saved locally on your device.",
  },
  {
    q: "What happens to my data if I upgrade?",
    a: "Your data lives on your device (localStorage). Nothing is lost when you upgrade. The paid plan just unlocks more features.",
  },
  {
    q: "Is this app aligned to Texas TEKS?",
    a: "Yes — the entire 36-week curriculum is mapped to Texas PE TEKS for grades K–5. SHAPE America standards are also included.",
  },
  {
    q: "Can I try the full Teacher plan before paying?",
    a: "Yes — we offer a 14-day free trial of the Teacher plan with no credit card required.",
  },
  {
    q: "What's the cancellation policy?",
    a: "Cancel anytime — no contracts, no fees. Your account reverts to the free tier and all your saved lesson plans remain accessible.",
  },
];

export default function PricingPage() {
  function handleCTA(plan: typeof PLANS[0]) {
    if (plan.price === 0) return;
    if (plan.name === "School") {
      showToast("School plans — email us at hello@peplaybook.com", "info");
    } else {
      showToast("Free trial coming soon — join the waitlist!", "info");
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="text-center px-6 pt-16 pb-12">
        <div
          className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-widest uppercase"
          style={{ background: "rgba(34,197,94,0.12)", color: "var(--green)", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          Simple, Transparent Pricing
        </div>
        <h1 className="font-bebas text-5xl md:text-6xl tracking-wider mb-4" style={{ color: "var(--text)" }}>
          The Whole Platform.
          <br />
          <span style={{ color: "var(--green)" }}>One Price.</span>
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
          No per-feature pricing. No confusing tiers. Just one complete PE management platform at a price that makes sense
          for teachers.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-6 flex flex-col relative"
              style={{
                background: plan.highlight ? `rgba(34,197,94,0.05)` : "var(--surface)",
                border: `1px solid ${plan.highlight ? "rgba(34,197,94,0.4)" : "var(--border)"}`,
                transform: plan.highlight ? "scale(1.02)" : undefined,
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "#22c55e", color: "#000" }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-5">
                <div className="font-bebas text-2xl tracking-wider mb-1" style={{ color: plan.color }}>
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="font-bebas text-4xl tracking-wider" style={{ color: "var(--text)" }}>
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-sm mb-1.5" style={{ color: "var(--muted)" }}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {plan.tagline}
                </p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span style={{ color: plan.color }} className="flex-shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span style={{ color: "var(--muted)" }}>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.ctaLink && plan.price === 0 ? (
                <Link
                  href={plan.ctaLink}
                  className="w-full flex justify-center font-bold text-sm py-3 rounded-xl transition-all hover:opacity-90"
                  style={{
                    background: plan.highlight ? "#22c55e" : "var(--surface2)",
                    color: plan.highlight ? "#000" : "var(--muted)",
                    border: plan.highlight ? "none" : "1px solid var(--border)",
                  }}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleCTA(plan)}
                  className="w-full font-bold text-sm py-3 rounded-xl transition-all hover:opacity-90"
                  style={{
                    background: plan.highlight ? "#22c55e" : "var(--surface2)",
                    color: plan.highlight ? "#000" : "var(--muted)",
                    border: plan.highlight ? "none" : "1px solid var(--border)",
                  }}
                >
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Feature comparison teaser */}
        <div
          className="rounded-2xl p-8 text-center mb-16"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="font-bebas text-3xl tracking-wider mb-3" style={{ color: "var(--text)" }}>
            Every Feature, Explained
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: "⏱",
                title: "Smart Timer",
                desc: "Sequence-based class runner with auto cool-down trigger. Works from warm-up to the final stretch.",
                color: "#22c55e",
              },
              {
                icon: "📊",
                title: "MVPA Planner",
                desc: "Visual class builder that calculates MVPA percentage in real time. Hit 50% by design, not by accident.",
                color: "#f59e0b",
              },
              {
                icon: "📅",
                title: "Year at a Glance",
                desc: "Full 36-week curriculum map organized by unit, week, and grade band. Plan the entire year in one view.",
                color: "#a855f7",
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-3">
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: f.color }}>
                    {f.title}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="font-bebas text-3xl tracking-wider mb-6" style={{ color: "var(--text)" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl p-5"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="font-bold text-sm mb-2" style={{ color: "var(--text)" }}>
                  {faq.q}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16 pb-8">
          <div className="font-bebas text-4xl tracking-wider mb-3" style={{ color: "var(--text)" }}>
            Ready to Run a Better Class?
          </div>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            No credit card. No account required. Start using the app right now.
          </p>
          <Link
            href="/dashboard"
            className="font-bold text-base px-8 py-4 rounded-xl inline-block hover:opacity-90"
            style={{ background: "#22c55e", color: "#000" }}
          >
            Open the Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
