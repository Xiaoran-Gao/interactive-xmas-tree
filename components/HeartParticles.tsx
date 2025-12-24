import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../constants';

interface HeartParticlesProps {
  visible: boolean;
  position: THREE.Vector3;
}

const HeartParticles: React.FC<HeartParticlesProps> = ({ visible, position }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = CONFIG.HEART_PARTICLE_COUNT;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const getHeartPoint = (t: number) => {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [x * 0.1, y * 0.1, 0]; 
  };

  const particles = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const t = Math.random() * Math.PI * 2;
      const [hx, hy, hz] = getHeartPoint(t);
      
      return {
        targetX: hx,
        targetY: hy,
        targetZ: hz,
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 5,
        scale: Math.random() * 0.1 + 0.05,
        // Drastically increased speed range for snappy formation
        // Previous was 0.04 - 0.12, now 0.15 - 0.35
        speed: Math.random() * 0.2 + 0.15 
      };
    });
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Scale transition logic
    const zOffset = 5; 
    
    meshRef.current.position.lerp(
        new THREE.Vector3(position.x, position.y, position.z + zOffset), 
        0.2 // Faster positional snap
    );

    particles.forEach((p, i) => {
        if (visible) {
            p.x = THREE.MathUtils.lerp(p.x, p.targetX, p.speed);
            p.y = THREE.MathUtils.lerp(p.y, p.targetY, p.speed);
            p.z = THREE.MathUtils.lerp(p.z, p.targetZ, p.speed);
        } else {
            // Disperse
            p.x += (Math.random() - 0.5) * 0.2;
            p.y += (Math.random() - 0.5) * 0.2;
            p.z += (Math.random() - 0.5) * 0.2;
        }

        dummy.position.set(p.x, p.y, p.z); 
        
        // Immediate scale pop if visible
        const targetScale = visible ? 1 : 0;
        dummy.scale.setScalar(p.scale * targetScale);
        
        if (visible) {
            const beat = Math.pow(Math.sin(state.clock.elapsedTime * 8), 2) * 0.3 + 1; // Faster heartbeat
            dummy.scale.multiplyScalar(beat);
        }

        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshToonMaterial color="#FDA4AF" />
    </instancedMesh>
  );
};

export default HeartParticles;