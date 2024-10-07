import type {
  NormalizedLandmark,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { VRMHumanBoneName, type VRMPose } from "@pixiv/three-vrm";
import * as THREE from "three";

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
  poseLandmarkerResult: PoseLandmarkerResult,
): VRMPose => {
  const vrmPose: VRMPose = {};

  const transformedLandmarks =
    poseLandmarkerResult.landmarks.map(transformLandmark);

  return vrmPose;
};

const transformLandmark = (landmark: NormalizedLandmark): THREE.Vector3 => {
  return new THREE.Vector3(
    landmark.x, // X軸はそのまま
    -landmark.y, // Y軸を反転
    -landmark.z, // Z軸を反転
  );
};
