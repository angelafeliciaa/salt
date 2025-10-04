"use client";

import React, { useState } from "react";
import { AsteroidData } from "./Asteroid";

interface SolutionsProps {
  asteroid: AsteroidData | null;
}

enum MitigationFactors {
  CIVIL_DEFENSE = "Warning time ≥ 1 month; impact area ≤ 1000 km² for manageable evacuation; sufficient local infrastructure to move population quickly.",
  PUSH_PULL = "Warning time ≥ 10 years; spacecraft capable of continuous micro-newton to milli-newton thrust; asteroid mass ≤ 5×10¹¹ kg (~0.4 km diameter for typical density); precise station-keeping within meters.",
  KINETIC_IMPACT = "Warning time ≥ 5–10 years; impactor mass ≥ 1–10 tons; relative velocity ~5–20 km/s; asteroid structure known to within ±30% porosity/density; momentum enhancement factor β ≥ 1–2.",
  NUCLEAR_EXPLOSION = "Warning time ≥ 2–5 years; yield sufficient to impart Δv ≥ 1–10 cm/s; detonation distance carefully calculated (stand-off or surface); asteroid composition known; fragmentation risk acceptable; international/legal approval obtained.",
}

enum AsteroidSize {
  VERY_SMALL = 0.01,
  SMALL = 0.025,
  MODEST_SIZED = 0.1,
  DANGEROUSLY_LARGE = 0.4,
  VERY_DANGEROUSLY_LARGE = 0.8,
}

function StatusWithTooltip({ solvable, text }: { solvable: boolean; text: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: 0.3,
          color: solvable ? "#22c55e" : "#ef4444",
          cursor: "default",
          textTransform: "uppercase",
        }}
      >
        {solvable ? "Solvable" : "Can't solve"}
      </span>
      <div
        className="mitigation-tooltip"
        style={{
          position: "absolute",
          top: "50%",
          left: "100%",
          transform: "translateY(-50%)",
          marginLeft: 8,
          width: "min(360px, 72vw)",
          background: "rgba(6,10,28,0.9)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 12,
          lineHeight: 1.4,
          color: "#eaf0ff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 30,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
          transition: "opacity 120ms ease",
        }}
      >
        {text}
      </div>
    </div>
  );
}

export function Solutions({ asteroid }: SolutionsProps) {
  if (!asteroid) return null;

  // Get the most recent close approach data
  const latestApproach =
    asteroid.closeApproachData && asteroid.closeApproachData.length > 0
      ? asteroid.closeApproachData[0]
      : null;

  const isCivilDefenseSolvable = asteroid.diameter.avg < AsteroidSize.MODEST_SIZED;
  const isPushPullSolvable = asteroid.diameter.avg < AsteroidSize.DANGEROUSLY_LARGE;
  const isKineticSolvable = asteroid.diameter.avg < AsteroidSize.DANGEROUSLY_LARGE;
  const isNuclearSolvable = asteroid.diameter.avg < AsteroidSize.VERY_DANGEROUSLY_LARGE;
  return (
    <div className="asteroid-solutions-panel">
      <h2 className="asteroid-name">Solutions</h2>
      <ul className="solutions-list">
        <li>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <a href="https://www2.boulder.swri.edu/~bottke/Reprints/National_Academies_NEO_Report_Defending_Planet_Earth.pdf#page=88">Civil defense</a>
              <p>Warning, shelter, and evacuation</p>
            </div>
            <StatusWithTooltip solvable={isCivilDefenseSolvable} text={MitigationFactors.CIVIL_DEFENSE} />
          </div>
        </li>
        <li>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <a href="https://www2.boulder.swri.edu/~bottke/Reprints/National_Academies_NEO_Report_Defending_Planet_Earth.pdf#page=90">Slow push/pull</a>
              <p>“Gravity tractor” with a rendezvous spacecraft</p>
            </div>
            <StatusWithTooltip solvable={isPushPullSolvable} text={MitigationFactors.PUSH_PULL} />
          </div>
        </li>
        <li>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
          <a href="https://www2.boulder.swri.edu/~bottke/Reprints/National_Academies_NEO_Report_Defending_Planet_Earth.pdf#page=93">Kinetic impact</a>
          <p>Intercept by a massive spacecraft</p>
            </div>
            <StatusWithTooltip solvable={isKineticSolvable} text={MitigationFactors.KINETIC_IMPACT} />
          </div>
        </li>
        <li>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
          <a href="https://www2.boulder.swri.edu/~bottke/Reprints/National_Academies_NEO_Report_Defending_Planet_Earth.pdf#page=95">Nuclear explosion</a>
          <p>Close proximity nuclear explosion</p>
            </div>
            <StatusWithTooltip solvable={isNuclearSolvable} text={MitigationFactors.NUCLEAR_EXPLOSION} />
          </div>
        </li>
      </ul>
      <p>
        <a href="https://doi.org/10.17226/12842" className="solutions-source">
          Source:
          <strong> National Research Council.</strong>{" "}
          <i>
            Defending Planet Earth: Near-Earth-Object Surveys and Hazard
            Mitigation Strategies.{" "}
          </i>
          Washington, DC: The National Academies Press, 2010.
        </a>
      </p>
    </div>
  );
}

export default Solutions;
