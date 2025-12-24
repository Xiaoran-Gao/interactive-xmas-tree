import React, { useMemo, useRef } from 'react';
import { Environment, PerspectiveCamera, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, TiltShift2 } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import TreeContainer from './TreeContainer';
import HeartParticles from './HeartParticles';
import VictoryEffects from './VictoryEffects';
import Snow from './Snow';
import { TreeState, HandData, GestureType } from '../types';

interface SceneProps {
  treeState: TreeState;
  handData: HandData;
}

const Scene: React.FC<SceneProps> = ({ treeState, handData }) => {
  // Move tree down slightly to center its bulk
  const treePosition = useMemo(() => new THREE.Vector3(0, -4, 0), []);
  const centerPosition = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  
  const isVictory = handData.gesture === GestureType.VICTORY;
  const isTreeVisible = handData.gesture !== GestureType.PINCH_HEART && !isVictory;

  const spotLightRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
      if (spotLightRef.current) {
          // Dynamic spotlight intensity based on Victory state
          const targetIntensity = isVictory ? 5 : 0;
          spotLightRef.current.intensity = THREE.MathUtils.lerp(spotLightRef.current.intensity, targetIntensity, 0.1);
          
          // Slight movement
          const t = state.clock.elapsedTime;
          spotLightRef.current.position.x = Math.sin(t) * 5;
      }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 32]} fov={45} />
      
      {/* Enhanced Lighting for Warmth */}
      {/* Dim ambient slightly during victory for drama */}
      <ambientLight intensity={isVictory ? 0.4 : 0.8} color="#ffffff" />
      
      {/* Main warm key light */}
      <directionalLight position={[10, 10, 5]} intensity={2.0} color="#FEF3C7" castShadow />
      
      {/* Cool fill light from left for contrast */}
      <directionalLight position={[-10, 5, -5]} intensity={1.2} color="#E0F2FE" />
      
      {/* Rim light from behind to separate tree from background */}
      <spotLight position={[0, 10, -10]} intensity={2} color="#4ade80" angle={0.5} penumbra={1} />

      {/* Dramatic Victory Spotlight */}
      <spotLight 
        ref={spotLightRef}
        position={[0, 5, 10]} 
        angle={0.6} 
        penumbra={0.5} 
        distance={40}
        color="#FCD34D"
        target-position={[0, 0, 0]}
      />

      <Environment preset="park" background={false} blur={1} />
      
      {/* Atmospheric Particles */}
      <Sparkles count={300} scale={35} size={6} speed={0.4} opacity={0.4} color="#FFF" />
      <Snow />
      
      <TreeContainer treeState={treeState} targetPosition={treePosition} visible={isTreeVisible} handData={handData} />
      <HeartParticles visible={handData.gesture === GestureType.PINCH_HEART} position={centerPosition} />
      
      {/* Victory Effects - No Text */}
      <VictoryEffects visible={isVictory} />
      
      <EffectComposer disableNormalPass>
        {/* Stronger bloom for magical feel */}
        <Bloom luminanceThreshold={0.65} intensity={0.8} mipmapBlur radius={0.6} />
        {/* Reduced TiltShift blur for better clarity while keeping miniature feel */}
        <TiltShift2 blur={0.08} /> 
      </EffectComposer>
    </>
  );
};

export default Scene;