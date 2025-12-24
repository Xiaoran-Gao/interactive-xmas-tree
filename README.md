# 🎄 Interactive 3D Christmas Tree

An immersive, magical 3D Christmas experience controlled by hand gestures. This project combines high-fidelity 3D rendering with computer vision to create a playful and interactive holiday scene. ***This is a vibe coding project, powered by Gemini 3.0 Pro.***

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech](https://img.shields.io/badge/React-Three_Fiber-blue)
![AI](https://img.shields.io/badge/AI-MediaPipe-orange)

## ✨ Features

*   **Gesture Control**: Uses your webcam and AI (MediaPipe) to track hand movements and control the scene in real-time.
*   **Dynamic 3D Tree**: A stylized, toon-shaded Christmas tree that can explode into chaos and reform seamlessly.
*   **Cinematic Visuals**: Features post-processing effects like Bloom (glow) and Tilt-Shift (miniature effect), along with dynamic lighting and shadows.
*   **Particle Systems**: Includes custom particle effects for snow, gold dust, floating hearts, and fireworks.
*   **Responsive Design**: Built with Tailwind CSS and responsive 3D scaling.

## 🎮 How to Play (Gesture Guide)

Allow camera access when prompted. Stand back slightly so your hand is clearly visible.

| Gesture | Icon | Action | Visual Effect |
| :--- | :---: | :--- | :--- |
| **Open Palm** | 🖐 | **EXPLODE** | The tree disperses into a cloud of floating particles (Chaos Mode). |
| **Closed Fist** | ✊ | **ASSEMBLE** | The tree reforms from chaos. The trunk rises from the ground and leaves gather. |
| **Point Up** | ☝️ | **ROTATE** | Move your finger left/right to rotate the tree interactively. |
| **Pinch** | 👌 | **LOVE** | Summons a stream of floating heart particles towards the center. |
| **Victory** | ✌️ | **WISH** | Triggers a festive celebration! Spotlights intensify, and **Meteor Fireworks** launch into the sky. |

## 🛠 Tech Stack

*   **Core**: [React 18+](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
*   **3D Engine**: [Three.js](https://threejs.org/)
*   **React Renderer**: [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber)
*   **3D Helpers**: [@react-three/drei](https://github.com/pmndrs/drei)
*   **Post Processing**: [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)
*   **Computer Vision**: [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🚀 Getting Started

This project uses a standard React + Vite setup structure (implied).

### Prerequisites

*   Node.js (v16 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Xiaoran-Gao/interactive-xmas-tree.git
    cd interactive-xmas-tree
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

    *Key dependencies to ensure are installed:*
    ```json
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "three": "^0.160.0",
      "@react-three/fiber": "^8.15.14",
      "@react-three/drei": "^9.96.1",
      "@react-three/postprocessing": "^2.16.0",
      "@mediapipe/tasks-vision": "^0.10.8",
      "uuid": "^9.0.1"
    }
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

```text
src/
├── components/
│   ├── Scene.tsx           # Main 3D scene composition and lighting
│   ├── TreeContainer.tsx   # Logic for Tree formation/deformation
│   ├── GestureManager.tsx  # MediaPipe webcam handling and gesture recognition
│   ├── VictoryEffects.tsx  # Fireworks and festive effects logic
│   ├── Foliage.tsx         # Shader-based tree leaves
│   ├── Ornaments.tsx       # Instanced mesh ornaments
│   ├── HeartParticles.tsx  # Logic for 'Pinch' gesture
│   └── ...                 # Other decorative components (Snow, Ribbon, etc.)
├── constants.ts            # Configuration for colors, counts, and shaders
├── types.ts                # TypeScript definitions for Gestures and State
├── utils.ts                # Math helpers and easing functions
├── App.tsx                 # Main application entry and UI overlay
└── index.tsx               # React DOM entry point
```
## 🎨 Customization

You can tweak the visuals in `constants.ts`:

- **Colors**: Change the `COLORS` object to alter the theme (e.g., Blue/Silver instead of Green/Gold).
- **Density**: Adjust `CONFIG.FOLIAGE_COUNT` or `CONFIG.ORNAMENT_COUNT` for performance vs. fidelity.
- **Shaders**: `FOLIAGE_VERTEX_SHADER` controls the leaf movement and scale logic.

## 📄 License

MIT