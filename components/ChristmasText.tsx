import React, { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

interface ChristmasTextProps {
  visible: boolean;
  position: THREE.Vector3;
}

const ChristmasText: React.FC<ChristmasTextProps> = ({ visible, position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const zOffset = 6; 

  useFrame((state) => {
    if (groupRef.current) {
      const targetPos = new THREE.Vector3(position.x, position.y, position.z + zOffset);
      groupRef.current.position.lerp(targetPos, 0.2); // Faster position tracking
      
      const targetScale = visible ? 1 : 0;
      // Much snappier easing for visibility (0.4 vs previous 0.2)
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.4);
      
      // Gentle floating instead of rapid rotation
      const time = state.clock.elapsedTime;
      groupRef.current.position.y += Math.sin(time * 2) * 0.005;
      groupRef.current.rotation.z = Math.sin(time * 1.5) * 0.05; // Subtle tilt
    }
  });

  return (
    <group ref={groupRef} scale={[0,0,0]}>
        {/* MERRY - Clean Sans Serif */}
        <Text
            font="https://fonts.gstatic.com/s/fredoka/v9/X7w4bbQq-MOj1JkR7f4.woff"
            fontSize={1.0}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.2}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            position={[0, 1.8, 0]}
            color={COLORS.GOLD}
            outlineWidth={0.04}
            outlineColor="#B45309"
            text="MERRY"
        />
        
        {/* CHRISTMAS - Cursive/Festive Font */}
        <Text
            font="https://fonts.gstatic.com/s/mountainsofchristmas/v19/dVGBFPwd6G44IWDbQtPewylJhLDHyIrT3gn5.woff"
            fontSize={2.5}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.05}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            position={[0, 0, 0]}
            color={COLORS.RED_VELVET}
            outlineWidth={0.05}
            outlineColor="#7f1d1d" // Dark red outline
            text="Christmas"
        />
    </group>
  );
};

export default ChristmasText;