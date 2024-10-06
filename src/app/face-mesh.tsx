"use client";

import {
  DrawingUtils,
  FaceLandmarker,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef } from "react";

import { useFaceMesh } from "../hooks/use-face-mesh";

export const FaceMesh = () => {
  const { videoRef, detect } = useFaceMesh();
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const renderLoop = useCallback(() => {
    if (!videoRef.current || !canvasCtxRef.current) return;
    let results: FaceLandmarkerResult | undefined;
    try {
      results = detect();
    } catch (error) {
      console.error("Failed to detect face:", error);
      return;
    }

    const drawingUtils = new DrawingUtils(canvasCtxRef.current);
    const video = videoRef.current;
    const canvas = canvasCtxRef.current.canvas;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
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
  }, [detect, videoRef.current]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", renderLoop);
      })
      .catch((error) => {
        console.error("Failed to get user media:", error);
      });
    return () => {
      videoRef.current?.removeEventListener("loadeddata", renderLoop);
      const stream = videoRef.current?.srcObject;
      if (!(stream instanceof MediaStream)) return;
      for (const track of stream.getTracks()) {
        track.stop();
      }
    };
  }, [renderLoop, videoRef.current]);

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
