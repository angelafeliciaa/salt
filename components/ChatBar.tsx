"use client";

import React, { useState } from "react";
import type { AsteroidData } from "./Asteroid";

type ChatBarProps = {
  selectedAsteroid?: AsteroidData | null;
};

export default function ChatBar({ selectedAsteroid }: ChatBarProps) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    const text = message.trim();
    if (!text) return;
    try {
      setLoading(true);
      setErr(null);
      setReply("");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: selectedAsteroid
            ? {
                summary: {
                  id: selectedAsteroid.id,
                  name: selectedAsteroid.name,
                  diameter: selectedAsteroid.diameter,
                  hazardous: selectedAsteroid.isPotentiallyHazardous,
                  orbitClass: selectedAsteroid.orbitData?.orbitClass,
                  velocity_km_s:
                    selectedAsteroid.closeApproachData?.[0]?.velocity?.kmPerSecond,
                  missDistance_au:
                    selectedAsteroid.closeApproachData?.[0]?.missDistance?.astronomical,
                },
                full: selectedAsteroid
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErr(data.error || "Chat request failed");
      } else {
        setReply(data.reply || "");
      }
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
      setMessage("");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send();
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 16,
        transform: "translateX(-50%)",
        zIndex: 1200,
        width: "min(900px, 92vw)",
      }}
    >
      {/* Reply bubble */}
      {(reply || err) && (
        <div
          style={{
            marginBottom: 8,
            background: "rgba(12, 16, 36, 0.92)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "10px 12px",
            color: "#fff",
            fontSize: 13,
            lineHeight: 1.5,
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            whiteSpace: "pre-wrap",
            position: "relative",
          }}
        >
          <button
            onClick={() => {
              setReply("");
              setErr(null);
            }}
            aria-label="Hide chat response"
            title="Hide"
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
              borderRadius: 999,
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
          {err ? (
            <span style={{ color: "#ff8a7a" }}>Error: {err}</span>
          ) : (
            reply
          )}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          gap: 8,
          background: "rgba(6,10,28,0.9)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 999,
          padding: 8,
          alignItems: "center",
          backdropFilter: "blur(8px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            selectedAsteroid
              ? `Ask about ${selectedAsteroid.name}…`
              : "Ask the Groq assistant…"
          }
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fff",
            fontSize: 14,
            padding: "8px 10px",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="ghost"
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          title="Send"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
