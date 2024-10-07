import { MediaPipePoseLandmarksIndex } from "@/lib/pose-to-vrm";
import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { Text } from "@react-three/drei";
import type React from "react";
import { useRef } from "react";

// Coefficient of EMA (0 < alpha <= 1).
// Smaller: smoother movement, but less responsive.
// Larger: more responsive, but noise is more likely to remain.
const EMA_ALPHA = 0.1;
const SCALE = 2;
const OFFSET = [0, 0, 0] as const;

interface PoseLandmarksRendererProps {
  poseLandmarks: PoseLandmarkerResult | null;
}

const convertMediaPipeToThreeJS = (x: number, y: number, z: number) => {
  return [x * SCALE + OFFSET[0], -y * SCALE + OFFSET[1], z * SCALE + OFFSET[2]];
};

export const PoseLandmarksRenderer: React.FC<PoseLandmarksRendererProps> = ({
  poseLandmarks,
}) => {
  const smoothedLandmarksRef = useRef<{
    [key: string]: [number, number, number];
  }>({});

  if (!poseLandmarks || !poseLandmarks.worldLandmarks) return null;

  const smoothedWorldLandmarks = poseLandmarks.worldLandmarks.map(
    (pose, poseIndex) =>
      pose.map((landmark, landmarkIndex) => {
        if (landmarkIndex > MediaPipePoseLandmarksIndex.rightHip) return null;

        const key = `pose-${poseIndex}-landmark-${landmarkIndex}`;
        const previous = smoothedLandmarksRef.current[key];

        if (!previous) {
          // First frame
          smoothedLandmarksRef.current[key] = [
            landmark.x,
            landmark.y,
            landmark.z,
          ];
          return landmark;
        }
        // Apply EMA
        const x = EMA_ALPHA * landmark.x + (1 - EMA_ALPHA) * previous[0];
        const y = EMA_ALPHA * landmark.y + (1 - EMA_ALPHA) * previous[1];
        const z = EMA_ALPHA * landmark.z + (1 - EMA_ALPHA) * previous[2];
        smoothedLandmarksRef.current[key] = [x, y, z];
        return { x, y, z };
      }),
  );

  return (
    <>
      {smoothedWorldLandmarks.map((pose, poseIndex) =>
        pose.map((landmark, landmarkIndex) => {
          if (!landmark) return null;
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
