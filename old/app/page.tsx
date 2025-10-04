'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Scene = dynamic(() => import('../src/components/Scene'), { ssr: false });

export default function HomePage() {
  return (
    <>
      <div id="hud">
        <div className="brand">
          <span className="logo">☄️</span>
          <span className="title">Asteroid Risk Lab</span>
        </div>
        <div className="controls">
          <label className="speed">
            <span>Time scale</span>
            <input id="timeScale" type="range" min="0.1" max="5" step="0.1" defaultValue={"1"} />
          </label>
          <button id="resetView" className="ghost">Reset Camera</button>
        </div>
      </div>

      <div id="scene-container" aria-label="3D solar scene" role="img">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      <aside id="info-panel" aria-live="polite">
        <div className="panel-header">
          <div className="panel-title">Object Inspector</div>
          <div className="panel-subtitle" id="objectSubtitle">Click a small object (asteroid) to inspect</div>
        </div>
        <div className="panel-body" id="panelBody">
          <div className="empty">No object selected</div>
        </div>
      </aside>

      <div id="legend">
        <div>Click asteroids to view <strong>Discovery %</strong> and <strong>Destruction %</strong></div>
        <div>Drag to orbit • Scroll to zoom • Right-drag to pan</div>
      </div>
    </>
  );
}


