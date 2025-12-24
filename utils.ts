import * as THREE from 'three';
import { CONFIG } from './constants';

// Cubic Ease In Out - Matches the GLSL shader logic
export const easeInOutCubic = (x: number): number => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

// Helper to get random point in sphere
export const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

// Helper to get random point in cone (Tree shape)
export const getTreePoint = (height: number, maxRadius: number, yOffset: number = -height/2): [number, number, number] => {
  const y = Math.random() * height; // 0 to height
  const progress = y / height; // 0 (bottom) to 1 (top)
  const currentRadius = maxRadius * (1 - progress); // Wide at bottom, narrow at top
  
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * currentRadius; // Uniform distribution on disk
  
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  
  return [x, y + yOffset, z];
};

export const generateFoliageData = () => {
  const count = CONFIG.FOLIAGE_COUNT;
  const chaosPositions = new Float32Array(count * 3);
  const targetPositions = new Float32Array(count * 3);
  const randomScales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Chaos: Sphere radius 15
    const [cx, cy, cz] = getRandomSpherePoint(15);
    chaosPositions[i * 3] = cx;
    chaosPositions[i * 3 + 1] = cy;
    chaosPositions[i * 3 + 2] = cz;

    // Target: Tree
    const [tx, ty, tz] = getTreePoint(CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS, -5);
    targetPositions[i * 3] = tx;
    targetPositions[i * 3 + 1] = ty;
    targetPositions[i * 3 + 2] = tz;

    // Scale: Ensure it's never too small (0.5 to 1.0 range)
    randomScales[i] = 0.5 + Math.random() * 0.5;
  }

  return { chaosPositions, targetPositions, randomScales };
};