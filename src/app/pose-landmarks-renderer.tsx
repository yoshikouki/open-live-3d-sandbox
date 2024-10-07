import { MediaPipePoseLandmarksIndex } from "@/lib/pose-to-vrm";
import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { Text } from "@react-three/drei";
import type React from "react";

interface PoseLandmarksRendererProps {
  poseLandmarks: PoseLandmarkerResult | null;
}
const SCALE = 2;
const OFFSET = [0, 0, 0] as const;

const convertMediaPipeToThreeJS = (x: number, y: number, z: number) => {
  return [x * SCALE + OFFSET[0], -y * SCALE + OFFSET[1], z * SCALE + OFFSET[2]];
};

export const PoseLandmarksRenderer: React.FC<PoseLandmarksRendererProps> = ({
  poseLandmarks,
}) => {
  if (!poseLandmarks || !poseLandmarks.worldLandmarks) return null;
  return (
    <>
      {poseLandmarks.worldLandmarks.map((pose, poseIndex) =>
        pose.map((landmark, landmarkIndex) => {
          if (landmarkIndex > MediaPipePoseLandmarksIndex.rightHip) return null;
          const [x, y, z] = convertMediaPipeToThreeJS(
            landmark.x,
            landmark.y,
            landmark.z,
          );
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <group key={`pose-${poseIndex}-landmark-${landmarkIndex}`}>
              <mesh position={[x, y, z]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshBasicMaterial color="red" />
              </mesh>

              {/* Show landmark index */}
              <Text
                position={[x, y + 0.01, z + 0.03]}
                fontSize={0.04}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {landmarkIndex}
              </Text>
            </group>
          );
        }),
      )}
    </>
  );
};
