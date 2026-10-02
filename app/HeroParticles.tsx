"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

import styles from "./portfolio.module.css";

type Dot = {
  x: number;
  y: number;
  phase: number;
  radius: number;
  color: string;
};

type HeroParticlesProps = {
  children: ReactNode;
  className: string;
  labelledBy: string;
};

export default function HeroParticles({ children, className, labelledBy }: HeroParticlesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef<{ x: number; y: number; updatedAt: number } | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const heroSection = section as HTMLElement;
    const particleCanvas = canvas as HTMLCanvasElement;
    const drawingContext = context as CanvasRenderingContext2D;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function resize() {
      const bounds = heroSection.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      particleCanvas.width = Math.round(width * pixelRatio);
      particleCanvas.height = Math.round(height * pixelRatio);
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const spacing = Math.max(25, Math.sqrt((width * height) / 480));
      const dots: Dot[] = [];
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          dots.push({
            x: x + (Math.random() - 0.5) * spacing * 0.5,
            y: y + (Math.random() - 0.5) * spacing * 0.5,
            phase: Math.random() * Math.PI * 2,
            radius: Math.random() * 0.8 + 0.55,
            color: Math.random() > 0.84 ? "#e66a50" : "#263a31",
          });
        }
      }
      dotsRef.current = dots;
    }

    function draw(timestamp: number) {
      drawingContext.clearRect(0, 0, width, height);
      const pointer = pointerRef.current;
      const pointerStrength = pointer && !reducedMotion.matches
        ? Math.max(0, 1 - (timestamp - pointer.updatedAt) / 950)
        : 0;

      for (const dot of dotsRef.current) {
        const driftX = reducedMotion.matches ? 0 : Math.sin(timestamp * 0.00055 + dot.phase) * 0.8;
        const driftY = reducedMotion.matches ? 0 : Math.cos(timestamp * 0.0005 + dot.phase) * 0.8;
        const baseX = dot.x + driftX;
        const baseY = dot.y + driftY;
        const deltaX = pointer ? baseX - pointer.x : 0;
        const deltaY = pointer ? baseY - pointer.y : 0;
        const distance = Math.hypot(deltaX, deltaY);
        const influence = Math.max(0, 1 - distance / 150) * pointerStrength;
        const push = influence * 9;
        const x = baseX + (distance > 0 ? (deltaX / distance) * push : 0);
        const y = baseY + (distance > 0 ? (deltaY / distance) * push : 0);

        drawingContext.globalAlpha = 0.11 + influence * 0.48;
        drawingContext.fillStyle = dot.color;
        drawingContext.beginPath();
        drawingContext.arc(x, y, dot.radius + influence * 1.35, 0, Math.PI * 2);
        drawingContext.fill();
      }

      drawingContext.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(draw);
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(heroSection);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  function trackPointer(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      updatedAt: performance.now(),
    };
  }

  function releasePointer() {
    if (pointerRef.current) pointerRef.current.updatedAt = performance.now() - 450;
  }

  return (
    <section
      ref={sectionRef}
      className={className}
      aria-labelledby={labelledBy}
      onPointerMove={trackPointer}
      onPointerLeave={releasePointer}
    >
      <canvas ref={canvasRef} className={styles.heroParticleCanvas} aria-hidden="true" />
      {children}
    </section>
  );
}