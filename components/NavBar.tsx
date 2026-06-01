"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

const navLinks: { href: string; label: string; external?: boolean }[] = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/app/timer/", label: "Timer", external: true },
  { href: "/mvpa", label: "MVPA" },
  { href: "/lessons", label: "Lessons" },
  { href: "/standards", label: "Standards" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/pricing", label: "Pricing" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 20px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-bebas, 'Bebas Neue', Impact, sans-serif)",
              fontSize: 22,
              letterSpacing: 3,
              color: "var(--text)",
            }}
          >
            The PE{" "}
            <span style={{ color: "var(--green)" }}>PLAYBOOK</span>
          </span>
        </Link>

        {/* Nav links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flex: 1,
            overflowX: "auto",
          }}
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href.replace(/\/$/, ""));
            const sharedStyle = {
              padding: "6px 12px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap" as const,
              transition: "all 0.15s",
              background: isActive ? "var(--surface2)" : "transparent",
              color: isActive ? "var(--text)" : "var(--muted)",
              border: isActive
                ? "1px solid var(--border2)"
                : "1px solid transparent",
            };
            const badge = link.label === "Timer" ? (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 8,
                  padding: "1px 5px",
                  borderRadius: 99,
                  background: "var(--green)22",
                  color: "var(--green)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Live
              </span>
            ) : null;

            return link.external ? (
              <a key={link.href} href={link.href} style={sharedStyle}>
                {link.label}{badge}
              </a>
            ) : (
              <Link key={link.href} href={link.href} style={sharedStyle}>
                {link.label}{badge}
              </Link>
            );
          })}
        </div>

        {/* Auth CTA */}
        {userEmail ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: "var(--dim)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail}
            </span>
            <button
              onClick={handleSignOut}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                background: "var(--surface2)",
                color: "var(--muted)",
                fontWeight: 700,
                fontSize: 12,
                border: "1px solid var(--border)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              background: "var(--green)",
              color: "#000",
              fontWeight: 700,
              fontSize: 12,
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Sign In →
          </Link>
        )}
      </div>
    </nav>
  );
}
