"use client";

import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";

export const FaceMesh = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null,
  );
  const _lastVideoTimeRef = useRef(-1);

  // const renderLoop = useCallback(() => {
  //   const canvasCtx = canvasRef.current?.getContext("2d");
  //   if (!videoRef.current || !canvasCtx) return;
  //   let results: FaceLandmarkerResult | undefined;
  //   const video = videoRef.current;
  //   const drawingUtils = new DrawingUtils(canvasCtx);

  //   if (video.currentTime !== lastVideoTimeRef.current) {
  //     lastVideoTimeRef.current = video.currentTime;
  //     try {
  //       // results = faceLandmarker?.detectForVideo(video, performance.now());
  //     } catch (error) {
  //       console.error("顔検出中にエラーが発生しました:", error);
  //       return;
  //     }
  //   }
  //   if (!results) return;
  //   for (const landmarks of results.faceLandmarks) {
  //     drawingUtils.drawConnectors(
  //       landmarks,
  //       FaceLandmarker.FACE_LANDMARKS_TESSELATION,
  //       { color: "#C0C0C070", lineWidth: 1 },
  //     );
  //     drawingUtils.drawConnectors(
  //       landmarks,
  //       FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
  //       { color: "#FF3030" },
  //     );
  //     drawingUtils.drawConnectors(
  //       landmarks,
  //       FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
  //       { color: "#FF3030" },
  //     );
  //     drawingUtils.drawConnectors(
  //       landmarks,
  //       FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
  //       { color: "#30FF30" },
  //     );
  //     drawingUtils.drawConnectors(
  //       landmarks,
  //       FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
  //       { color: "#30FF30" },
  //     );
  //     drawingUtils.drawConnectors(
  //       landmarks,
  //       FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
  //       { color: "#E0E0E0" },
  //     );
  //     drawingUtils.drawConnectors(
  //       landmarks,
  //       FaceLandmarker.FACE_LANDMARKS_LIPS,
  //       { color: "#E0E0E0" },
  //     );
  //     drawingUtils.drawConnectors(
  //       landmarks,
  //       FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
  //       { color: "#FF3030" },
  //     );
  //     drawingUtils.drawConnectors(
  //       landmarks,
  //       FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
  //       { color: "#30FF30" },
  //     );
  //   }
  //   requestAnimationFrame(() => {
  //     renderLoop();
  //   });
  // }, [faceLandmarker]);

  useEffect(() => {
    (async () => {
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
      setFaceLandmarker(landmarker);
    })();
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        // videoRef.current.addEventListener("loadeddata", renderLoop);
        // renderLoop();
      });
    return () => {
      faceLandmarker?.close();
    };
  }, [faceLandmarker]);

  return (
    <div className="relative h-full w-full">
      <video
        id="webcam"
        autoPlay
        playsInline
        ref={videoRef}
        className="h-full w-full"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};
