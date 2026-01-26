"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LiquidBackground({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Simple, performant flame columns - only 8 elements
  const flames = [
    { color: "#A82020", left: "0%", width: "25%", height: "45%" },
    { color: "#D84818", left: "12%", width: "28%", height: "55%" },
    { color: "#FF6800", left: "28%", width: "30%", height: "65%" },
    { color: "#FF9020", left: "42%", width: "32%", height: "72%" },
    { color: "#FFAA40", left: "38%", width: "28%", height: "68%" },
    { color: "#FF8818", left: "55%", width: "30%", height: "60%" },
    { color: "#E85010", left: "70%", width: "26%", height: "52%" },
    { color: "#B83018", left: "85%", width: "22%", height: "42%" },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Single blur layer - simple and performant */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: "blur(60px)",
          opacity: 0.7,
        }}
      >
        {flames.map((flame, i) => (
          <motion.div
            key={i}
            animate={{
              y: ["0%", "-2%", "0%"],
              scaleY: [1, 1.02, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              bottom: "-15%",
              left: flame.left,
              width: flame.width,
              height: flame.height,
              background: `linear-gradient(to top, ${flame.color} 0%, ${flame.color} 70%, transparent 100%)`,
              transformOrigin: "bottom center",
              willChange: "transform",
            }}
          />
        ))}
      </div>

      {/* Subtle noise */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.7' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.08,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}

export default LiquidBackground;
