"use client";

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
};

// Subtle, performance-friendly particle field that gently follows the cursor.
export default function BackgroundSpecs() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      // Re-initialize particle field proportional to area
      const targetCount = Math.floor((width * height) / 22000); // ~50-150 depending on screen
      const count = Math.max(48, Math.min(160, targetCount));
      particlesRef.current = createParticles(count, width, height);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    resize();

    const step = () => {
      drawFrame(ctx, width, height, particlesRef.current, mouseRef.current);
      animationRef.current = window.requestAnimationFrame(step);
    };
    step();

    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}

function createParticles(count: number, width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const radius = rand(0.5, 1.6);
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: rand(-0.08, 0.08),
      vy: rand(-0.08, 0.08),
      radius,
      baseAlpha: rand(0.25, 0.65),
    });
  }
  return particles;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  particles: Particle[],
  mouse: { x: number; y: number; active: boolean }
) {
  // Soft clear with slight trail for smooth motion
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(2, 3, 10, 0.28)';
  ctx.fillRect(0, 0, width, height);

  // Gentle radial halo around cursor
  if (mouse.active) {
    const halo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
    halo.addColorStop(0, 'rgba(110, 231, 255, 0.06)');
    halo.addColorStop(1, 'rgba(110, 231, 255, 0.0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);
  }

  // Particles
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // Cursor attraction with falloff
    if (mouse.active) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const distSq = dx * dx + dy * dy;
      const maxDist = 260;
      if (distSq < maxDist * maxDist) {
        const dist = Math.sqrt(distSq) || 1;
        const strength = (1 - dist / maxDist) * 0.06; // subtle influence
        p.vx += (dx / dist) * strength;
        p.vy += (dy / dist) * strength;
      }
    }

    // Integrate velocity and apply gentle damping
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.985;
    p.vy *= 0.985;

    // Wrap around edges for continuous flow
    if (p.x < -10) p.x = width + 10; else if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10; else if (p.y > height + 10) p.y = -10;

    // Draw spec (soft glow + core)
    const alpha = p.baseAlpha;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 8);
    // Salt style cool-blue to violet glow
    gradient.addColorStop(0, `rgba(146, 164, 255, ${alpha})`);
    gradient.addColorStop(1, 'rgba(123, 140, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 6, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.9})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}


