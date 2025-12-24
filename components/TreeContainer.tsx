import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GestureType, HandData, TreeState } from '../types';
import { COLORS } from '../constants';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Ribbon from './Ribbon';

interface TreeContainerProps {
  treeState: TreeState;
  targetPosition: THREE.Vector3;
  visible: boolean;
  handData: HandData;
}

const TreeContainer: React.FC<TreeContainerProps> = ({ treeState, targetPosition, visible, handData }) => {
  const groupRef = useRef<THREE.Group>(null);
  const trunkRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);
  const currentRotation = useRef(0);

  useFrame((state, delta) => {
    // 1. Formation Progress
    const targetProgress = treeState === TreeState.FORMED ? 1 : 0;
    if (Math.abs(progress - targetProgress) > 0.001) {
      setProgress(p => THREE.MathUtils.lerp(p, targetProgress, delta * 2));
    }

    // 2. Position & Rotation of the whole group
    if (groupRef.current) {
      groupRef.current.position.lerp(targetPosition, 0.05);
      
      // Interaction Rotation
      if (handData.present && handData.gesture === GestureType.POINTING_UP) {
        const targetRot = (handData.x - 0.5) * Math.PI * 4; 
        currentRotation.current = THREE.MathUtils.lerp(currentRotation.current, targetRot, delta * 5);
      } else {
        // Idle Spin
        if (treeState === TreeState.FORMED) {
            currentRotation.current += 0.005; 
        }
      }
      groupRef.current.rotation.y = currentRotation.current;
    }

    // 3. Trunk & Core Appearance Logic
    // REVISED: Completely removed scaling logic. Now uses Vertical Slide + Fade.
    
    const isExploding = treeState === TreeState.CHAOS;
    const isForming = !isExploding && progress > 0.1;
    
    // Target Presence: 1 = visible, 0 = invisible
    const targetPresence = (visible && isForming) ? 1 : 0;
    
    // Transition speed
    const transitionSpeed = delta * 6;

    if (trunkRef.current) {
        const mat = trunkRef.current.material as THREE.MeshToonMaterial;
        
        // Opacity Animation
        const newOpacity = THREE.MathUtils.lerp(mat.opacity, targetPresence, transitionSpeed);
        mat.opacity = newOpacity;
        
        // Optimization: Disable transparency when fully visible to avoid depth sorting issues
        mat.transparent = newOpacity < 0.99; 
        mat.depthWrite = true; 

        // Vertical Slide Animation (Rise from y = -6 to y = -2)
        // Hidden state: -6 (buried deep). Visible state: -2 (correct height).
        const targetY = THREE.MathUtils.lerp(-6.0, -2.0, targetPresence);
        trunkRef.current.position.y = THREE.MathUtils.lerp(trunkRef.current.position.y, targetY, transitionSpeed);
        
        // Force Scale to 1.0 to prevent any zooming artifacts
        trunkRef.current.scale.setScalar(1.0);
    }
    
    if (coreRef.current) {
        const mat = coreRef.current.material as THREE.MeshToonMaterial;

        // Opacity
        const newOpacity = THREE.MathUtils.lerp(mat.opacity, targetPresence, transitionSpeed);
        mat.opacity = newOpacity;
        mat.transparent = newOpacity < 0.99;
        mat.depthWrite = true;
        
        // Vertical Slide (Rise from y = -4 to y = 1.5)
        const targetY = THREE.MathUtils.lerp(-4.0, 1.5, targetPresence);
        coreRef.current.position.y = THREE.MathUtils.lerp(coreRef.current.position.y, targetY, transitionSpeed);
        
        // Force Scale to 1.0
        coreRef.current.scale.setScalar(1.0);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Inner Core Mesh */}
      <mesh ref={coreRef} position={[0, 1.5, 0]}>
        <coneGeometry args={[2.8, 13, 32]} />
        <meshToonMaterial 
            color={COLORS.EMERALD_DEEP}
            transparent={true}
            opacity={0} // Start invisible
        />
      </mesh>

      {/* Trunk Mesh */}
      <mesh ref={trunkRef} position={[0, -2, 0]}>
        <cylinderGeometry args={[0.8, 1.5, 8, 16]} />
        <meshToonMaterial 
            color={COLORS.WOOD} 
            transparent={true}
            opacity={0} // Start invisible
        />
      </mesh>
      
      <Foliage progress={progress} visible={visible} />
      <Ornaments progress={progress} visible={visible} />
      <Ribbon progress={progress} visible={visible} />
    </group>
  );
};

export default TreeContainer;