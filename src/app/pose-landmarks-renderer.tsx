import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { Text } from "@react-three/drei";

export const PoseLandmarksRenderer = ({
  worldLandmarks,
}: {
  worldLandmarks: PoseLandmarkerResult["worldLandmarks"] | undefined;
}) => {
  if (!worldLandmarks || !worldLandmarks) return null;

  return (
    <>
      {worldLandmarks.map((pose, poseIndex) =>
        pose.map((landmark, landmarkIndex) => {
          if (!landmark) return null;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <group key={`pose-${poseIndex}-landmark-${landmarkIndex}`}>
              <mesh position={[landmark.x, landmark.y, landmark.z]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshBasicMaterial color="red" />
              </mesh>

              {/* Show landmark index */}
              <Text
                position={[landmark.x, landmark.y + 0.01, landmark.z + 0.03]}
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
