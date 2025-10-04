'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

type Asteroid = {
  id: string;
  name: string;
  color: number;
  semiMajorAu: number;
  eccentricity: number;
  inclinationDeg: number;
  meanMotionDegPerDay: number;
  meanAnomalyDegAtEpoch: number;
  discoveryPercent: number;
  destructionPercent: number;
  sizeMeters: number;
};

const mockAsteroids: Asteroid[] = [
  { id: '2025-A', name: 'Impactor-2025', color: 0xff7766, semiMajorAu: 1.1, eccentricity: 0.2, inclinationDeg: 4, meanMotionDegPerDay: 0.9, meanAnomalyDegAtEpoch: 0, discoveryPercent: 72, destructionPercent: 41, sizeMeters: 320 },
  { id: 'NEO-23', name: 'Aphelion-X', color: 0x7cc4ff, semiMajorAu: 1.6, eccentricity: 0.36, inclinationDeg: 7, meanMotionDegPerDay: 0.6, meanAnomalyDegAtEpoch: 120, discoveryPercent: 45, destructionPercent: 18, sizeMeters: 120 },
  { id: 'NEO-77', name: 'Juno-Scout', color: 0xffb86b, semiMajorAu: 0.9, eccentricity: 0.1, inclinationDeg: 2, meanMotionDegPerDay: 1.1, meanAnomalyDegAtEpoch: 210, discoveryPercent: 85, destructionPercent: 5, sizeMeters: 60 },
  { id: 'NEO-91', name: 'Perseid-Drift', color: 0xb58bff, semiMajorAu: 2.2, eccentricity: 0.5, inclinationDeg: 12, meanMotionDegPerDay: 0.4, meanAnomalyDegAtEpoch: 300, discoveryPercent: 31, destructionPercent: 58, sizeMeters: 540 }
];

const AU_TO_UNITS = 50; // 1 AU => 50 units visually

export default function Scene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const panelBody = document.getElementById('panelBody') as HTMLDivElement | null;
    const objectSubtitle = document.getElementById('objectSubtitle') as HTMLDivElement | null;
    const timeScaleInput = document.getElementById('timeScale') as HTMLInputElement | null;
    const resetViewBtn = document.getElementById('resetView') as HTMLButtonElement | null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Remove fog to maximize ring visibility
    scene.fog = null as any;
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0, 60, 140);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.045;
    controls.maxDistance = 400;
    controls.minDistance = 20;

    const sunLight = new THREE.PointLight(0xffffff, 2.2, 0, 2);
    sunLight.position.set(-120, 0, -40);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x335, 0.25));

    const starGeo = new THREE.SphereGeometry(2000, 64, 64);
    const starMat = new THREE.MeshBasicMaterial({ color: 0x000105, side: THREE.BackSide });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    scene.add(starMesh);

    const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 64, 64), new THREE.MeshBasicMaterial({ color: 0xffd27d }));
    sun.position.set(-120, 0, -40);
    scene.add(sun);
    const glow = new THREE.PointLight(0xffd27d, 1.4, 0, 2);
    glow.position.set(-120, 0, -40);
    scene.add(glow);

    // Earth is the center node
    const earth = new THREE.Mesh(new THREE.SphereGeometry(2.2, 48, 48), new THREE.MeshStandardMaterial({ color: 0x6ea8ff, metalness: 0.1, roughness: 0.6 }));
    earth.position.set(0, 0, 0);
    earth.name = 'Earth';
    scene.add(earth);
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(2.35, 48, 48), new THREE.MeshBasicMaterial({ color: 0x8fd3ff, transparent: true, opacity: 0.15 }));
    atmo.position.copy(earth.position);
    scene.add(atmo);

    const asteroidMeshes: THREE.Mesh[] = [];
    for (const a of mockAsteroids) {
      const aOrbit = makeEllipticalOrbitMesh(a.semiMajorAu * AU_TO_UNITS, a.eccentricity, a.inclinationDeg, 0xffffff, 1.0, 1.2);
      scene.add(aOrbit);
      const radius = Math.max(0.3, Math.min(2.0, a.sizeMeters / 400));
      const asteroid = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 1), new THREE.MeshStandardMaterial({ color: a.color, metalness: 0.2, roughness: 0.5 }));
      (asteroid as any).userData = { ...a };
      asteroid.position.copy(keplerToPosition(a, 0));
      scene.add(asteroid);
      asteroidMeshes.push(asteroid);
    }

    // Postprocessing: Bloom for glowing rings
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.25, 0.6, 0.0);
    composer.addPass(bloomPass);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(asteroidMeshes, false);
      if (intersects.length > 0) selectObject(intersects[0].object as THREE.Mesh);
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const timeScale = () => parseFloat((timeScaleInput?.value ?? '1')) || 1;
    resetViewBtn?.addEventListener('click', () => {
      camera.position.set(0, 60, 140);
      controls.target.set(0, 0, 0);
      controls.update();
    });

    const clock = new THREE.Clock();
    let hovered: THREE.Mesh | null = null;
    const animate = () => {
      const dt = clock.getDelta();
      const elapsedDays = dt * timeScale() * 2.5 * 50 + (Date.now() % 100000) * 0.00001; // drift

      for (let i = 0; i < asteroidMeshes.length; i++) {
        const a = (asteroidMeshes[i] as any).userData as Asteroid;
        const pos = keplerToPosition(a, elapsedDays);
        asteroidMeshes[i].position.copy(pos);
        asteroidMeshes[i].rotation.y += 0.01 + (a.sizeMeters % 7) * 0.0005;
      }

      raycaster.setFromCamera(mouse, camera);
      const intersections = raycaster.intersectObjects(asteroidMeshes, false);
      if (intersections.length > 0) {
        const obj = intersections[0].object as THREE.Mesh;
        if (hovered && hovered !== obj) setEmissive(hovered, 0);
        hovered = obj;
        setEmissive(obj, 0.25);
      } else if (hovered) {
        setEmissive(hovered, 0);
        hovered = null;
      }

      controls.update();
      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    function selectObject(obj: THREE.Mesh) {
      const data = (obj as any).userData as Asteroid;
      if (objectSubtitle) objectSubtitle.textContent = `${data.name}`;
      if (!panelBody) return;
      panelBody.innerHTML = '';
      panelBody.appendChild(renderInspector(data));
      const base = new THREE.Color((obj.material as THREE.MeshStandardMaterial).color.getHex());
      (obj.material as THREE.MeshStandardMaterial).emissive = base.clone().multiplyScalar(0.2);
      setTimeout(() => { (obj.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x000000); }, 250);
    }

    function renderInspector(data: Asteroid) {
      const wrap = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'object-name';
      name.textContent = data.name;
      wrap.appendChild(name);
      const grid = document.createElement('div');
      grid.className = 'kv';
      grid.innerHTML = `
        <div class="k">ID</div><div class="v">${data.id}</div>
        <div class="k">Size</div><div class="v">${data.sizeMeters.toLocaleString()} m</div>
        <div class="k">Semi-major axis</div><div class="v">${data.semiMajorAu.toFixed(2)} AU</div>
        <div class="k">Eccentricity</div><div class="v">${data.eccentricity.toFixed(2)}</div>
        <div class="k">Inclination</div><div class="v">${data.inclinationDeg.toFixed(1)}°</div>
      `;
      wrap.appendChild(grid);
      const meters = document.createElement('div');
      meters.className = 'meters';
      meters.appendChild(makeMeter('Discovery', data.discoveryPercent, false));
      meters.appendChild(makeMeter('Destruction', data.destructionPercent, true));
      wrap.appendChild(meters);
      return wrap;
    }

    function makeMeter(label: string, percent: number, danger: boolean) {
      const wrap = document.createElement('div');
      wrap.className = 'meter';
      const head = document.createElement('div');
      head.className = 'label';
      head.innerHTML = `<span>${label} %</span><strong>${percent}%</strong>`;
      const bar = document.createElement('div');
      bar.className = 'bar';
      const fill = document.createElement('div');
      fill.className = 'fill' + (danger ? ' danger' : '');
      fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
      bar.appendChild(fill);
      wrap.appendChild(head);
      wrap.appendChild(bar);
      return wrap;
    }

    function makeOrbitRingMesh(radius: number, thickness = 0.35, color = 0xffffff, opacity = 0.85) {
      const geo = new THREE.TorusGeometry(radius, thickness, 12, 256);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
      const mesh = new THREE.Mesh(geo, mat);
      // Lay flat in XZ plane
      mesh.rotation.x = Math.PI / 2;
      return mesh;
    }

    function makeEllipticalOrbitMesh(aUnits: number, e: number, incDeg: number, color = 0xffffff, opacity = 1.0, thickness = 1.2) {
      const segments = 600;
      const b = aUnits * Math.sqrt(1 - e * e);
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const x = aUnits * Math.cos(t) - aUnits * e;
        const z = b * Math.sin(t);
        points.push(new THREE.Vector3(x, 0, z));
      }
      const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0);
      const geo = new THREE.TubeGeometry(curve, segments, thickness, 8, true);
      geo.rotateX(THREE.MathUtils.degToRad(incDeg));
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
      (mat as any).toneMapped = false;
      return new THREE.Mesh(geo, mat);
    }

    function keplerToPosition(a: Asteroid, elapsedDays: number) {
      const aUnits = a.semiMajorAu * AU_TO_UNITS;
      const e = a.eccentricity;
      const inc = THREE.MathUtils.degToRad(a.inclinationDeg);
      const n = a.meanMotionDegPerDay;
      const M0 = THREE.MathUtils.degToRad(a.meanAnomalyDegAtEpoch);
      const M = M0 + THREE.MathUtils.degToRad(n * elapsedDays);
      let E = M;
      for (let i = 0; i < 5; i++) {
        E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      }
      const cosE = Math.cos(E); // eslint-disable-line @typescript-eslint/no-unused-vars
      const sinE = Math.sin(E);
      const bUnits = aUnits * Math.sqrt(1 - e * e);
      const x = aUnits * (cosE - e);
      const z = bUnits * sinE;
      const pos = new THREE.Vector3(x, 0, z);
      pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), inc);
      return pos;
    }

    function setEmissive(obj: THREE.Mesh, intensity: number) {
      const material = obj.material as THREE.MeshStandardMaterial;
      if (!material.emissive) material.emissive = new THREE.Color(0x000000) as any;
      const base = new THREE.Color(material.color.getHex());
      material.emissive = base.clone().multiplyScalar(intensity) as any;
    }

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove as any);
      renderer.domElement.removeEventListener('click', onClick as any);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}


