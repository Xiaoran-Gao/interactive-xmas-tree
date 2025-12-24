import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

const GoldDust: React.FC = () => {
  const count = CONFIG.GOLD_DUST_COUNT;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { pointer, viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Physics state for each particle
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
      ),
      velocity: new THREE.Vector3(0, 0, 0),
      originalPos: new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      ),
      scale: Math.random() * 0.1 + 0.02
    }));
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;

    // Convert normalized pointer (-1 to 1) to world coordinates (roughly)
    // We project it to z=0 or a bit in front
    const target = new THREE.Vector3(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      5 // bias towards camera slightly
    );

    particles.forEach((particle, i) => {
      // 1. Attraction Force to Pointer
      const dist = particle.position.distanceTo(target);
      const direction = new THREE.Vector3().subVectors(target, particle.position).normalize();
      
      // Stronger pull when closer, but cap it so it doesn't explode
      const forceMagnitude = Math.min(15.0 / (dist * dist + 0.1), 0.5); 
      
      // Only apply strong force if user is interacting (pointer not 0,0 usually means active)
      // Or just always apply it for the "magic" feel
      particle.velocity.add(direction.multiplyScalar(forceMagnitude * 0.05));

      // 2. Drift / Brownian motion
      particle.velocity.x += (Math.random() - 0.5) * 0.01;
      particle.velocity.y += (Math.random() - 0.5) * 0.01;
      particle.velocity.z += (Math.random() - 0.5) * 0.01;

      // 3. Friction
      particle.velocity.multiplyScalar(0.96);

      // 4. Update Position
      particle.position.add(particle.velocity);

      // 5. Bounds wrap-around (keep them in the room)
      if (particle.position.y < -15) particle.position.y = 15;
      if (particle.position.y > 15) particle.position.y = -15;

      dummy.position.copy(particle.position);
      dummy.scale.setScalar(particle.scale);
      dummy.rotation.set(Math.random(), Math.random(), Math.random());
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={COLORS.GOLD_LIGHT} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
};

export default GoldDust;
