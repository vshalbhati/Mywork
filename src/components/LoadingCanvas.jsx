'use client'
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';

function LoadingGeometry() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.005;
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((index) => (
        <mesh 
          key={index} 
          position={[
            Math.sin(index * 2) * 2, 
            Math.cos(index * 2) * 2, 
            0
          ]}
        >
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial 
            color={['#6366f1', '#10b981', '#ec4899'][index]} 
            opacity={0.7} 
            transparent 
          />
        </mesh>
      ))}
    </group>
  );
}

export default function LoadingCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Stars 
        radius={300} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
      />
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <LoadingGeometry />
      </Float>
      <OrbitControls 
        enableZoom={false} 
        autoRotate 
        autoRotateSpeed={0.5} 
      />
    </Canvas>
  );
}