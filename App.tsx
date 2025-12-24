import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import GestureManager from './components/GestureManager';
import { TreeState, HandData, GestureType } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  const [handData, setHandData] = useState<HandData>({
    present: false,
    x: 0.5,
    y: 0.5,
    gesture: GestureType.NONE
  });

  const handleHandUpdate = useCallback((data: HandData) => {
    setHandData(data);
    if (data.gesture === GestureType.OPEN_PALM) {
      setTreeState(TreeState.CHAOS);
    } else if (data.gesture === GestureType.CLOSED_FIST) {
      setTreeState(TreeState.FORMED);
    }
  }, []);

  return (
    <div className="w-full h-screen relative bg-[#E0F7FA]">
      
      {/* Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 2, 25], fov: 45 }}
        >
          {/* Removed <color attach="background" /> so the CSS gradient shows through */}
          <Scene treeState={treeState} handData={handData} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 font-cute text-slate-700">
        
        {/* Header */}
        <header className="text-center mt-4 pointer-events-auto">
          <h1 className="text-4xl md:text-5xl text-[#FF6B6B] drop-shadow-sm" style={{ fontWeight: 600 }}>
            Merry Christmas
          </h1>
          <p className="text-[#60A5FA] text-lg mt-1 bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
            Interactive Holiday Tree
          </p>
        </header>

        {/* Status Indicator (Top Right) */}
        <div className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-auto">
           <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 shadow-sm transition-all ${handData.present ? 'border-green-400 bg-green-100' : 'border-slate-200 bg-white/80'}`}>
              <div className={`w-3 h-3 rounded-full ${handData.present ? 'bg-green-500 animate-bounce' : 'bg-slate-300'}`}></div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {handData.present ? 'Camera Active' : 'No Hand Detected'}
              </span>
           </div>
           {handData.present && (
             <div className="bg-[#FCD34D] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse border-2 border-white">
               {handData.gesture.replace('_', ' ')}
             </div>
           )}
        </div>

        {/* Footer / Controls Area */}
        <div className="flex flex-col md:flex-row items-end justify-between w-full pointer-events-auto gap-4">
           
           {/* Camera Feed - Bottom Left */}
           <div className="order-2 md:order-1">
             <GestureManager onHandUpdate={handleHandUpdate} />
           </div>

           {/* Instructions - Bottom Right */}
           <div className="order-1 md:order-2 w-full md:w-auto">
              <div className="flex flex-col gap-2 bg-white/60 p-4 rounded-2xl shadow-lg border-2 border-white backdrop-blur-md min-w-[200px]">
                 <InstructionItem icon="🖐" label="OPEN PALM" action="EXPLODE" />
                 <InstructionItem icon="✊" label="CLOSED FIST" action="ASSEMBLE" />
                 <InstructionItem icon="☝️" label="POINT UP" action="ROTATE" />
                 <InstructionItem icon="👌" label="PINCH" action="LOVE" />
                 <InstructionItem icon="✌️" label="VICTORY" action="WISH" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Helper component with Grid layout for alignment
const InstructionItem: React.FC<{icon: string, label: string, action: string}> = ({ icon, label, action }) => (
    <div className="grid grid-cols-[100px_24px_auto] items-center text-sm">
        <div className="flex items-center gap-2">
            <span className="w-6 text-center text-lg">{icon}</span>
            <span className="font-bold text-slate-600 whitespace-nowrap">{label}</span>
        </div>
        <div className="text-center text-slate-400">→</div>
        <div className="text-[#FF6B6B] font-bold tracking-wide text-right">{action}</div>
    </div>
);

export default App;