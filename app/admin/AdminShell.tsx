"use client";

import { useEffect, useState } from "react";

export function AdminShell({
  email,
  signOutAction,
  children,
}: {
  email: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("admin-theme") === "light") setLight(true);
  }, []);

  const toggle = () =>
    setLight((v) => {
      localStorage.setItem("admin-theme", !v ? "light" : "dark");
      return !v;
    });

  return (
    <div className={`admin-shell${light ? " admin-light" : ""}`}>
      <div className="min-h-screen px-6 lg:px-10 py-10 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-12 pb-6 border-b border-white/8 admin-header-border">
          <div>
            <div className="eyebrow mb-1">Manager Portal</div>
            <h1 className="font-serif text-3xl font-light">
              Villa <em className="text-[var(--amber)]">Cottages</em>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="flex items-center gap-1.5 text-[0.6rem] tracking-[0.15em] uppercase text-cream/45 hover:text-[var(--amber)] transition-colors admin-muted"
            >
              {light ? (
                <>
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Dark
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  Light
                </>
              )}
            </button>
            <span className="text-[0.7rem] text-cream/50 admin-muted">{email}</span>
            <form action={signOutAction}>
              <button className="text-[0.6rem] tracking-[0.22em] uppercase text-cream/45 hover:text-[var(--amber)] transition-colors admin-muted">
                Sign out
              </button>
            </form>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
