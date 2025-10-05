import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ width: "100vw", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 22 }}>Salt</span>
          <span style={{ opacity: 0.7, fontSize: 12, letterSpacing: 0.4 }}>Exploration</span>
        </div>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/sandbox" style={{ textDecoration: "none" }}>
            <button className="ghost">Open Sandbox</button>
          </Link>
        </nav>
      </header>
      <section style={{ flex: 1, display: "grid", alignItems: "center", padding: "0 28px 28px", gap: 56 }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center", padding: "160px 0 100px" }}>
          <h1 style={{ margin: 0, fontSize: 112, lineHeight: 1.02, fontWeight: 600 }}>Salt</h1>
          <p style={{ marginTop: 18, opacity: 0.9, fontSize: 20 }}>
            Interactive space sandbox showcasing asteroid data, orbits, and impact heuristics. Explore the live model below or open the full experience.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 18 }}>
            <Link href="/sandbox" style={{ textDecoration: "none" }}>
              <button className="ghost" style={{ padding: "12px 18px", fontSize: 16 }}>Start Sandbox</button>
            </Link>
          </div>
        </div>
        <div style={{ maxWidth: 1100, width: "100%", margin: "20px auto 0", position: "relative" }}>
          <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <iframe
              src="/sandbox"
              title="Sandbox Preview"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, pointerEvents: "none", filter: "saturate(0.95) brightness(0.92)" }}
            />
            {/* Full overlay link to open sandbox when clicking anywhere */}
            <Link href="/sandbox" aria-label="Open Sandbox" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
              <span style={{ display: "none" }}>Open Sandbox</span>
            </Link>
            <div style={{ position: "absolute", right: 12, bottom: 12, display: "flex", gap: 8, zIndex: 2 }}>
              <Link href="/sandbox" style={{ textDecoration: "none" }}>
                <button className="ghost" style={{ backdropFilter: "blur(6px)" }}>Open Live</button>
              </Link>
            </div>
          </div>
          <p style={{ marginTop: 10, opacity: 0.65, fontSize: 12, textAlign: "center" }}>
            Preview is non-interactive. Click anywhere to open the live sandbox.
          </p>
        </div>
        <div style={{ maxWidth: 1100, width: "100%", margin: "28px auto 0", padding: "0 0 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, textAlign: "left" }}>
            <div style={{ background: "rgba(6,10,28,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
              <h2 style={{ margin: 0, fontSize: 18, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 700, opacity: 0.95 }}>Why It Matters</h2>
              <p style={{ marginTop: 10, opacity: 0.9, fontSize: 14, lineHeight: 1.6 }}>
                A newly discovered asteroid, Impactor-2025, may one day intersect Earth’s path. Yet today, we lack intuitive and public tools to visualize what that could mean — the blast zone, the shock waves, the fallout, the decisions we’d face. This sandbox brings all that into view.
              </p>
            </div>
            <div style={{ background: "rgba(6,10,28,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
              <h2 style={{ margin: 0, fontSize: 18, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 700, opacity: 0.95 }}>Explore & Simulate</h2>
              <p style={{ marginTop: 10, opacity: 0.9, fontSize: 14, lineHeight: 1.6 }}>
                Visualize real orbits. Test impact scenarios. Try mitigation strategies. Shift the timeline, tweak parameters, and see the consequences mapped in real time.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>Visualize real orbits</span>
                <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>Test impact scenarios</span>
                <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>Try mitigation strategies</span>
                <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>Shift the timeline</span>
                <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>Tweak parameters</span>
                <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>See consequences in real time</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

