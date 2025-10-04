import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('scene-container');
const panelBody = document.getElementById('panelBody');
const objectSubtitle = document.getElementById('objectSubtitle');
const timeScaleInput = document.getElementById('timeScale');
const resetViewBtn = document.getElementById('resetView');

let renderer, scene, camera, controls, raycaster, mouse;
let animationClock = new THREE.Clock();
let simulationSeconds = 0;
let asteroidMeshes = [];
let orbitLines = [];

// Mock data for asteroids
const mockAsteroids = [
	{ id: '2025-A', name: 'Impactor-2025', color: 0xff7766, semiMajorAu: 1.1, eccentricity: 0.2, inclinationDeg: 4, meanMotionDegPerDay: 0.9, meanAnomalyDegAtEpoch: 0, discoveryPercent: 72, destructionPercent: 41, sizeMeters: 320 },
	{ id: 'NEO-23', name: 'Aphelion-X', color: 0x7cc4ff, semiMajorAu: 1.6, eccentricity: 0.36, inclinationDeg: 7, meanMotionDegPerDay: 0.6, meanAnomalyDegAtEpoch: 120, discoveryPercent: 45, destructionPercent: 18, sizeMeters: 120 },
	{ id: 'NEO-77', name: 'Juno-Scout', color: 0xffb86b, semiMajorAu: 0.9, eccentricity: 0.1, inclinationDeg: 2, meanMotionDegPerDay: 1.1, meanAnomalyDegAtEpoch: 210, discoveryPercent: 85, destructionPercent: 5, sizeMeters: 60 },
	{ id: 'NEO-91', name: 'Perseid-Drift', color: 0xb58bff, semiMajorAu: 2.2, eccentricity: 0.5, inclinationDeg: 12, meanMotionDegPerDay: 0.4, meanAnomalyDegAtEpoch: 300, discoveryPercent: 31, destructionPercent: 58, sizeMeters: 540 }
];

const AU = 1; // abstract units; we scale Earth orbit radius to 1 AU == 50 units visually
const AU_TO_UNITS = 50; // 1 AU => 50 units

init();
animate();

function init() {
	// Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	container.appendChild(renderer.domElement);

	// Scene & Camera
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x030614, 0.006);
	camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
	camera.position.set(0, 60, 140);

	// Controls
	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.045;
	controls.maxDistance = 400;
	controls.minDistance = 20;

	// Lights
	const sunLight = new THREE.PointLight(0xffffff, 2.2, 0, 2);
	sunLight.position.set(0, 0, 0);
	scene.add(sunLight);
	scene.add(new THREE.AmbientLight(0x335, 0.25));

	// Background starfield
	const starGeo = new THREE.SphereGeometry(2000, 64, 64);
	const starMat = new THREE.MeshBasicMaterial({ color: 0x0a0f24, side: THREE.BackSide });
	const starMesh = new THREE.Mesh(starGeo, starMat);
	scene.add(starMesh);

	// Sun
	const sun = new THREE.Mesh(
		new THREE.SphereGeometry(6, 64, 64),
		new THREE.MeshBasicMaterial({ color: 0xffd27d })
	);
	sun.layers.enable(0);
	scene.add(sun);

	// Sun glow
	const glow = new THREE.PointLight(0xffd27d, 1.4, 0, 2);
	glow.position.set(0, 0, 0);
	scene.add(glow);

	// Earth orbit ring
	const earthOrbit = makeOrbitRing(1 * AU_TO_UNITS, 0x2445a8, 0.6);
	scene.add(earthOrbit);

	// Earth
	const earth = new THREE.Mesh(
		new THREE.SphereGeometry(2.2, 48, 48),
		new THREE.MeshStandardMaterial({ color: 0x6ea8ff, metalness: 0.1, roughness: 0.6 })
	);
	earth.position.set(1 * AU_TO_UNITS, 0, 0);
	earth.name = 'Earth';
	scene.add(earth);

	// Earth glow atmosphere
	const atmo = new THREE.Mesh(
		new THREE.SphereGeometry(2.35, 48, 48),
		new THREE.MeshBasicMaterial({ color: 0x8fd3ff, transparent: true, opacity: 0.15 })
	);
	atmo.position.copy(earth.position);
	scene.add(atmo);

	// Asteroid orbits and meshes
	for (const a of mockAsteroids) {
		const aOrbit = makeEllipticalOrbit(a.semiMajorAu * AU_TO_UNITS, a.eccentricity, a.inclinationDeg, a.color, 0.5);
		scene.add(aOrbit);
		orbitLines.push(aOrbit);

		const radius = Math.max(0.3, Math.min(2.0, a.sizeMeters / 400));
		const asteroid = new THREE.Mesh(
			new THREE.IcosahedronGeometry(radius, 1),
			new THREE.MeshStandardMaterial({ color: a.color, metalness: 0.2, roughness: 0.5 })
		);
		asteroid.userData = { ...a };
		asteroid.position.copy(keplerToPosition(a, 0));
		asteroid.castShadow = false;
		asteroid.receiveShadow = false;
		scene.add(asteroid);
		asteroidMeshes.push(asteroid);
	}

	// Raycaster for picking
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	renderer.domElement.addEventListener('pointermove', onPointerMove);
	renderer.domElement.addEventListener('click', onClick);

	// UI
	timeScaleInput.addEventListener('input', () => {
		animationClock.getDelta(); // de-jitter after change
	});
	resetViewBtn.addEventListener('click', () => {
		camera.position.set(0, 60, 140);
		controls.target.set(0, 0, 0);
		controls.update();
	});

	window.addEventListener('resize', onResize);
}

function makeOrbitRing(radius, color = 0xffffff, opacity = 0.25) {
	const segments = 256;
	const geo = new THREE.BufferGeometry();
	const positions = new Float32Array((segments + 1) * 3);
	for (let i = 0; i <= segments; i++) {
		const t = (i / segments) * Math.PI * 2;
		positions[i * 3 + 0] = Math.cos(t) * radius;
		positions[i * 3 + 1] = 0;
		positions[i * 3 + 2] = Math.sin(t) * radius;
	}
	geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
	return new THREE.Line(geo, mat);
}

function makeEllipticalOrbit(aUnits, e, incDeg, color = 0xffffff, opacity = 0.4) {
	const segments = 400;
	const geo = new THREE.BufferGeometry();
	const positions = new Float32Array((segments + 1) * 3);
	const b = aUnits * Math.sqrt(1 - e * e);
	for (let i = 0; i <= segments; i++) {
		const theta = (i / segments) * Math.PI * 2;
		const x = aUnits * Math.cos(theta) - aUnits * e; // center at focus
		const z = b * Math.sin(theta);
		positions[i * 3 + 0] = x;
		positions[i * 3 + 1] = 0;
		positions[i * 3 + 2] = z;
	}
	geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	geo.rotateX(THREE.MathUtils.degToRad(incDeg));
	const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
	return new THREE.Line(geo, mat);
}

function keplerToPosition(a, elapsedDays) {
	// Simplified: advance mean anomaly linearly and approximate with circular-ellipse param
	const aUnits = a.semiMajorAu * AU_TO_UNITS;
	const e = a.eccentricity;
	const inc = THREE.MathUtils.degToRad(a.inclinationDeg);
	const n = a.meanMotionDegPerDay; // deg/day
	const M0 = THREE.MathUtils.degToRad(a.meanAnomalyDegAtEpoch);
	const M = M0 + THREE.MathUtils.degToRad(n * elapsedDays);

	// Solve Kepler's equation E - e sin E = M (Newton-Raphson)
	let E = M;
	for (let i = 0; i < 5; i++) {
		E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
	}
	const cosE = Math.cos(E);
	const sinE = Math.sin(E);
	const bUnits = aUnits * Math.sqrt(1 - e * e);
	const x = aUnits * (cosE - e);
	const z = bUnits * sinE;

	const pos = new THREE.Vector3(x, 0, z);
	pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), inc); // rotate by inclination
	return pos;
}

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

let hovered = null;
function onPointerMove(event) {
	const rect = renderer.domElement.getBoundingClientRect();
	mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onClick() {
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(asteroidMeshes, false);
	if (intersects.length > 0) {
		selectObject(intersects[0].object);
	}
}

function selectObject(obj) {
	const data = obj.userData;
	objectSubtitle.textContent = `${data.name}`;
	panelBody.innerHTML = '';
	panelBody.appendChild(renderInspector(data));

	// Subtle highlight pulse
	const original = obj.material.color.clone();
	obj.material.emissive = new THREE.Color(original).multiplyScalar(0.2);
	setTimeout(() => {
		obj.material.emissive = new THREE.Color(0x000000);
	}, 250);
}

function renderInspector(data) {
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

function makeMeter(label, percent, danger) {
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

function animate() {
	requestAnimationFrame(animate);
	const dt = animationClock.getDelta();
	const timeScale = parseFloat(timeScaleInput.value || '1');
	simulationSeconds += dt * timeScale * 2.5; // exaggerate time a bit
	const elapsedDays = simulationSeconds * 50; // 1s ~ 50 days, adjustable

	for (let i = 0; i < asteroidMeshes.length; i++) {
		const a = asteroidMeshes[i].userData;
		const pos = keplerToPosition(a, elapsedDays);
		asteroidMeshes[i].position.copy(pos);
		asteroidMeshes[i].rotation.y += 0.01 + (a.sizeMeters % 7) * 0.0005;
	}

	// Hover highlight via raycasting
	raycaster.setFromCamera(mouse, camera);
	const intersections = raycaster.intersectObjects(asteroidMeshes, false);
	if (intersections.length > 0) {
		const obj = intersections[0].object;
		if (hovered && hovered !== obj) setEmissive(hovered, 0);
		hovered = obj;
		setEmissive(obj, 0.25);
	} else if (hovered) {
		setEmissive(hovered, 0);
		hovered = null;
	}

	controls.update();
	renderer.render(scene, camera);
}

function setEmissive(obj, intensity) {
	if (!obj || !obj.material) return;
	if (!obj.material.emissive) obj.material.emissive = new THREE.Color(0x000000);
	const base = new THREE.Color(obj.material.color.getHex());
	obj.material.emissive = base.clone().multiplyScalar(intensity);
}


