import type { Landmark, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import {
  type VRM,
  VRMHumanBoneName,
  type VRMPose,
  type VRMPoseTransform,
} from "@pixiv/three-vrm";
import * as THREE from "three";

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
  vrm: VRM,
  worldLandmarks: PoseLandmarkerResult["worldLandmarks"],
): VRMPose => {
  const vrmPose: VRMPose = {};

  for (const pose of worldLandmarks) {
    if (!pose[0]) break;
    // Hips
    const leftHip = pose[MediaPipePoseLandmarksIndex.leftHip];
    const rightHip = pose[MediaPipePoseLandmarksIndex.rightHip];
    const hipBone = vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Hips);
    const offset = {
      x: hipBone?.position?.x || 0,
      y: hipBone?.position?.y || 0,
      z: hipBone?.position?.z || 0,
    };
    const hipsPosition = new THREE.Vector3(
      offset.x + (leftHip.x + rightHip.x) / 2,
      offset.y + (leftHip.y + rightHip.y) / 2,
      offset.z + (leftHip.z + rightHip.z) / 2,
    );

    // Spine
    const leftShoulder = pose[MediaPipePoseLandmarksIndex.leftShoulder];
    const rightShoulder = pose[MediaPipePoseLandmarksIndex.rightShoulder];
    const spinePosition = new THREE.Vector3(
      offset.x + (leftShoulder.x + rightShoulder.x) / 2,
      offset.y + (leftShoulder.y + rightShoulder.y) / 2,
      offset.z + (leftShoulder.z + rightShoulder.z) / 2,
    );
    const spineRotation = computeBoneRotation(hipsPosition, spinePosition);
    vrmPose[VRMHumanBoneName.Spine] = {
      rotation: [
        spineRotation.x,
        spineRotation.y,
        spineRotation.z,
        spineRotation.w,
      ],
    };

    // Neck
    const nose = pose[MediaPipePoseLandmarksIndex.nose];
    const neckPosition = new THREE.Vector3(
      offset.x + nose.x,
      offset.y + nose.y,
      offset.z + nose.z,
    );
    const neckRotation = computeBoneRotation(spinePosition, neckPosition);
    vrmPose[VRMHumanBoneName.Neck] = {
      rotation: [
        neckRotation.x,
        neckRotation.y,
        neckRotation.z,
        neckRotation.w,
      ],
    };

    // Head
    const headOffset = neckPosition.clone().add(new THREE.Vector3(0, 0.1, 0)); // 仮のヘッド位置
    const headRotation = computeBoneRotation(neckPosition, headOffset);
    vrmPose[VRMHumanBoneName.Head] = {
      rotation: [
        headRotation.x,
        headRotation.y,
        headRotation.z,
        headRotation.w,
      ],
    };

    // Left Upper Arm
    const leftElbow = pose[MediaPipePoseLandmarksIndex.leftElbow];
    const leftUpperArmRotation = computeBoneRotation(
      new THREE.Vector3(leftShoulder.x, leftShoulder.y, leftShoulder.z),
      new THREE.Vector3(leftElbow.x, leftElbow.y, leftElbow.z),
    );
    vrmPose[VRMHumanBoneName.LeftUpperArm] = {
      rotation: [
        leftUpperArmRotation.x,
        leftUpperArmRotation.y,
        leftUpperArmRotation.z,
        leftUpperArmRotation.w,
      ],
    };

    //   // Left Lower Arm
    //   const leftWrist = pose[MediaPipePoseLandmarksIndex.leftWrist];
    //   const leftLowerArmRotation = computeBoneRotation(
    //     new THREE.Vector3(leftElbow.x, leftElbow.y, leftElbow.z),
    //     new THREE.Vector3(leftWrist.x, leftWrist.y, leftWrist.z),
    //   );
    //   vrmPose[VRMHumanBoneName.LeftLowerArm] = {
    //     rotation: [
    //       leftLowerArmRotation.x,
    //       leftLowerArmRotation.y,
    //       leftLowerArmRotation.z,
    //       leftLowerArmRotation.w,
    //     ],
    //   };

    //   // Right Upper Arm
    //   const rightElbow = pose[MediaPipePoseLandmarksIndex.rightElbow];
    //   const rightUpperArmRotation = computeBoneRotation(
    //     new THREE.Vector3(rightShoulder.x, rightShoulder.y, rightShoulder.z),
    //     new THREE.Vector3(rightElbow.x, rightElbow.y, rightElbow.z),
    //   );
    //   vrmPose[VRMHumanBoneName.RightUpperArm] = {
    //     rotation: [
    //       rightUpperArmRotation.x,
    //       rightUpperArmRotation.y,
    //       rightUpperArmRotation.z,
    //       rightUpperArmRotation.w,
    //     ],
    //   };

    //   // Right Lower Arm
    //   const rightWrist = pose[MediaPipePoseLandmarksIndex.rightWrist];
    //   const rightLowerArmRotation = computeBoneRotation(
    //     new THREE.Vector3(rightElbow.x, rightElbow.y, rightElbow.z),
    //     new THREE.Vector3(rightWrist.x, rightWrist.y, rightWrist.z),
    //   );
    //   vrmPose[VRMHumanBoneName.RightLowerArm] = {
    //     rotation: [
    //       rightLowerArmRotation.x,
    //       rightLowerArmRotation.y,
    //       rightLowerArmRotation.z,
    //       rightLowerArmRotation.w,
    //     ],
    //   };
  }

  return vrmPose;
};

const computeBoneRotation = (
  from: THREE.Vector3,
  to: THREE.Vector3,
): THREE.Quaternion => {
  const boneVector = new THREE.Vector3().subVectors(to, from).normalize();
  const defaultDirection = new THREE.Vector3(0, 1, 0); // ボーンのデフォルト方向（Y軸）
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    defaultDirection,
    boneVector,
  );
  return quaternion;
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
