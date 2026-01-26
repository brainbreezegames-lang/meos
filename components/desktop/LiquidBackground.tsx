"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LiquidBackgroundProps {
  className?: string;
  /** Color palette for the flames */
  colors?: string[];
  /** Animation speed multiplier (1 = normal, 0.5 = slow, 2 = fast) */
  speed?: number;
  /** Blur intensity in pixels */
  blur?: number;
  /** Overall opacity of the effect */
  opacity?: number;
  /** Enable interactive mouse tracking */
  interactive?: boolean;
}

// Lava flame colors - deep oranges and reds
const DEFAULT_COLORS = [
  "rgba(255, 80, 0, 0.9)",    // Bright orange
  "rgba(255, 120, 30, 0.85)", // Orange
  "rgba(255, 60, 0, 0.8)",    // Red-orange
  "rgba(255, 160, 50, 0.75)", // Light orange
  "rgba(200, 40, 0, 0.7)",    // Deep red
  "rgba(255, 100, 20, 0.8)",  // Fire orange
];

export function LiquidBackground({
  className = "",
  colors = DEFAULT_COLORS,
  speed = 1,
  blur = 60,
  opacity = 1,
  interactive = false,
}: LiquidBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 80 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!interactive || !mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive, mounted]);

  if (!mounted) return null;

  // Flame animations - rising from bottom with wave-like movement
  const flameVariants = [
    {
      // Left flame - slow rise
      animate: {
        y: ["0%", "-15%", "-5%", "-20%", "0%"],
        x: ["-5%", "10%", "-10%", "5%", "-5%"],
        scaleY: [1, 1.15, 0.95, 1.1, 1],
        scaleX: [1, 0.9, 1.1, 0.95, 1],
      },
      transition: {
        duration: 12 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    {
      // Center-left flame
      animate: {
        y: ["0%", "-25%", "-10%", "-30%", "0%"],
        x: ["0%", "15%", "-5%", "10%", "0%"],
        scaleY: [1, 1.2, 1, 1.15, 1],
        scaleX: [1, 0.85, 1.05, 0.9, 1],
      },
      transition: {
        duration: 15 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    {
      // Center flame - tallest
      animate: {
        y: ["0%", "-35%", "-15%", "-40%", "0%"],
        x: ["-3%", "8%", "-8%", "3%", "-3%"],
        scaleY: [1.1, 1.3, 1.05, 1.25, 1.1],
        scaleX: [1, 0.9, 1.1, 0.95, 1],
      },
      transition: {
        duration: 10 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    {
      // Center-right flame
      animate: {
        y: ["0%", "-20%", "-8%", "-28%", "0%"],
        x: ["5%", "-10%", "12%", "-5%", "5%"],
        scaleY: [1, 1.18, 0.98, 1.12, 1],
        scaleX: [1, 1.05, 0.9, 1, 1],
      },
      transition: {
        duration: 14 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    {
      // Right flame
      animate: {
        y: ["0%", "-18%", "-5%", "-22%", "0%"],
        x: ["3%", "-8%", "10%", "-3%", "3%"],
        scaleY: [1, 1.12, 1.02, 1.08, 1],
        scaleX: [1, 0.95, 1.08, 0.92, 1],
      },
      transition: {
        duration: 13 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    {
      // Far right flame
      animate: {
        y: ["0%", "-12%", "-3%", "-16%", "0%"],
        x: ["-2%", "6%", "-6%", "4%", "-2%"],
        scaleY: [1, 1.1, 0.95, 1.05, 1],
        scaleX: [1, 0.92, 1.06, 0.98, 1],
      },
      transition: {
        duration: 16 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  ];

  // Flame positions - all anchored at bottom
  const flamePositions = [
    { bottom: "-10%", left: "5%", width: "35vw", height: "70vh" },
    { bottom: "-15%", left: "20%", width: "40vw", height: "85vh" },
    { bottom: "-20%", left: "35%", width: "45vw", height: "100vh" },
    { bottom: "-15%", left: "50%", width: "40vw", height: "80vh" },
    { bottom: "-10%", left: "65%", width: "35vw", height: "75vh" },
    { bottom: "-8%", left: "80%", width: "30vw", height: "65vh" },
  ];

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{
        opacity,
        zIndex: 0,
      }}
    >
      {/* Dark gradient overlay - black at top, transparent at bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(15, 10, 5, 0.98) 0%, rgba(20, 12, 8, 0.85) 30%, rgba(30, 15, 10, 0.4) 60%, transparent 100%)",
          zIndex: 2,
        }}
      />

      {/* Blur container for flames */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `blur(${blur}px)`,
        }}
      >
        {/* Flame blobs rising from bottom */}
        {colors.map((color, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={flameVariants[i % flameVariants.length].animate}
            transition={flameVariants[i % flameVariants.length].transition}
            style={{
              position: "absolute",
              ...flamePositions[i % flamePositions.length],
              background: `radial-gradient(ellipse 50% 80% at 50% 100%, ${color}, transparent 70%)`,
              transformOrigin: "bottom center",
              willChange: "transform",
            }}
          />
        ))}

        {/* Extra glow layer at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "-10%",
            right: "-10%",
            height: "50%",
            background: "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(255, 100, 20, 0.6), transparent 70%)",
          }}
        />
      </div>

      {/* Interactive mouse flame */}
      {interactive && (
        <motion.div
          animate={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 80,
            mass: 1.5,
          }}
          style={{
            position: "absolute",
            width: "clamp(150px, 20vw, 300px)",
            height: "clamp(200px, 30vh, 400px)",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(ellipse 60% 80% at 50% 80%, ${colors[0]}, transparent 60%)`,
            filter: `blur(${blur * 0.8}px)`,
            opacity: 0.5,
            willChange: "left, top",
            zIndex: 1,
          }}
        />
      )}

      {/* Subtle noise texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
          mixBlendMode: "overlay",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
    </div>
  );
}

export default LiquidBackground;
