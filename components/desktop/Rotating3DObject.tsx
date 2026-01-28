"use client";

import React, { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

// Error boundary for Three.js canvas
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return null; // Silently fail - don't show error in production
    }
    return this.props.children;
  }
}

// Create a rounded bracket/C-shape geometry
function createBracketShape(
  width: number,
  height: number,
  depth: number,
  thickness: number,
  cornerRadius: number
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();

  // Outer path - C shape opening to the right
  const outerW = width;
  const outerH = height;
  const r = cornerRadius;

  // Start at bottom-right of top bar
  shape.moveTo(outerW, r);
  shape.lineTo(outerW, thickness - r);
  shape.quadraticCurveTo(outerW, thickness, outerW - r, thickness);
  shape.lineTo(thickness + r, thickness);
  shape.quadraticCurveTo(thickness, thickness, thickness, thickness + r);

  // Go down the left side
  shape.lineTo(thickness, outerH - thickness - r);
  shape.quadraticCurveTo(thickness, outerH - thickness, thickness + r, outerH - thickness);
  shape.lineTo(outerW - r, outerH - thickness);
  shape.quadraticCurveTo(outerW, outerH - thickness, outerW, outerH - thickness + r);
  shape.lineTo(outerW, outerH - r);
  shape.quadraticCurveTo(outerW, outerH, outerW - r, outerH);

  // Bottom bar
  shape.lineTo(r, outerH);
  shape.quadraticCurveTo(0, outerH, 0, outerH - r);
  shape.lineTo(0, r);
  shape.quadraticCurveTo(0, 0, r, 0);

  // Top bar back to start
  shape.lineTo(outerW - r, 0);
  shape.quadraticCurveTo(outerW, 0, outerW, r);

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: cornerRadius * 0.5,
    bevelSize: cornerRadius * 0.4,
    bevelSegments: 8,
    curveSegments: 16,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

interface BracketMeshProps {
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}

function BracketMesh({ color, position, rotation, scale = 1 }: BracketMeshProps) {
  const geometry = useMemo(() => {
    const geo = createBracketShape(2.5, 3, 0.8, 0.7, 0.25);
    geo.center();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} scale={scale}>
      <meshPhysicalMaterial
        color={color}
        metalness={0.1}
        roughness={0.15}
        transmission={0.3}
        thickness={1.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={1.5}
        ior={1.5}
      />
    </mesh>
  );
}

function RotatingGroup() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Very slow rotation
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.3}
    >
      <group ref={groupRef}>
        {/* Orange bracket (main) */}
        <BracketMesh
          color="#ff7722"
          position={[0.3, 0.4, 0.2]}
          rotation={[0.2, 0.3, 0.1]}
          scale={1}
        />

        {/* Dark charcoal bracket (secondary) */}
        <BracketMesh
          color="#3a4a5a"
          position={[-0.4, -0.3, -0.3]}
          rotation={[-0.4, -0.5, 0.2]}
          scale={0.9}
        />

        {/* Third bracket - lighter gray */}
        <BracketMesh
          color="#6a7a8a"
          position={[0, -0.5, 0.4]}
          rotation={[0.5, 0.2, -0.3]}
          scale={0.75}
        />
      </group>
    </Float>
  );
}

interface Rotating3DObjectProps {
  className?: string;
}

export function Rotating3DObject({ className }: Rotating3DObjectProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={className || "fixed inset-0 overflow-hidden pointer-events-none"}
      style={{
        width: "50%",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1,
      }}
      aria-hidden="true"
    >
      {/* Debug indicator - remove after testing */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: '#ff7722', fontSize: 14, fontWeight: 'bold', zIndex: 9999 }}>
        3D Loading...
      </div>
      <CanvasErrorBoundary>
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#ffaa77" />
            <pointLight position={[0, 5, 5]} intensity={0.5} color="#ffffff" />

            <RotatingGroup />

            <Environment preset="studio" />
          </Canvas>
        </Suspense>
      </CanvasErrorBoundary>
    </div>
  );
}

export default Rotating3DObject;
