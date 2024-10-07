import {
  FaceLandmarker,
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";

const _initializeFaceLandmarker = async () => {
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
    // Ref: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker#configurations_options
    minPoseDetectionConfidence: 0.9,
    minPosePresenceConfidence: 0.9,
    minTrackingConfidence: 0.9,
  });
  return landmarker;
};

export const useMediaPipeVision = (props?: {
  onFrame: (video: HTMLVideoElement | null) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMountedRef = useRef(false);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(
    null,
  );
  const [poseLandmarkerResult, setPoseLandmarkerResult] =
    useState<PoseLandmarkerResult | null>(null);
  const [_isReady, _setIsReady] = useState(false);

  const detect = useCallback(() => {
    if (!videoRef.current || !poseLandmarker) return;
    const results = poseLandmarker.detectForVideo(
      videoRef.current,
      performance.now(),
    );
    setPoseLandmarkerResult(results);
    return results;
  }, [poseLandmarker]);

  const onFrame = useCallback(() => {
    detect();
    props?.onFrame(videoRef.current);
    requestAnimationFrame(onFrame);
  }, [detect, props?.onFrame]);

  // Initialize pose landmarker
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

  // Initialize webcam
  useEffect(() => {
    if (!videoRef.current) return;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", () => {
          requestAnimationFrame(onFrame);
        });
      })
      .catch((error) => {
        console.error("Failed to get user media:", error);
      });
    return () => {
      const stream = videoRef.current?.srcObject;
      if (!(stream instanceof MediaStream)) return;
      for (const track of stream.getTracks()) {
        track.stop();
      }
    };
  }, [onFrame]);

  return { videoRef, detect, poseLandmarks: poseLandmarkerResult };
};
