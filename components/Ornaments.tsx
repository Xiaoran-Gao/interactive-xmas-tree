import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, CONFIG } from '../constants';
import { getRandomSpherePoint, getTreePoint, easeInOutCubic } from '../utils';
import { OrnamentData } from '../types';

interface OrnamentsProps {
  progress: number;
  visible: boolean;
}

const Ornaments: React.FC<OrnamentsProps> = ({ progress, visible }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const ornaments: OrnamentData[] = useMemo(() => {
    const items: OrnamentData[] = [];
    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      const type = 'sphere'; 
      const chaos = getRandomSpherePoint(20); 
      const treePt = getTreePoint(CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS + 0.5, -5);
      
      let color = COLORS.GOLD;
      const r = Math.random();
      if (r > 0.5) color = COLORS.RED_VELVET;
      else if (r > 0.8) color = "#60A5FA"; 

      items.push({
        position: { chaos, target: treePt },
        color,
        type,
        scale: Math.random() * 0.4 + 0.3,
        rotationOffset: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
      });
    }
    return items;
  }, []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    ornaments.forEach((ornament, i) => {
      meshRef.current!.setColorAt(i, new THREE.Color(ornament.color));
    });
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [ornaments]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const t = state.clock.elapsedTime;
    
    // Use EXACTLY the same easing as the shader to prevent disconnect
    const easedProgress = easeInOutCubic(progress);
    
    // Scale factor for visibility
    const currentScale = meshRef.current.scale.x;
    const targetScale = visible ? 1.0 : 0.0;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 4);
    
    // We scale the whole instanced mesh to hide/show efficiently
    meshRef.current.scale.setScalar(newScale);

    if (newScale < 0.01) return; // Skip calculation if invisible

    ornaments.forEach((ornament, i) => {
      const { position, scale } = ornament;
      
      const currentX = THREE.MathUtils.lerp(position.chaos[0], position.target[0], easedProgress);
      const currentY = THREE.MathUtils.lerp(position.chaos[1], position.target[1], easedProgress);
      const currentZ = THREE.MathUtils.lerp(position.chaos[2], position.target[2], easedProgress);

      dummy.position.set(currentX, currentY, currentZ);
      
      // Bobbing animation
      dummy.position.y += Math.sin(t * 2 + i) * 0.1;

      // Pulse
      const pulse = easedProgress > 0.8 ? Math.sin(t * 3 + i) * 0.1 + 1 : 1;
      dummy.scale.setScalar(scale * pulse);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]}
      castShadow
      receiveShadow
    ><sphereGeometry args={[1, 32, 32]} /><meshToonMaterial /></instancedMesh>
  );
};

export default Ornaments;