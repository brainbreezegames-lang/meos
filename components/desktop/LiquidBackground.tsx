"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

// Seeded random for consistent positions
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export function LiquidBackground({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate many small flame shapes with variety
  const flames = useMemo(() => {
    const colors = [
      // Deep reds
      "#8B1A1A", "#A82020", "#B82828", "#9E1818",
      // Bright reds/oranges
      "#D84818", "#E85010", "#D04020", "#C83818",
      // Oranges
      "#FF6800", "#FF5500", "#E86000", "#F06800",
      // Bright oranges
      "#FF8818", "#FF7010", "#FF8020", "#F87818",
      // Yellow-oranges
      "#FF9020", "#FFAA40", "#FFB050", "#FFA030",
      // Yellows
      "#FFC040", "#FFD060", "#FFCC50", "#FFB848",
    ];

    const shapes: Array<{
      id: number;
      color: string;
      x: number;
      y: number;
      size: number;
      blur: number;
      delay: number;
      duration: number;
      opacity: number;
    }> = [];

    // Create 60 small flame particles
    for (let i = 0; i < 60; i++) {
      const seed = i * 137.5; // Golden angle for distribution
      const rand1 = seededRandom(seed);
      const rand2 = seededRandom(seed + 1);
      const rand3 = seededRandom(seed + 2);
      const rand4 = seededRandom(seed + 3);
      const rand5 = seededRandom(seed + 4);

      // Cluster more shapes toward center but spread across width
      const centerBias = Math.sin(rand1 * Math.PI);
      const x = 5 + rand1 * 90; // Full width coverage

      // Height varies - more shapes at bottom, fewer at top
      const heightBias = Math.pow(rand2, 0.6); // Bias toward bottom
      const y = 55 + heightBias * 45; // 55% to 100% from top (bottom half)

      // Size varies based on height - bigger at bottom, smaller at top
      const sizeBase = 20 + rand3 * 60;
      const sizeMod = 1 - (y - 55) / 45 * 0.5; // Smaller toward top
      const size = sizeBase * sizeMod;

      // Color selection - warmer/yellower toward center and top
      const colorIndex = Math.floor(
        (rand4 * 0.5 + centerBias * 0.3 + (1 - heightBias) * 0.2) * colors.length
      );

      // Opacity fades toward top
      const opacity = 0.4 + rand5 * 0.4 * (1 - (y - 55) / 45 * 0.6);

      shapes.push({
        id: i,
        color: colors[Math.min(colorIndex, colors.length - 1)],
        x,
        y,
        size,
        blur: 15 + rand3 * 35,
        delay: rand4 * 3,
        duration: 6 + rand5 * 8,
        opacity,
      });
    }

    return shapes;
  }, []);

  if (!mounted) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Base glow layer */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60%",
          background: "linear-gradient(to top, rgba(180, 60, 20, 0.3) 0%, rgba(255, 100, 30, 0.15) 40%, transparent 100%)",
          filter: "blur(40px)",
        }}
      />

      {/* Individual flame particles */}
      {flames.map((flame) => (
        <motion.div
          key={flame.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [flame.opacity * 0.7, flame.opacity, flame.opacity * 0.8],
            y: [0, -8 - flame.size * 0.1, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: flame.duration,
            delay: flame.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${flame.x}%`,
            top: `${flame.y}%`,
            width: flame.size,
            height: flame.size * 1.4,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            background: `radial-gradient(ellipse at 50% 70%, ${flame.color} 0%, ${flame.color}88 40%, transparent 70%)`,
            filter: `blur(${flame.blur}px)`,
            transform: "translate(-50%, -50%)",
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Brighter core flames - fewer, more intense */}
      {flames.slice(0, 20).map((flame, i) => (
        <motion.div
          key={`core-${flame.id}`}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            y: [0, -12, 0],
          }}
          transition={{
            duration: flame.duration * 0.8,
            delay: flame.delay + 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${flame.x + (seededRandom(i * 50) - 0.5) * 5}%`,
            top: `${flame.y + 5}%`,
            width: flame.size * 0.5,
            height: flame.size * 0.7,
            borderRadius: "50%",
            background: `radial-gradient(circle, #FFDD80 0%, #FFAA40 30%, transparent 70%)`,
            filter: `blur(${flame.blur * 0.6}px)`,
            transform: "translate(-50%, -50%)",
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Top fade to transparent */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: 0,
          right: 0,
          height: "30%",
          background: "linear-gradient(to bottom, transparent 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle noise texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.7' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.06,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}

export default LiquidBackground;
