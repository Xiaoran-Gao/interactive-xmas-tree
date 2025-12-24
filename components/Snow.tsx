import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Snow: React.FC = () => {
  const count = 300;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 40,
      z: (Math.random() - 0.5) * 30,
      speed: Math.random() * 0.05 + 0.02,
      scale: Math.random() * 0.1 + 0.05,
      wobble: Math.random() * Math.PI * 2
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      // Fall down
      p.y -= p.speed;
      
      // Wobble side to side
      p.x += Math.sin(time + p.wobble) * 0.01;
      
      // Reset if below bottom
      if (p.y < -15) {
        p.y = 15;
        p.x = (Math.random() - 0.5) * 40;
        p.z = (Math.random() - 0.5) * 30;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.scale);
      dummy.rotation.set(time + p.wobble, time, time);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} depthWrite={false} />
    </instancedMesh>
  );
};

export default Snow;