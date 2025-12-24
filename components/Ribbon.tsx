import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';
import { easeInOutCubic } from '../utils';

interface RibbonProps {
  progress: number;
  visible: boolean;
}

const Ribbon: React.FC<RibbonProps> = ({ progress, visible }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate spiral geometry data
  const { path } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const height = CONFIG.TREE_HEIGHT;
    // Reduced base radius slightly so it doesn't overhang the bottom branches
    const radiusBase = CONFIG.TREE_RADIUS + 0.5; 
    const turns = 5.5;
    const pointsCount = 100;

    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const angle = t * turns * Math.PI * 2;
      
      // Adjusted Y calculation:
      // Foliage is roughly around y = -5 to y = 9.
      // We want the ribbon to start slightly above the absolute bottom (-4.5) 
      // and go to the top.
      const yStart = -4.5;
      const yEnd = height - 5; // approx top
      const y = THREE.MathUtils.lerp(yStart, yEnd, t);
      
      // Cone shape: Radius decreases as we go up
      const r = radiusBase * (1 - t * 0.95);
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    return { path: new THREE.CatmullRomCurve3(points) };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Visibility logic
    const targetScale = visible && progress > 0.1 ? 1 : 0;
    const currentScale = meshRef.current.scale.x;
    
    // Animate width expansion based on progress (Tree forming = Ribbon appears)
    const easedProgress = easeInOutCubic(progress);
    const finalScale = THREE.MathUtils.lerp(currentScale, targetScale * easedProgress, delta * 3);

    meshRef.current.scale.setScalar(finalScale);
    
    // Rotate slightly faster than tree for dynamic feel
    if (visible && progress > 0.8) {
        meshRef.current.rotation.y -= delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0,0,0]} position={[0, 0, 0]}>
      <tubeGeometry args={[path, 128, 0.4, 8, false]} />
      {/* 
        Updated material:
        - Significantly reduced emissiveIntensity from 0.4 to 0.15 to prevent blowout.
        - Kept transparency for softness.
      */}
      <meshToonMaterial 
        color={COLORS.GOLD} 
        emissive="#B45309" // Darker orange/gold emissive color instead of pure gold
        emissiveIntensity={0.15} // Much lower to avoid "neon" look
        side={THREE.DoubleSide}
        transparent={true}
        opacity={0.7}
        depthWrite={true}
      />
    </mesh>
  );
};

export default Ribbon;