"use client";

import {
  DrawingUtils,
  FaceLandmarker,
  type FaceLandmarkerResult,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";

export const FaceMesh = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isMountedRef = useRef(true);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null,
  );
  const lastVideoTimeRef = useRef(-1);

  const renderLoop = useCallback(() => {
    if (!videoRef.current || !canvasCtxRef.current) return;
    let results: FaceLandmarkerResult | undefined;
    const drawingUtils = new DrawingUtils(canvasCtxRef.current);
    const video = videoRef.current;
    const canvas = canvasCtxRef.current.canvas;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    lastVideoTimeRef.current = video.currentTime;
    try {
      results = faceLandmarker?.detectForVideo(video, performance.now());
    } catch (error) {
      console.error("顔検出中にエラーが発生しました:", error);
      return;
    }
    if (!results) return;
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" },
      );
    }
    requestAnimationFrame(() => {
      renderLoop();
    });
    return () => {
      faceLandmarker?.close();
    };
  }, [faceLandmarker]);

  useEffect(() => {
    (async () => {
      if (!isMountedRef.current) return;

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

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", renderLoop);
      });
    return () => {
      videoRef.current?.removeEventListener("loadeddata", renderLoop);
    };
  }, [renderLoop]);

  return (
    <div className="absolute right-0 bottom-0">
      <div className="relative">
        {/* biome-ignore lint: lint/a11y/useMediaCaption */}
        <video
          id="webcam"
          autoPlay
          playsInline
          ref={videoRef}
          className="h-full w-full"
          style={{ width: "640px", height: "480px" }}
        />
        <canvas
          ref={(canvas) => {
            if (!canvas) return;
            canvasCtxRef.current = canvas?.getContext("2d");
          }}
          className="absolute top-0 left-0"
        />
      </div>
    </div>
  );
};
