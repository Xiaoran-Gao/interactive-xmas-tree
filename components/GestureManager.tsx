import React, { useEffect, useRef } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { GestureType, HandData } from '../types';
import * as THREE from 'three';

interface GestureManagerProps {
  onHandUpdate: (data: HandData) => void;
}

const GestureManager: React.FC<GestureManagerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognizerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(null);
  const lastProcessedRef = useRef<number>(0);

  // Stability Refs
  const lastGestureRef = useRef<GestureType>(GestureType.NONE);
  const gestureFrameCountRef = useRef<number>(0);
  const lastReportedGestureRef = useRef<GestureType>(GestureType.NONE);
  
  // Position Smoothing Refs
  const smoothedPosRef = useRef<{x: number, y: number}>({ x: 0.5, y: 0.5 });

  const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], 
    [0, 5], [5, 6], [6, 7], [7, 8], 
    [5, 9], [9, 10], [10, 11], [11, 12], 
    [9, 13], [13, 14], [14, 15], [15, 16], 
    [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] 
  ];

  useEffect(() => {
    let active = true;

    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        if (!active) return;

        recognizerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1,
            // Reverted to standard thresholds for better responsiveness
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        if (active) startWebcam();
      } catch (e) {
        console.warn("Failed to initialize MediaPipe:", e);
      }
    };

    const startWebcam = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 320, height: 240 } 
        });
        if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.warn("Error accessing webcam.", err);
      }
    };

    initMediaPipe();

    return () => {
      active = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const detectGestureFromLandmarks = (landmarks: any[]): GestureType => {
      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      
      // Joints: [Tip, PIP (Middle Knuckle), MCP (Base Knuckle)]
      // Index: 8, 6, 5
      // Middle: 12, 10, 9
      // Ring: 16, 14, 13
      // Pinky: 20, 18, 17

      // Pinch check
      const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
      if (pinchDist < 0.05) return GestureType.PINCH_HEART;

      // Helper to check if finger is curled
      // We check if the Tip is closer to the Wrist than the PIP (middle joint) is.
      // This is robust for fists regardless of camera angle.
      const isCurled = (tipIdx: number, pipIdx: number) => {
          const tip = landmarks[tipIdx];
          const pip = landmarks[pipIdx];
          
          const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
          const dPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
          
          // Simple logic: If tip is closer to wrist than the middle knuckle, it's curled.
          return dTip < dPip; 
      };

      const indexCurled = isCurled(8, 6);
      const middleCurled = isCurled(12, 10);
      const ringCurled = isCurled(16, 14);
      const pinkyCurled = isCurled(20, 18);

      // Gesture Logic
      // 1. Pointing Up (Index extended, others curled)
      if (!indexCurled && middleCurled && ringCurled && pinkyCurled) {
          return GestureType.POINTING_UP;
      }

      // 2. Closed Fist (All 4 fingers curled)
      // Note: We ignore thumb for fist to make it easier to trigger
      if (indexCurled && middleCurled && ringCurled && pinkyCurled) return GestureType.CLOSED_FIST;
      
      // 3. Victory (Index & Middle extended, others curled)
      if (!indexCurled && !middleCurled && ringCurled && pinkyCurled) return GestureType.VICTORY;
      
      // 4. Open Palm (All extended)
      // We check !isCurled. 
      if (!indexCurled && !middleCurled && !ringCurled && !pinkyCurled) return GestureType.OPEN_PALM;

      return GestureType.NONE;
  };

  const drawLandmarks = (landmarks: any[]) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      // --- Style for Skeleton ---
      ctx.lineWidth = 1.5; 
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; 
      ctx.fillStyle = 'rgba(74, 222, 128, 0.5)'; 

      // Draw Connections
      HAND_CONNECTIONS.forEach(([start, end]) => {
          const p1 = landmarks[start];
          const p2 = landmarks[end];
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
      });

      // Draw Joints
      landmarks.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 2.5, 0, 2 * Math.PI); 
          ctx.fill();
      });

      ctx.restore();
  };

  const predictWebcam = async () => {
    if (!recognizerRef.current || !videoRef.current) return;
    
    const nowInMs = Date.now();
    
    if (nowInMs - lastProcessedRef.current > 30) { 
        lastProcessedRef.current = nowInMs;
        if (videoRef.current.currentTime > 0 && !videoRef.current.paused && !videoRef.current.ended) {
            try {
                const result = recognizerRef.current.detectForVideo(videoRef.current, nowInMs);
                
                if (result.landmarks && result.landmarks.length > 0) {
                    const landmarks = result.landmarks[0];
                    drawLandmarks(landmarks);
                    
                    const rawX = (landmarks[0].x + landmarks[9].x) / 2;
                    const rawY = (landmarks[0].y + landmarks[9].y) / 2;
                    const rawGesture = detectGestureFromLandmarks(landmarks);

                    // Position Smoothing
                    smoothedPosRef.current.x = THREE.MathUtils.lerp(smoothedPosRef.current.x, rawX, 0.3);
                    smoothedPosRef.current.y = THREE.MathUtils.lerp(smoothedPosRef.current.y, rawY, 0.3);

                    // Gesture Debouncing - REDUCED THRESHOLD
                    // Only require 2 consecutive frames for faster response
                    if (rawGesture === lastGestureRef.current) {
                        gestureFrameCountRef.current++;
                    } else {
                        gestureFrameCountRef.current = 1;
                        lastGestureRef.current = rawGesture;
                    }

                    if (gestureFrameCountRef.current > 1) { // Changed from 4 to 1 (>1 means 2 frames)
                        lastReportedGestureRef.current = rawGesture;
                    }

                    onHandUpdate({
                        present: true,
                        x: 1 - smoothedPosRef.current.x, 
                        y: smoothedPosRef.current.y,
                        gesture: lastReportedGestureRef.current
                    });
                } else {
                    const canvas = canvasRef.current;
                    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
                    
                    gestureFrameCountRef.current = 0;
                    onHandUpdate({ present: false, x: 0.5, y: 0.5, gesture: GestureType.NONE });
                }
            } catch (e) {
                console.error("Prediction error", e);
            }
        }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="relative w-32 h-24 md:w-48 md:h-36 rounded-2xl overflow-hidden border-2 border-white/50 shadow-md bg-black/10">
        <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            autoPlay 
            playsInline 
            muted
        ></video>
        <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute bottom-1 left-0 w-full text-center">
             <span className="text-white/80 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-black/20">
                 Camera
             </span>
        </div>
    </div>
  );
};

export default GestureManager;