"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LiquidBackgroundProps {
  className?: string;
  speed?: number;
  blur?: number;
  opacity?: number;
}

export function LiquidBackground({
  className = "",
  speed = 1,
  blur = 35,
  opacity = 1,
}: LiquidBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Rich flame configurations with dramatic animations
  const flames = [
    // Deep crimson base layer
    { color: "rgb(140, 20, 0)", left: "-5%", width: "40vw", height: "50vh", yRange: 25, duration: 8 },
    { color: "rgb(160, 25, 0)", left: "60%", width: "45vw", height: "55vh", yRange: 30, duration: 9 },

    // Rich red flames
    { color: "rgb(200, 40, 0)", left: "5%", width: "35vw", height: "65vh", yRange: 35, duration: 6 },
    { color: "rgb(220, 50, 5)", left: "55%", width: "38vw", height: "70vh", yRange: 40, duration: 7 },

    // Bright orange core
    { color: "rgb(255, 80, 0)", left: "15%", width: "40vw", height: "75vh", yRange: 45, duration: 5 },
    { color: "rgb(255, 100, 10)", left: "40%", width: "45vw", height: "80vh", yRange: 50, duration: 5.5 },
    { color: "rgb(255, 90, 0)", left: "25%", width: "38vw", height: "72vh", yRange: 42, duration: 6 },

    // Intense orange
    { color: "rgb(255, 130, 20)", left: "20%", width: "42vw", height: "85vh", yRange: 55, duration: 4.5 },
    { color: "rgb(255, 140, 30)", left: "35%", width: "48vw", height: "90vh", yRange: 60, duration: 4 },

    // Golden orange hotspots
    { color: "rgb(255, 170, 50)", left: "28%", width: "35vw", height: "88vh", yRange: 50, duration: 3.5 },
    { color: "rgb(255, 180, 60)", left: "45%", width: "40vw", height: "95vh", yRange: 55, duration: 3.8 },

    // Rich yellow flames
    { color: "rgb(255, 200, 80)", left: "32%", width: "32vw", height: "92vh", yRange: 45, duration: 3 },
    { color: "rgb(255, 210, 100)", left: "42%", width: "36vw", height: "100vh", yRange: 50, duration: 3.2 },

    // Bright yellow tips
    { color: "rgb(255, 225, 120)", left: "38%", width: "28vw", height: "98vh", yRange: 40, duration: 2.5 },
    { color: "rgb(255, 235, 140)", left: "48%", width: "25vw", height: "105vh", yRange: 35, duration: 2.8 },

    // White-yellow hottest center
    { color: "rgb(255, 245, 180)", left: "42%", width: "20vw", height: "100vh", yRange: 30, duration: 2 },
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
            animate={{
              y: [
                "0%",
                `-${flame.yRange}%`,
                `-${flame.yRange * 0.4}%`,
                `-${flame.yRange * 1.2}%`,
                `-${flame.yRange * 0.6}%`,
                "0%"
              ],
              x: [
                "0%",
                `${(i % 2 === 0 ? 1 : -1) * 15}%`,
                `${(i % 2 === 0 ? -1 : 1) * 10}%`,
                `${(i % 2 === 0 ? 1 : -1) * 8}%`,
                `${(i % 2 === 0 ? -1 : 1) * 12}%`,
                "0%"
              ],
              scaleY: [1, 1.25, 1.1, 1.35, 1.15, 1],
              scaleX: [1, 0.85, 1.1, 0.9, 1.05, 1],
            }}
            transition={{
              duration: flame.duration / speed,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            }}
            style={{
              position: "absolute",
              bottom: "-15%",
              left: flame.left,
              width: flame.width,
              height: flame.height,
              background: `radial-gradient(ellipse 50% 60% at 50% 100%, ${flame.color}, transparent 55%)`,
              transformOrigin: "bottom center",
              willChange: "transform",
            }}
          />
        ))}

        {/* Base glow layers */}
        <motion.div
          animate={{ opacity: [0.8, 1, 0.85, 1, 0.9, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: 0,
            left: "-10%",
            right: "-10%",
            height: "40%",
            background: "radial-gradient(ellipse 120% 100% at 50% 100%, rgb(180, 40, 0), transparent 70%)",
          }}
        />

        <motion.div
          animate={{ opacity: [0.9, 1, 0.95, 1, 0.85, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: 0,
            left: "5%",
            right: "5%",
            height: "30%",
            background: "radial-gradient(ellipse 100% 90% at 50% 100%, rgb(255, 120, 30), transparent 65%)",
          }}
        />

        <motion.div
          animate={{ opacity: [1, 0.9, 1, 0.95, 1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: 0,
            left: "15%",
            right: "15%",
            height: "22%",
            background: "radial-gradient(ellipse 90% 80% at 50% 100%, rgb(255, 200, 80), transparent 60%)",
          }}
        />

        {/* Brightest yellow center */}
        <motion.div
          animate={{ opacity: [1, 0.85, 1, 0.9, 1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: 0,
            left: "25%",
            right: "25%",
            height: "15%",
            background: "radial-gradient(ellipse 80% 70% at 50% 100%, rgb(255, 240, 150), transparent 55%)",
          }}
        />
      </div>
    </div>
  );
}

export default LiquidBackground;
