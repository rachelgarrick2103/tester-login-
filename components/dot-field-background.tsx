"use client";

import { useEffect, useRef } from "react";

type DotFieldBackgroundProps = {
  dispersing: boolean;
};

type RingDef = {
  radius: number;
  dotCount: number;
  size: number;
  opacity: number;
  phase: number;
  twistAmplitude: number;
  pulseAmplitude: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildRingGrid(width: number, height: number) {
  const shortest = Math.min(width, height);
  const outerRadius = shortest * 0.345;
  const innerRadius = outerRadius * 0.43;
  const thickness = outerRadius - innerRadius;
  const ringCount = Math.max(12, Math.floor(thickness / 10));
  const rings: RingDef[] = [];

  for (let i = 0; i < ringCount; i += 1) {
    const t = ringCount <= 1 ? 0 : i / (ringCount - 1);
    const radius = innerRadius + thickness * t;
    const circumference = 2 * Math.PI * radius;
    const spacing = 16;
    const dotCount = Math.max(18, Math.round(circumference / spacing));

    // Larger, bolder dots weighted toward middle/outer bands.
    const profile = Math.exp(-((t - 0.62) ** 2) / (2 * 0.24 ** 2));
    const size = 2.7 + profile * 4.6;
    const opacity = clamp(0.72 + profile * 0.22, 0.72, 0.95);

    rings.push({
      radius,
      dotCount,
      size,
      opacity,
      phase: i * 0.42,
      twistAmplitude: 0.012 + profile * 0.01,
      pulseAmplitude: 0.008 + profile * 0.012,
    });
  }

  return { rings, outerRadius };
}

export default function DotFieldBackground({ dispersing }: DotFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    let rings: RingDef[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId = 0;
    const start = performance.now();
    let outerRadius = 0;
    let leaveProgress = 0;

    const setup = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const grid = buildRingGrid(width, height);
      rings = grid.rings;
      outerRadius = grid.outerRadius;
    };

    const draw = (now: number) => {
      const t = (now - start) * 0.001;
      leaveProgress = dispersing ? clamp(leaveProgress + 0.014, 0, 1) : clamp(leaveProgress - 0.02, 0, 1);

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const globalBreath = 1 + Math.sin(t * 0.55) * 0.018;
      const leaveExpand = 1 + leaveProgress * 0.22;
      const leaveFade = 1 - leaveProgress * 0.76;

      for (let ri = 0; ri < rings.length; ri += 1) {
        const ring = rings[ri];
        const ringRadius =
          ring.radius * globalBreath * leaveExpand * (1 + Math.sin(t * 0.43 + ring.phase) * ring.pulseAmplitude);
        const ringTwist = Math.sin(t * 0.36 + ring.phase) * ring.twistAmplitude;

        for (let di = 0; di < ring.dotCount; di += 1) {
          const p = di / ring.dotCount;
          const theta = p * Math.PI * 2 + ringTwist;
          const x = cx + Math.cos(theta) * ringRadius;
          const y = cy + Math.sin(theta) * ringRadius;

          const micro = 1 + Math.sin(t * 0.72 + p * Math.PI * 2 + ring.phase) * 0.04;
          const dotRadius = ring.size * micro;
          const alpha = ring.opacity * leaveFade;

          context.beginPath();
          context.arc(x, y, dotRadius, 0, Math.PI * 2);
          context.fillStyle = `rgba(15, 15, 15, ${alpha.toFixed(3)})`;
          context.fill();
        }
      }

      // Extremely subtle outer falloff ring to keep the composition intentional.
      context.beginPath();
      context.arc(cx, cy, outerRadius * (1 + leaveProgress * 0.08), 0, Math.PI * 2);
      context.lineWidth = 1;
      context.strokeStyle = `rgba(20, 20, 20, ${(0.04 * leaveFade).toFixed(3)})`;
      context.stroke();

      // Preserve central whitespace so "180°" remains dominant.
      context.beginPath();
      context.arc(cx, cy, outerRadius * 0.37, 0, Math.PI * 2);
      context.fillStyle = "#ffffff";
      context.fill();

      // Re-draw a thin internal ring edge for crisp halftone framing.
      context.beginPath();
      context.arc(cx, cy, outerRadius * 0.375, 0, Math.PI * 2);
      context.lineWidth = 1;
      context.strokeStyle = `rgba(15, 15, 15, ${(0.06 * leaveFade).toFixed(3)})`;
      context.stroke();

      if (leaveProgress > 0) {
        // Add restrained outward fade as an intentional transition.
        context.beginPath();
        context.arc(cx, cy, outerRadius * (1.08 + leaveProgress * 0.2), 0, Math.PI * 2);
        context.lineWidth = 1;
        context.strokeStyle = `rgba(15, 15, 15, ${(0.05 * (1 - leaveProgress)).toFixed(3)})`;
        context.stroke();
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
