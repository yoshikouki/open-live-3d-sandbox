import { FaceLandmarker, FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";

const initializeFaceLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );
  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    numFaces: 1,
    runningMode: "VIDEO",
  });
  return landmarker;
};

const initializePoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );
  const landmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
  });
  return landmarker;
};

export const useMediaPipeVision = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMountedRef = useRef(false);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(
    null,
  );

  const detect = useCallback(() => {
    if (!videoRef.current || !poseLandmarker) return;

    const results = poseLandmarker.detectForVideo(videoRef.current, performance.now());
    return results;
  }, [poseLandmarker]);

  useEffect(() => {
    if (isMountedRef.current) {
      return () => poseLandmarker?.close();
    }

    isMountedRef.current = true;
    initializePoseLandmarker().then((landmarker) => {
      setPoseLandmarker(landmarker);
    });
    return () => poseLandmarker?.close();
  }, [poseLandmarker]);

  return { videoRef, detect };
};
