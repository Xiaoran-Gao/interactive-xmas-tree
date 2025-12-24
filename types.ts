
export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export enum GestureType {
  NONE = 'NONE',
  OPEN_PALM = 'OPEN_PALM',
  CLOSED_FIST = 'CLOSED_FIST',
  PINCH_HEART = 'PINCH_HEART',
  VICTORY = 'VICTORY',
  POINTING_UP = 'POINTING_UP'
}

export interface DualPosition {
  chaos: [number, number, number];
  target: [number, number, number];
}

export interface OrnamentData {
  position: DualPosition;
  color: string;
  scale: number;
  type: 'box' | 'sphere' | 'light';
  rotationOffset: [number, number, number];
}

export interface HandData {
  present: boolean;
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  gesture: GestureType;
}
