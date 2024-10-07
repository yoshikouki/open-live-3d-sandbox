"use client";

import { useMediaPipeVision } from "@/hooks/use-media-pipe-vision";
import { poseToVrm } from "@/lib/pose-to-vrm";
import { type VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, type RenderCallback, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import { type GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { PoseLandmarksRenderer } from "./pose-landmarks-renderer";

export const CharacterViewer = () => {
  const { videoRef, poseLandmarks } = useMediaPipeVision();
  const [characterGltf, setCharacterGltf] = useState<GLTF>();

  const onCharacterLoaded = useCallback(
    (character: GLTF) => setCharacterGltf(character),
    [],
  );

  const onFrame: RenderCallback = (state, _delta) => {
    if (!poseLandmarks || !characterGltf) return;
    const vrm: VRM = characterGltf.userData.vrm;
    const pose = poseToVrm(poseLandmarks);
    vrm.humanoid.setRawPose(pose);
  };

  return (
    <>
      <Canvas
        className="h-full w-full"
        camera={{
          fov: 20,
          near: 0.1,
          far: 300,
          position: [0, 1.8, 3],
        }}
      >
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableDamping={true}
          target={new THREE.Vector3(0, 0, 0)}
          minDistance={5}
          maxDistance={10}
          // target={new THREE.Vector3(0, 1.5, 0)}
          // minDistance={1}
          // maxDistance={3}
        />

        {/* <Character
          characterGltf={characterGltf}
          onCharacterLoaded={onCharacterLoaded}
          onFrame={onFrame}
        /> */}
        <PoseLandmarksRenderer poseLandmarks={poseLandmarks} />

        <gridHelper />
      </Canvas>
      <div className="absolute right-1 bottom-1 rounded-lg bg-white/50">
        <div className="relative">
          {/* biome-ignore lint: lint/a11y/useMediaCaption */}
          <video
            id="webcam"
            autoPlay
            playsInline
            ref={videoRef}
            className="h-full w-full rounded-lg hidden"
            style={{ width: "640px", height: "480px" }}
          />
        </div>
      </div>
    </>
  );
};

const Character = ({
  characterGltf,
  onCharacterLoaded,
  onFrame,
}: {
  characterGltf: GLTF | undefined;
  onCharacterLoaded: (gltf: GLTF) => void;
  onFrame: RenderCallback;
}) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(
      "/vrm/sample.vrm",
      (tmpGltf) => {
        VRMUtils.removeUnnecessaryVertices(tmpGltf.scene);
        VRMUtils.removeUnnecessaryJoints(tmpGltf.scene);
        onCharacterLoaded(tmpGltf);
      },
      // called as loading progresses
      (xhr) => {
        setProgress((xhr.loaded / xhr.total) * 100);
      },
      // called when loading has errors
      (error) => {
        console.error("VRM loader Error:", error);
      },
    );
  }, [onCharacterLoaded]);

  useFrame(onFrame);

  return (
    <>
      {characterGltf ? (
        <primitive object={characterGltf.scene} />
      ) : (
        <Html center>{progress} % loaded</Html>
      )}
    </>
  );
};
