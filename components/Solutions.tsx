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
          display: "inline-block",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 0.5,
          color: "#fff",
          cursor: "default",
          textTransform: "uppercase",
          backgroundColor: solvable ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
          borderRadius: 4,
          padding: "4px 8px",
          minWidth: "80px",
          textAlign: "center",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px " + (solvable ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"),
          transition: "all 0.2s ease"
        }}
      >
        {solvable ? "Viable" : "Not viable"}
      </span>
      <div
        className="mitigation-tooltip"
        style={{
          position: "absolute",
          top: "50%",
          left: "100%",
          transform: "translateY(-50%)",
          marginLeft: 12,
          width: "min(360px, 72vw)",
          background: "rgba(8, 12, 36, 0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid " + (solvable ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"),
          borderRadius: 8,
          padding: "12px 16px",
          fontSize: 12,
          lineHeight: 1.5,
          color: "#eaf0ff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 30,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
          transition: "all 200ms ease",
        }}
      >
        <div style={{ 
          fontSize: 13,
          fontWeight: 600, 
          marginBottom: 6, 
          color: solvable ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"
        }}>
          Requirements:
        </div>
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
      <h1>Mitigation Strategies</h1>
      <h2 className="asteroid-name">{asteroid.name}</h2>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <a href="https://www2.boulder.swri.edu/~bottke/Reprints/National_Academies_NEO_Report_Defending_Planet_Earth.pdf#page=93">Kinetic impact</a>
              <p>Intercept by a massive spacecraft</p>
            </div>
            <StatusWithTooltip solvable={isKineticSolvable} text={MitigationFactors.KINETIC_IMPACT} />
          </div>
        </li>
        <li>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <a href="https://www2.boulder.swri.edu/~bottke/Reprints/National_Academies_NEO_Report_Defending_Planet_Earth.pdf#page=95">Nuclear explosion</a>
              <p>Close proximity nuclear detonation</p>
            </div>
            <StatusWithTooltip solvable={isNuclearSolvable} text={MitigationFactors.NUCLEAR_EXPLOSION} />
          </div>
        </li>
      </ul>
      <a href="https://doi.org/10.17226/12842" className="solutions-source">
        Source:
        <strong> National Research Council.</strong>{" "}
        <i>
          Defending Planet Earth: Near-Earth-Object Surveys and Hazard
          Mitigation Strategies.{" "}
        </i>
        Washington, DC: The National Academies Press, 2010.
      </a>
    </div>
  );
}

export default Solutions;
