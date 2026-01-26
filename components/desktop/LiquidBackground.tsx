"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LiquidBackgroundProps {
  className?: string;
  /** Animation speed multiplier (1 = normal, 0.5 = slow, 2 = fast) */
  speed?: number;
  /** Blur intensity in pixels */
  blur?: number;
  /** Overall opacity of the effect */
  opacity?: number;
}

export function LiquidBackground({
  className = "",
  speed = 1,
  blur = 40,
  opacity = 1,
}: LiquidBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Rich varied flame configurations - each with unique color, size, position, animation
  const flames = [
    // Deep red base flames
    { color: "rgb(180, 30, 0)", bottom: "-5%", left: "0%", width: "30vw", height: "55vh", duration: 14 },
    { color: "rgb(200, 40, 10)", bottom: "-8%", left: "70%", width: "35vw", height: "60vh", duration: 16 },

    // Bright orange mid flames
    { color: "rgb(255, 80, 0)", bottom: "-10%", left: "10%", width: "35vw", height: "70vh", duration: 11 },
    { color: "rgb(255, 100, 10)", bottom: "-12%", left: "45%", width: "40vw", height: "75vh", duration: 13 },
    { color: "rgb(255, 90, 5)", bottom: "-8%", left: "60%", width: "32vw", height: "65vh", duration: 12 },

    // Intense orange core flames
    { color: "rgb(255, 120, 20)", bottom: "-15%", left: "20%", width: "38vw", height: "80vh", duration: 10 },
    { color: "rgb(255, 130, 30)", bottom: "-18%", left: "35%", width: "42vw", height: "90vh", duration: 9 },
    { color: "rgb(255, 110, 15)", bottom: "-14%", left: "50%", width: "36vw", height: "78vh", duration: 11 },

    // Golden yellow hot spots
    { color: "rgb(255, 160, 40)", bottom: "-20%", left: "25%", width: "30vw", height: "85vh", duration: 8 },
    { color: "rgb(255, 180, 60)", bottom: "-22%", left: "40%", width: "35vw", height: "95vh", duration: 7 },
    { color: "rgb(255, 150, 30)", bottom: "-18%", left: "55%", width: "28vw", height: "82vh", duration: 9 },

    // Bright yellow tips
    { color: "rgb(255, 200, 80)", bottom: "-25%", left: "30%", width: "25vw", height: "100vh", duration: 6 },
    { color: "rgb(255, 210, 100)", bottom: "-28%", left: "45%", width: "28vw", height: "105vh", duration: 5 },
  ];

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity }}
    >
      {/* Blur container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `blur(${blur}px)`,
        }}
      >
        {flames.map((flame, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              y: ["0%", `-${15 + (i % 5) * 8}%`, `-${5 + (i % 3) * 3}%`, `-${20 + (i % 4) * 10}%`, "0%"],
              x: [`${(i % 2 === 0 ? -1 : 1) * 3}%`, `${(i % 2 === 0 ? 1 : -1) * 10}%`, `${(i % 2 === 0 ? -1 : 1) * 8}%`, `${(i % 2 === 0 ? 1 : -1) * 5}%`, `${(i % 2 === 0 ? -1 : 1) * 3}%`],
              scaleY: [1, 1.1 + (i % 3) * 0.1, 0.95, 1.15 + (i % 4) * 0.05, 1],
              scaleX: [1, 0.9 + (i % 2) * 0.05, 1.05, 0.92, 1],
            }}
            transition={{
              duration: flame.duration / speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              bottom: flame.bottom,
              left: flame.left,
              width: flame.width,
              height: flame.height,
              background: `radial-gradient(ellipse 55% 65% at 50% 100%, ${flame.color}, transparent 60%)`,
              transformOrigin: "bottom center",
              willChange: "transform",
            }}
          />
        ))}

        {/* Base glow - deep red */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "-5%",
            right: "-5%",
            height: "45%",
            background: "radial-gradient(ellipse 110% 90% at 50% 100%, rgb(200, 50, 0), transparent 70%)",
          }}
        />

        {/* Mid glow - bright orange */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "10%",
            right: "10%",
            height: "35%",
            background: "radial-gradient(ellipse 100% 80% at 50% 100%, rgb(255, 100, 20), transparent 65%)",
          }}
        />

        {/* Hot center glow - golden */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "20%",
            right: "20%",
            height: "25%",
            background: "radial-gradient(ellipse 90% 70% at 50% 100%, rgb(255, 160, 50), transparent 60%)",
          }}
        />
      </div>
    </div>
  );
}

export default LiquidBackground;
