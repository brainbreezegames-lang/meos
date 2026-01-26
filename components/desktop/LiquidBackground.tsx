"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LiquidBackgroundProps {
  className?: string;
  speed?: number;
  opacity?: number;
}

export function LiquidBackground({
  className = "",
  speed = 1,
  opacity = 1,
}: LiquidBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Flame columns rising from below screen - bold, solid colors
  const flames = [
    // Far left - deep reds
    { color: "rgb(120, 15, 0)", left: "-8%", width: "28%", height: "65%", delay: 0 },
    { color: "rgb(160, 25, 0)", left: "2%", width: "25%", height: "58%", delay: 0.5 },

    // Left side - rich reds to orange
    { color: "rgb(200, 35, 0)", left: "10%", width: "26%", height: "70%", delay: 0.2 },
    { color: "rgb(230, 55, 0)", left: "18%", width: "24%", height: "62%", delay: 0.8 },

    // Center-left - oranges
    { color: "rgb(255, 75, 0)", left: "26%", width: "28%", height: "78%", delay: 0.3 },
    { color: "rgb(255, 95, 5)", left: "34%", width: "26%", height: "72%", delay: 0.6 },

    // Center - bright oranges and golds
    { color: "rgb(255, 115, 10)", left: "40%", width: "30%", height: "85%", delay: 0.1 },
    { color: "rgb(255, 140, 25)", left: "45%", width: "28%", height: "80%", delay: 0.4 },
    { color: "rgb(255, 165, 45)", left: "42%", width: "26%", height: "88%", delay: 0.7 },

    // Center - golden yellows
    { color: "rgb(255, 190, 65)", left: "44%", width: "24%", height: "82%", delay: 0.2 },
    { color: "rgb(255, 210, 90)", left: "46%", width: "22%", height: "78%", delay: 0.5 },
    { color: "rgb(255, 230, 120)", left: "48%", width: "18%", height: "85%", delay: 0.9 },

    // Center-right - yellows back to oranges
    { color: "rgb(255, 200, 70)", left: "52%", width: "26%", height: "75%", delay: 0.3 },
    { color: "rgb(255, 160, 40)", left: "58%", width: "28%", height: "80%", delay: 0.6 },

    // Right side - oranges to reds
    { color: "rgb(255, 120, 15)", left: "65%", width: "26%", height: "72%", delay: 0.4 },
    { color: "rgb(255, 90, 5)", left: "72%", width: "24%", height: "68%", delay: 0.7 },
    { color: "rgb(230, 60, 0)", left: "78%", width: "26%", height: "62%", delay: 0.1 },

    // Far right - deep reds
    { color: "rgb(180, 30, 0)", left: "85%", width: "25%", height: "58%", delay: 0.5 },
    { color: "rgb(140, 20, 0)", left: "92%", width: "22%", height: "55%", delay: 0.8 },
  ];

  // Subtle, slow animation - classy movement
  const flameAnimation = {
    y: ["0%", "-3%", "-1%", "-4%", "-2%", "0%"],
    scaleY: [1, 1.02, 1.01, 1.03, 1.01, 1],
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity }}
    >
      {/* Base flame layer - no blur */}
      <div style={{ position: "absolute", inset: 0 }}>
        {flames.map((flame, i) => (
          <motion.div
            key={`base-${i}`}
            animate={flameAnimation}
            transition={{
              duration: (12 + (i % 5) * 2) / speed,
              delay: flame.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              bottom: "-20%",
              left: flame.left,
              width: flame.width,
              height: flame.height,
              background: `linear-gradient(to top, ${flame.color} 0%, ${flame.color} 60%, transparent 100%)`,
              transformOrigin: "bottom center",
            }}
          />
        ))}
      </div>

      {/* Progressive blur layers - blur increases toward top */}
      {[
        { blur: 8, maskStart: "0%", maskEnd: "25%" },
        { blur: 16, maskStart: "20%", maskEnd: "45%" },
        { blur: 32, maskStart: "40%", maskEnd: "65%" },
        { blur: 48, maskStart: "55%", maskEnd: "80%" },
        { blur: 64, maskStart: "70%", maskEnd: "100%" },
      ].map((layer, layerIndex) => (
        <div
          key={`blur-${layerIndex}`}
          style={{
            position: "absolute",
            inset: 0,
            filter: `blur(${layer.blur}px)`,
            WebkitMaskImage: `linear-gradient(to top, transparent ${layer.maskStart}, black ${layer.maskEnd})`,
            maskImage: `linear-gradient(to top, transparent ${layer.maskStart}, black ${layer.maskEnd})`,
          }}
        >
          {flames.map((flame, i) => (
            <motion.div
              key={`blur-${layerIndex}-flame-${i}`}
              animate={flameAnimation}
              transition={{
                duration: (12 + (i % 5) * 2) / speed,
                delay: flame.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                bottom: "-20%",
                left: flame.left,
                width: flame.width,
                height: flame.height,
                background: `linear-gradient(to top, ${flame.color} 0%, ${flame.color} 60%, transparent 100%)`,
                transformOrigin: "bottom center",
              }}
            />
          ))}
        </div>
      ))}

      {/* Noise texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.15,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      {/* Additional fine grain noise */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          opacity: 0.08,
          mixBlendMode: "soft-light",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default LiquidBackground;
