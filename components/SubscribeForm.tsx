"use client";

import { useState } from "react";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p style={{ color: "#D4AF37", fontSize: "0.7rem", letterSpacing: "0.15em" }} className="uppercase">
        You&apos;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        style={{
          background: "rgba(242,234,216,0.06)",
          border: "1px solid rgba(242,234,216,0.12)",
          color: "#f2ead8",
          fontSize: "0.7rem",
          letterSpacing: "0.05em",
          padding: "8px 12px",
          outline: "none",
          width: "180px",
        }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          background: "transparent",
          border: "1px solid rgba(212,175,55,0.4)",
          color: "#D4AF37",
          fontSize: "0.6rem",
          letterSpacing: "0.18em",
          padding: "8px 14px",
          cursor: status === "loading" ? "wait" : "pointer",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
      {status === "error" && (
        <span style={{ color: "rgba(242,234,216,0.4)", fontSize: "0.6rem" }}>Try again</span>
      )}
    </form>
  );
}
