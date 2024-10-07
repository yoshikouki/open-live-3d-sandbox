import type { Landmark, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import {
  VRMHumanBoneName,
  type VRMPose,
  type VRMPoseTransform,
} from "@pixiv/three-vrm";

// Coefficient of EMA (0 < alpha <= 1).
// Smaller: smoother movement, but less responsive.
// Larger: more responsive, but noise is more likely to remain.
export const EMA_ALPHA = 0.1;
export const SCALE = 1;
export const ROOT_OFFSET = [0, 0, 0] as const;

export const MediaPipePoseLandmarksIndex = {
  nose: 0,
  leftInnerEye: 1,
  leftEye: 2,
  leftOuterEye: 3,
  rightInnerEye: 4,
  rightEye: 5,
  rightOuterEye: 6,
  leftEar: 7,
  rightEar: 8,
  leftMouth: 9,
  rightMouth: 10,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftPinky: 17,
  rightPinky: 18,
  leftIndex: 19,
  rightIndex: 20,
  leftThumb: 21,
  rightThumb: 22,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFootIndex: 31,
  rightFootIndex: 32,
};

const boneHierarchy: { [key in VRMHumanBoneName]?: VRMHumanBoneName } = {
  [VRMHumanBoneName.Spine]: VRMHumanBoneName.Hips,
  [VRMHumanBoneName.Neck]: VRMHumanBoneName.Spine,
  [VRMHumanBoneName.Head]: VRMHumanBoneName.Neck,
  [VRMHumanBoneName.LeftUpperArm]: VRMHumanBoneName.LeftShoulder,
  [VRMHumanBoneName.LeftLowerArm]: VRMHumanBoneName.LeftUpperArm,
  [VRMHumanBoneName.LeftHand]: VRMHumanBoneName.LeftLowerArm,
  [VRMHumanBoneName.RightUpperArm]: VRMHumanBoneName.RightShoulder,
  [VRMHumanBoneName.RightLowerArm]: VRMHumanBoneName.RightUpperArm,
  [VRMHumanBoneName.RightHand]: VRMHumanBoneName.RightLowerArm,
  [VRMHumanBoneName.LeftUpperLeg]: VRMHumanBoneName.Hips,
  [VRMHumanBoneName.LeftLowerLeg]: VRMHumanBoneName.LeftUpperLeg,
  [VRMHumanBoneName.LeftFoot]: VRMHumanBoneName.LeftLowerLeg,
  [VRMHumanBoneName.RightUpperLeg]: VRMHumanBoneName.Hips,
  [VRMHumanBoneName.RightLowerLeg]: VRMHumanBoneName.RightUpperLeg,
  [VRMHumanBoneName.RightFoot]: VRMHumanBoneName.RightLowerLeg,
};

export const poseToVrm = (
  worldLandmarks: PoseLandmarkerResult["worldLandmarks"],
): VRMPose => {
  const vrmPose: VRMPose = {};

  for (const pose of worldLandmarks) {
    if (!pose[0]) break;
    // Hips
    const leftHip = pose[MediaPipePoseLandmarksIndex.leftHip];
    const rightHip = pose[MediaPipePoseLandmarksIndex.rightHip];
    const hipsPosition = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
      z: (leftHip.z + rightHip.z) / 2,
      visibility: leftHip.visibility,
    };
    vrmPose[VRMHumanBoneName.Hips] = transformLandmarkToVRMPose(hipsPosition);

    // Neck
    const nose = pose[MediaPipePoseLandmarksIndex.nose];
    const neckPosition = {
      x: nose.x,
      y: nose.y,
      z: nose.z,
      visibility: nose.visibility,
    };
    vrmPose[VRMHumanBoneName.Neck] = transformLandmarkToVRMPose(neckPosition);

    // Head
    vrmPose[VRMHumanBoneName.Head] = transformLandmarkToVRMPose(nose);

    // Left Upper Arm
    vrmPose[VRMHumanBoneName.LeftUpperArm] = transformLandmarkToVRMPose(
      pose[MediaPipePoseLandmarksIndex.leftShoulder],
    );

    // Left Lower Arm
    vrmPose[VRMHumanBoneName.LeftLowerArm] = transformLandmarkToVRMPose(
      pose[MediaPipePoseLandmarksIndex.leftElbow],
    );

    // Left Hand
    vrmPose[VRMHumanBoneName.LeftHand] = transformLandmarkToVRMPose(
      pose[MediaPipePoseLandmarksIndex.leftWrist],
    );

    // Right Upper Arm
    vrmPose[VRMHumanBoneName.RightUpperArm] = transformLandmarkToVRMPose(
      pose[MediaPipePoseLandmarksIndex.rightShoulder],
    );

    // Right Lower Arm
    vrmPose[VRMHumanBoneName.RightLowerArm] = transformLandmarkToVRMPose(
      pose[MediaPipePoseLandmarksIndex.rightElbow],
    );

    // Right Hand
    vrmPose[VRMHumanBoneName.RightHand] = transformLandmarkToVRMPose(
      pose[MediaPipePoseLandmarksIndex.rightWrist],
    );
  }

  return vrmPose;
};

export const convertMediaPipeToThreeJS = (x: number, y: number, z: number) => {
  return [
    x * SCALE + ROOT_OFFSET[0],
    -y * SCALE + ROOT_OFFSET[1],
    z * SCALE + ROOT_OFFSET[2],
  ];
};

const transformLandmarkToVRMPose = (landmark: Landmark): VRMPoseTransform => {
  if (!landmark) return {};
  const [x, y, z] = convertMediaPipeToThreeJS(
    landmark.x,
    landmark.y,
    landmark.z,
  );
  return { position: [x, y, z] };
};
