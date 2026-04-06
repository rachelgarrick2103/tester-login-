"use client";

import { useEffect, useRef } from "react";

type DotFieldBackgroundProps = {
  dispersing: boolean;
};

type DotPoint = {
  x: number;
  y: number;
  phase: number;
  jitter: number;
};

const MIN_SPACING = 16;
const MAX_SPACING = 24;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createDotField(width: number, height: number): DotPoint[] {
  const points: DotPoint[] = [];
  const area = width * height;
  const spacing = clamp(Math.sqrt(area / 2400), MIN_SPACING, MAX_SPACING);
  const cols = Math.ceil(width / spacing) + 1;
  const rows = Math.ceil(height / spacing) + 1;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const noise = Math.sin(index * 12.9898) * 43758.5453;
      const random = noise - Math.floor(noise);

      points.push({
        x: col * spacing,
        y: row * spacing,
        phase: random * Math.PI * 2,
        jitter: random,
      });
    }
  }

  return points;
}

export default function DotFieldBackground({ dispersing }: DotFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    let points: DotPoint[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId = 0;
    let start = performance.now();

    const setup = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      points = createDotField(width, height);
    };

    const draw = (now: number) => {
      const t = (now - start) * 0.001;
      const motionBoost = dispersing ? 1.55 : 1;
      const spreadBoost = dispersing ? 1.45 : 1;

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const maxRadius = Math.hypot(cx, cy);

      for (let i = 0; i < points.length; i += 1) {
        const point = points[i];
        const waveA = Math.sin(point.x * 0.0054 + t * 0.25 + point.phase);
        const waveB = Math.cos(point.y * 0.0051 - t * 0.19 + point.phase);
        const waveC = Math.sin((point.x + point.y) * 0.0038 + t * 0.14 + point.phase * 0.7);

        const spread = 1 + (dispersing ? Math.sin(t * 0.9 + point.phase) * 0.55 : 0);
        const offsetX = (waveA * 1.7 + waveB * 1.35 + waveC * 0.8) * motionBoost * spread * spreadBoost;
        const offsetY = (waveB * 1.65 - waveA * 0.9 + waveC * 1.1) * motionBoost * spread * spreadBoost;

        const px = point.x + offsetX;
        const py = point.y + offsetY;

        const dx = px - cx;
        const dy = py - cy;
        const distance = Math.hypot(dx, dy);
        const radial = distance / maxRadius;
        const centerQuiet = 1 - 0.58 * Math.exp(-(distance * distance) / (2 * (maxRadius * 0.24) ** 2));
        const breath = 0.5 + 0.5 * Math.sin(t * 0.7 + point.phase);
        const alpha = (0.11 + radial * 0.32 + breath * 0.08) * centerQuiet;
        const radius = 0.46 + point.jitter * 0.55 + breath * 0.22;

        context.beginPath();
        context.arc(px, py, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(17, 17, 17, ${alpha.toFixed(3)})`;
        context.fill();
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    setup();
    animationFrameId = window.requestAnimationFrame(draw);

    const handleResize = () => {
      setup();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [dispersing]);

  return <canvas ref={canvasRef} className="dot-layer" aria-hidden="true" />;
}
