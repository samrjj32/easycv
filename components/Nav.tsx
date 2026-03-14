"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/",        label: "Home"      },
  { href: "/generate",label: "Generate"  },
  { href: "/profile", label: "My CV"     },
  { href: "/results", label: "Results"   },
];

export default function Nav({ active }: { active?: string }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "var(--bg)",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* subtle top accent line */}
      <div style={{ height: 2, background: "var(--accent)", opacity: 0.7 }} />

      <div style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 8,
          textDecoration: "none", flexShrink: 0,
        }}>
          <div style={{
            width: 26, height: 26,
            background: "var(--accent)",
            borderRadius: 5,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <span className="hidden sm:block" style={{
            fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
            fontSize: 14,
            color: "var(--text)",
            letterSpacing: "-0.02em",
          }}>
            easycv
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 2, overflowX: "auto" }} className="scrollbar-hide">
          {NAV.map((item) => {
            const isActive = active === item.href || (!active && item.href === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-2 sm:px-3"
                style={{
                  paddingTop: 5, paddingBottom: 5,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "var(--text)" : "var(--text-2)",
                  background: isActive ? "var(--surface-2)" : "transparent",
                  border: isActive ? "1px solid var(--border)" : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.12s",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}