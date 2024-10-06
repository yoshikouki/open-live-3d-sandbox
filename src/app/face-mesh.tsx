"use client";

import {
  DrawingUtils,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { useRef } from "react";

import { useMediaPipeVision } from "../hooks/use-media-pipe-vision";

export const FaceMesh = () => {
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const { videoRef, detect } = useMediaPipeVision({
    onFrame: (video) => {
      if (!video || !canvasCtxRef.current) return;
      let results: PoseLandmarkerResult | undefined;
      try {
        results = detect();
      } catch (error) {
        console.error("Failed to detect face:", error);
        return;
      }

      const drawingUtils = new DrawingUtils(canvasCtxRef.current);
      const canvas = canvasCtxRef.current.canvas;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (!results) return;
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#C0C0C070", lineWidth: 1 },
        );
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#FF3030" },
        );
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#FF3030" },
        );
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#30FF30" },
        );
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#30FF30" },
        );
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#E0E0E0" },
        );
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#E0E0E0" },
        );
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#FF3030" },
        );
        drawingUtils.drawConnectors(
          landmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#30FF30" },
        );
      }
    },
  });

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
