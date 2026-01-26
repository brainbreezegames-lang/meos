"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LiquidBackgroundProps {
  className?: string;
  /** Color palette for the blobs - uses warm colors by default */
  colors?: string[];
  /** Animation speed multiplier (1 = normal, 0.5 = slow, 2 = fast) */
  speed?: number;
  /** Blur intensity in pixels */
  blur?: number;
  /** Overall opacity of the effect */
  opacity?: number;
  /** Enable interactive mouse tracking blob */
  interactive?: boolean;
}

const DEFAULT_COLORS = [
  "rgba(255, 119, 34, 0.6)",   // Orange (accent)
  "rgba(255, 180, 100, 0.5)", // Warm peach
  "rgba(61, 47, 169, 0.4)",   // Purple (secondary accent)
  "rgba(255, 220, 180, 0.5)", // Cream
  "rgba(255, 140, 60, 0.45)", // Deep orange
];

export function LiquidBackground({
  className = "",
  colors = DEFAULT_COLORS,
  speed = 1,
  blur = 80,
  opacity = 0.7,
  interactive = true,
}: LiquidBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

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

  // Animation variants for each blob
  const blobVariants = [
    {
      // Top-left blob - slow circular drift
      animate: {
        x: ["0%", "30%", "10%", "-20%", "0%"],
        y: ["0%", "20%", "40%", "10%", "0%"],
        scale: [1, 1.2, 0.9, 1.1, 1],
        borderRadius: [
          "60% 40% 30% 70% / 60% 30% 70% 40%",
          "30% 60% 70% 40% / 50% 60% 30% 60%",
          "50% 50% 40% 60% / 40% 50% 60% 50%",
          "40% 60% 50% 50% / 60% 40% 50% 60%",
          "60% 40% 30% 70% / 60% 30% 70% 40%",
        ],
      },
      transition: {
        duration: 25 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    {
      // Top-right blob - diagonal movement
      animate: {
        x: ["0%", "-40%", "-20%", "20%", "0%"],
        y: ["0%", "30%", "50%", "20%", "0%"],
        scale: [1, 0.9, 1.15, 1.05, 1],
        borderRadius: [
          "40% 60% 60% 40% / 70% 30% 70% 30%",
          "60% 40% 30% 70% / 40% 60% 40% 60%",
          "50% 50% 50% 50% / 50% 50% 50% 50%",
          "70% 30% 50% 50% / 30% 70% 50% 50%",
          "40% 60% 60% 40% / 70% 30% 70% 30%",
        ],
      },
      transition: {
        duration: 30 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    {
      // Center blob - pulsing and drifting
      animate: {
        x: ["-10%", "20%", "30%", "-15%", "-10%"],
        y: ["10%", "-20%", "15%", "30%", "10%"],
        scale: [1.1, 0.95, 1.2, 1, 1.1],
        borderRadius: [
          "50% 50% 40% 60% / 40% 60% 40% 60%",
          "40% 60% 50% 50% / 60% 40% 60% 40%",
          "60% 40% 60% 40% / 50% 50% 40% 60%",
          "45% 55% 55% 45% / 55% 45% 55% 45%",
          "50% 50% 40% 60% / 40% 60% 40% 60%",
        ],
      },
      transition: {
        duration: 20 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    {
      // Bottom-left blob - slow rise and fall
      animate: {
        x: ["0%", "25%", "40%", "15%", "0%"],
        y: ["0%", "-25%", "-10%", "15%", "0%"],
        scale: [1, 1.1, 0.95, 1.05, 1],
        borderRadius: [
          "70% 30% 50% 50% / 30% 70% 50% 50%",
          "50% 50% 60% 40% / 50% 50% 40% 60%",
          "30% 70% 40% 60% / 60% 40% 60% 40%",
          "60% 40% 50% 50% / 40% 60% 50% 50%",
          "70% 30% 50% 50% / 30% 70% 50% 50%",
        ],
      },
      transition: {
        duration: 35 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    {
      // Bottom-right blob - figure-8 pattern
      animate: {
        x: ["0%", "-30%", "0%", "30%", "0%"],
        y: ["0%", "-20%", "-30%", "-10%", "0%"],
        scale: [1, 1.05, 1.15, 0.95, 1],
        borderRadius: [
          "45% 55% 45% 55% / 55% 45% 55% 45%",
          "55% 45% 55% 45% / 45% 55% 45% 55%",
          "40% 60% 40% 60% / 60% 40% 60% 40%",
          "60% 40% 60% 40% / 40% 60% 40% 60%",
          "45% 55% 45% 55% / 55% 45% 55% 45%",
        ],
      },
      transition: {
        duration: 28 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  ];

  // Positions for the blobs
  const blobPositions = [
    { top: "5%", left: "10%" },
    { top: "10%", right: "15%" },
    { top: "35%", left: "30%" },
    { bottom: "20%", left: "15%" },
    { bottom: "15%", right: "20%" },
  ];

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{
        opacity,
        zIndex: 0,
      }}
    >
      {/* SVG filter for liquid merge effect */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="liquid-merge">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="liquid"
            />
            <feBlend in="SourceGraphic" in2="liquid" />
          </filter>
        </defs>
      </svg>

      {/* Blur container */}
      <div
        style={{
          position: "absolute",
          inset: `-${blur}px`,
          filter: `blur(${blur}px)`,
        }}
      >
        {/* Static gradient blobs */}
        {colors.map((color, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={blobVariants[i % blobVariants.length].animate}
            transition={blobVariants[i % blobVariants.length].transition}
            style={{
              position: "absolute",
              ...blobPositions[i % blobPositions.length],
              width: "clamp(300px, 40vw, 600px)",
              height: "clamp(300px, 40vw, 600px)",
              background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
              mixBlendMode: i % 2 === 0 ? "normal" : "screen",
              willChange: "transform",
            }}
          />
        ))}

        {/* Interactive mouse-following blob */}
        {interactive && (
          <motion.div
            animate={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 100,
              mass: 2,
            }}
            style={{
              position: "absolute",
              width: "clamp(200px, 25vw, 400px)",
              height: "clamp(200px, 25vw, 400px)",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle at center, ${colors[0]}, transparent 60%)`,
              borderRadius: "50%",
              mixBlendMode: "screen",
              opacity: 0.6,
              willChange: "left, top",
            }}
          />
        )}
      </div>

      {/* Subtle grain overlay for texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default LiquidBackground;
