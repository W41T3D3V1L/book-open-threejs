import { SoftShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { getProject } from "@theatre/core";
import { PerspectiveCamera, SheetProvider, editable as e } from "@theatre/r3f";
import extension from "@theatre/r3f/dist/extension";
import studio from "@theatre/studio";
import { useEffect, useRef, useState } from "react";
import { UI } from "./UI";
import projectState from "./assets/MedievalTown.theatre-project-state.json";
import { Experience } from "./components/Experience";

export const isProd = import.meta.env.MODE === "production";

if (!isProd) {
  studio.initialize();
  studio.extend(extension);
}
const project = getProject(
  "MedievalTown",
  isProd
    ? {
        state: projectState,
      }
    : undefined
);
const mainSheet = project.sheet("Main");

const transitions = {
  Home: [0, 5],
  Castle: [6, 12 + 22 / 30],
  Windmill: [13 + 2 / 30, 17 + 23 / 30],
};

function App() {
  const cameraTargetRef = useRef();

  // editable(focusTargetRef.current, "focusTarget");

  const [currentScreen, setCurrentScreen] = useState("Intro");
  const [targetScreen, setTargetScreen] = useState("Home");
  const isSetup = useRef(false);

  useEffect(() => {
    project.ready.then(() => {
      if (currentScreen === targetScreen) {
        return;
      }
      if (isSetup.current && currentScreen === "Intro") {
        // Strict mode in development will trigger the useEffect twice, so we need to check if it's already setup
        return;
      }
      isSetup.current = true;
      const reverse = targetScreen === "Home" && currentScreen !== "Intro";
      const transition = transitions[reverse ? currentScreen : targetScreen];
      if (!transition) {
        return;
      }

      mainSheet.sequence
        .play({
          range: transition,
          direction: reverse ? "reverse" : "normal",
          rate: reverse ? 2 : 1,
        })
        .then(() => {
          setCurrentScreen(targetScreen);
        });
    });
  }, [targetScreen]);
  return (
    <>
      <UI
        currentScreen={currentScreen}
        onScreenChange={setTargetScreen}
        isAnimating={currentScreen !== targetScreen}
      />
      <Canvas
        camera={{ position: [5, 5, 10], fov: 30, near: 1 }}
        gl={{
          preserveDrawingBuffer: true,
        }}
        shadows
      >
        <SoftShadows />
        <SheetProvider sheet={mainSheet}>
          <e.fog theatreKey="Fog" attach="fog" args={["#cc7b32", 3, 5]} />
          <PerspectiveCamera
            position={[5, 5, 10]}
            fov={30}
            near={1}
            makeDefault
            theatreKey="Camera"
            lookAt={cameraTargetRef}
          />
          <e.mesh
            theatreKey="Camera Target"
            visible="editor"
            ref={cameraTargetRef}
          >
            <octahedronBufferGeometry args={[0.1, 0]} />
            <meshPhongMaterial color="yellow" />
          </e.mesh>

          <Experience />
        </SheetProvider>
      </Canvas>
    </>
  );
}

export default App;
