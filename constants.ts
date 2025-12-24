import * as THREE from 'three';

export const COLORS = {
  EMERALD_DEEP: "#15803d", // Deep Green (Stronger contrast)
  EMERALD_LIGHT: "#4ade80", // Bright Mint
  GOLD: "#FCD34D", 
  GOLD_LIGHT: "#FEF3C7",
  RED_VELVET: "#ef4444", // Bright Red
  SILVER: "#F1F5F9",
  WOOD: "#A97142" 
};

export const CONFIG = {
  FOLIAGE_COUNT: 1800, // Drastically reduced for a cute, chunky, simple look
  ORNAMENT_COUNT: 50, // Reduced from 120 to 50 for a cleaner look
  GOLD_DUST_COUNT: 500,
  HEART_PARTICLE_COUNT: 400,
  TREE_HEIGHT: 14,
  TREE_RADIUS: 5,
};

// Shader chunks - Simplified for "Flat/Toon" look
export const FOLIAGE_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;
  uniform float uScale; // Global scale for hiding/showing
  
  attribute vec3 aTargetPos;
  attribute float aRandomScale;
  
  varying float vScale;
  varying vec3 vPos;

  float ease(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    vScale = aRandomScale;
    
    float t = ease(uProgress);
    vec3 newPos = mix(position, aTargetPos, t);
    
    // Bouncy breathing
    if (uProgress > 0.9) {
      float bounce = sin(uTime * 3.0 + newPos.y * 0.5) * 0.1;
      newPos.y += bounce;
      newPos.x += bounce * 0.2;
    }

    vPos = newPos;

    // Apply global scale (for hiding tree)
    vec3 finalPos = newPos * uScale;

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Larger points for clearer tree (Compensate for lower count)
    // Increased from 300.0 to 450.0 for "Chunky/Cute" aesthetic
    float pointSize = 450.0 * aRandomScale * uPixelRatio * uScale; 
    pointSize = pointSize * (1.0 / -mvPosition.z);
    
    gl_PointSize = max(pointSize, 0.0);
  }
`;

export const FOLIAGE_FRAGMENT_SHADER = `
  varying float vScale;
  
  void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard; // Perfect circle

    // Flat shading, vivid gradient
    vec3 colorBot = vec3(0.29, 0.87, 0.5); // #4ADE80
    vec3 colorTop = vec3(0.08, 0.5, 0.24); // #15803d
    
    vec3 finalColor = mix(colorBot, colorTop, vScale);
    
    // Solid opacity
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;