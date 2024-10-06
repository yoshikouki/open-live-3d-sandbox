"use client";

import {
  type VRM,
  VRMHumanBoneName,
  VRMLoaderPlugin,
  VRMUtils,
} from "@pixiv/three-vrm";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { type GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";

export const CharacterViewer = () => {
  return (
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
        enableDamping={false}
        target={new THREE.Vector3(0, 1.5, 0)}
        minDistance={1}
        maxDistance={3}
      />

      <Character />

      <gridHelper />
    </Canvas>
  );
};

const Character = () => {
  const [gltf, setGltf] = useState<GLTF>();
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (gltf) return;
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      "/vrm/sample.vrm",
      (tmpGltf) => {
        VRMUtils.removeUnnecessaryVertices(tmpGltf.scene);
        VRMUtils.removeUnnecessaryJoints(tmpGltf.scene);

        setGltf(tmpGltf);
        console.log("loaded");
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
  }, [gltf]);

  useFrame((state, _delta) => {
    if (!gltf) return;
    const vrm: VRM = gltf.userData.vrm;
    const _pose = vrm.humanoid.getRawPose();
    const maxRotation = Math.PI / 6; // 最大回転角度を小さくして自然な動きに
    const speed = 0.5; // 回転速度を遅くして自然な動きに
    const time = state.clock.getElapsedTime();
    const headRotation = Math.sin(time * speed) * maxRotation;

    vrm.humanoid.setRawPose({
      // [VRMHumanBoneName.Head]: {
      //   rotation: [0, headRotation * 0.1, 0, 1],
      // },
      [VRMHumanBoneName.Neck]: {
        rotation: [0, headRotation * 0.3, 0, 1],
      },
      // [VRMHumanBoneName.Hips]: {
      //   rotation: [0, headRotation * 0.9, 0, 1],
      // },
    });
  });

  return (
    <>
      {gltf ? (
        <primitive object={gltf.scene} />
      ) : (
        <Html center>{progress} % loaded</Html>
      )}
    </>
  );
};
