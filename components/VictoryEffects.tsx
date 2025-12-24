import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

interface VictoryEffectsProps {
  visible: boolean;
}

const PALETTE = [COLORS.RED_VELVET, COLORS.GOLD, COLORS.EMERALD_LIGHT, "#60A5FA", "#F472B6"];

// --- Fireworks System ---
const Fireworks: React.FC<{ visible: boolean }> = ({ visible }) => {
  const count = 400;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Particle System State
  // We recycle particles: They wait -> Launch -> Explode -> Reset
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      phase: 'IDLE', // IDLE, LAUNCH, EXPLODE
      timer: Math.random() * 100, // Stagger start times
      pos: new THREE.Vector3(0, -10, 0),
      vel: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(COLORS.GOLD),
      scale: 0,
      baseX: (Math.random() - 0.5) * 10 // Launch position spread
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Global time multiplier for speed
    const dt = delta * 1.5;

    particles.forEach((p, i) => {
      if (!visible) {
        // If not visible, just reset everything quietly
        p.scale = THREE.MathUtils.lerp(p.scale, 0, 0.1);
        if (p.scale < 0.01) {
            p.phase = 'IDLE';
            p.pos.set(0, -10, 0);
        }
      } else {
        // State Machine
        if (p.phase === 'IDLE') {
           p.timer -= dt * 60; // Count down
           if (p.timer <= 0) {
               // Start Launch
               p.phase = 'LAUNCH';
               p.pos.set(p.baseX, -8, 0);
               p.vel.set(0, 0.8 + Math.random() * 0.4, 0); // Upward velocity
               p.scale = 0.3;
               p.color.set(COLORS.GOLD); // Launch trail is gold
           }
        } else if (p.phase === 'LAUNCH') {
            // Move up
            p.pos.add(p.vel);
            p.vel.y *= 0.98; // Drag
            p.scale = THREE.MathUtils.lerp(p.scale, 0.1, 0.1); // Trail gets thinner
            
            // Wobble
            p.pos.x += Math.sin(state.clock.elapsedTime * 10 + i) * 0.02;

            // Explode condition (reach height or slow down)
            if (p.vel.y < 0.1 || p.pos.y > 4 + Math.random() * 4) {
                p.phase = 'EXPLODE';
                // Burst velocity
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const speed = 0.3 + Math.random() * 0.3;
                p.vel.set(
                    Math.sin(phi) * Math.cos(theta) * speed,
                    Math.cos(phi) * speed,
                    Math.sin(phi) * Math.sin(theta) * speed
                );
                p.color.set(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
                p.scale = 0.5; // Explosion puff size
                p.timer = 1.0; // Life of explosion
            }
        } else if (p.phase === 'EXPLODE') {
            // Physics
            p.pos.add(p.vel);
            p.vel.y -= 0.01; // Gravity
            p.vel.multiplyScalar(0.95); // Air resistance
            
            // Shrink over time
            p.scale *= 0.92;
            
            if (p.scale < 0.01) {
                p.phase = 'IDLE';
                p.timer = Math.random() * 50; // Random delay before next launch
                p.baseX = (Math.random() - 0.5) * 15; // Pick new launch spot
            }
        }
      }

      // Render
      dummy.position.copy(p.pos);
      dummy.scale.setScalar(p.scale);
      // Stretch particles based on velocity for "streak" look
      if (p.phase === 'LAUNCH' || p.phase === 'EXPLODE') {
          // Look at direction of travel roughly?
          // Simplification: just stretch Y a bit if moving fast
          const speed = p.vel.length();
          dummy.scale.y = p.scale * (1 + speed * 2);
      }
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, p.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Box geometry looks like sparks/confetti */}
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};

// --- Floating Orbiting Shapes ---
const FloatingShapes: React.FC<{ visible: boolean }> = ({ visible }) => {
    const count = 30;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const items = useMemo(() => {
        return new Array(count).fill(0).map((_, i) => {
            return {
                angle: (i / count) * Math.PI * 2,
                radius: 5 + Math.random() * 6,
                yBase: (Math.random() - 0.5) * 6,
                speed: (Math.random() * 0.4 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
                color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
                scale: Math.random() * 0.4 + 0.2
            };
        });
    }, []);

    useEffect(() => {
        if(meshRef.current) {
            items.forEach((item, i) => {
                meshRef.current!.setColorAt(i, new THREE.Color(item.color));
            });
            meshRef.current.instanceColor!.needsUpdate = true;
        }
    }, [items]);

    useFrame((state) => {
        if(!meshRef.current) return;
        const t = state.clock.elapsedTime;
        
        items.forEach((item, i) => {
            const curAngle = item.angle + t * item.speed;
            // Elliptical orbit
            const x = Math.cos(curAngle) * item.radius;
            const z = Math.sin(curAngle) * item.radius;
            const y = item.yBase + Math.sin(t + i) * 1.5;

            dummy.position.set(x, y, z);
            dummy.rotation.set(t, t * 0.5, 0);
            
            const targetScale = visible ? item.scale : 0;
            const s = THREE.MathUtils.lerp(0, targetScale, 0.1); 
            dummy.scale.setScalar(visible ? s : 0); // Hard cut if not visible to be safe

            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <octahedronGeometry args={[1, 0]} />
            <meshToonMaterial />
        </instancedMesh>
    );
}

const VictoryEffects: React.FC<VictoryEffectsProps> = ({ visible }) => {
    return (
        <group>
            <Fireworks visible={visible} />
            <FloatingShapes visible={visible} />
        </group>
    );
};

export default VictoryEffects;