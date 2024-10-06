import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";

const initializeFaceLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );
  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    numFaces: 1,
    runningMode: "VIDEO",
  });
  return landmarker;
};

export const useFaceMesh = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMountedRef = useRef(false);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null,
  );

  const detect = useCallback(() => {
    if (!videoRef.current || !faceLandmarker) return;

    const video = videoRef.current;
    const results = faceLandmarker.detectForVideo(video, performance.now());
    return results;
  }, [faceLandmarker]);

  useEffect(() => {
    if (isMountedRef.current) {
      return () => faceLandmarker?.close();
    }

    isMountedRef.current = true;
    initializeFaceLandmarker().then((landmarker) => {
      setFaceLandmarker(landmarker);
    });
    return () => faceLandmarker?.close();
  }, [faceLandmarker]);

  return { videoRef, detect };
};
