import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FOLIAGE_FRAGMENT_SHADER, FOLIAGE_VERTEX_SHADER } from '../constants';
import { generateFoliageData } from '../utils';

interface FoliageProps {
  progress: number;
  visible: boolean;
}

const Foliage: React.FC<FoliageProps> = ({ progress, visible }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  const { chaosPositions, targetPositions, randomScales } = useMemo(() => generateFoliageData(), []);

  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // DIRECT ASSIGNMENT: Sync perfectly with TreeContainer progress.
      // Previously, an extra lerp here caused the foliage to lag behind ornaments.
      shaderRef.current.uniforms.uProgress.value = progress;
      
      // Smoothly scale down if not visible
      const targetScale = visible ? 1.0 : 0.0;
      shaderRef.current.uniforms.uScale.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uScale.value,
        targetScale,
        delta * 4
      );
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uScale: { value: 1 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    }),
    []
  );

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={chaosPositions.length / 3}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPos"
          count={targetPositions.length / 3}
          array={targetPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandomScale"
          count={randomScales.length}
          array={randomScales}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={FOLIAGE_VERTEX_SHADER}
        fragmentShader={FOLIAGE_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </points>
  );
};

export default Foliage;