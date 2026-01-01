"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";

function FinanceNode({
  position,
  color,
  speed,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * speed;
      meshRef.current.rotation.x += 0.002 * speed;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Core Wireframe */}
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial wireframe color={color} transparent opacity={0.3} />
      </mesh>

      {/* Inner Solid Core */}
      <mesh scale={0.5}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function FloatingParticles({ count = 50, color = "#4488ff" }) {
  const points = useRef<THREE.Points>(null!);

  // Create random positions
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        sizeAttenuation={true}
        transparent
        opacity={0.8}
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <group position={[2, 0, 0]} rotation={[0, -0.5, 0]}>
          {/* Main Finance Gateway Node */}
          <FinanceNode position={[0, 0, 0]} color="#00FFAA" speed={1} />

          {/* Satellite Nodes representing connected chains/finance */}
          <FinanceNode position={[-2.5, 1.5, -1]} color="#3B82F6" speed={1.5} />
          <FinanceNode position={[2.5, -1.5, 1]} color="#F97316" speed={0.8} />

          {/* Connecting Beams (Visual only) */}
          <Line
            points={[
              [0, 0, 0],
              [-2.5, 1.5, -1],
            ]}
            color="#3B82F6"
            lineWidth={1}
            transparent
            opacity={0.2}
          />
          <Line
            points={[
              [0, 0, 0],
              [2.5, -1.5, 1],
            ]}
            color="#F97316"
            lineWidth={1}
            transparent
            opacity={0.2}
          />
        </group>
      </Float>

      <FloatingParticles count={100} color="#ffffff" />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Scene />
      </Canvas>
      {/* Fade overlay to blend with left text content */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
