"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

type VideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  title?: string;
  poster?: string;
};

export default function VideoModal({ isOpen, onClose, src, title = "Asteroid Video", poster }: VideoModalProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClose = useCallback(() => {
    try {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    } catch {}
    setIsExpanded(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5000
  };

  const containerBase: React.CSSProperties = {
    background: "rgba(12,16,36,0.95)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    overflow: "hidden",
    position: "relative"
  };

  const containerExpanded: React.CSSProperties = {
    width: "100vw",
    height: "100vh",
    background: "#000",
    border: "none",
    borderRadius: 0
  };

  const containerCompact: React.CSSProperties = {
    width: "min(90vw, 1100px)"
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600
  };

  const closeOverlayBtn: React.CSSProperties = {
    position: "absolute",
    top: 12,
    right: 12,
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    borderRadius: 999,
    padding: "8px 12px",
    cursor: "pointer",
    zIndex: 10000
  };

  const bodyStyle: React.CSSProperties = {
    position: "relative",
    background: "#000"
  };

  const videoStyle: React.CSSProperties = {
    width: "100%",
    height: isExpanded ? "100vh" : "min(75vh, 70vw)",
    objectFit: "contain",
    display: "block",
    backgroundColor: "#000",
    cursor: "pointer",
    position: "relative",
    zIndex: 0
  };

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div ref={backdropRef} style={backdropStyle} onClick={handleClose} aria-modal="true" role="dialog">
      <div
        style={{
          ...containerBase,
          ...(isExpanded ? containerExpanded : containerCompact)
        }}
        onClick={stopPropagation}
      >
        {!isExpanded && (
          <div style={headerStyle}>
            <div>{title}</div>
            <button
              onClick={handleClose}
              aria-label="Close video"
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        )}

        {/* Always show a prominent close in the corner */}
        <button style={closeOverlayBtn} onClick={handleClose} aria-label="Close video (Esc)">
          ✕
        </button>

        <div style={bodyStyle}>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            style={videoStyle}
            controls
            playsInline
            preload="metadata"
            onClick={() => setIsExpanded((v) => !v)}
            title="Click video to toggle immersive mode"
          />
        </div>
      </div>
    </div>
  );
}
