import { useEffect, useRef } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";

function drawFaceLandmarks(ctx, faceLandmarks) {
  if (!faceLandmarks || faceLandmarks.length === 0) {
    return;
  }

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  const xs = faceLandmarks.map((point) => point.x * width);
  const ys = faceLandmarks.map((point) => point.y * height);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;
  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

  faceLandmarks.forEach((point) => {
    const x = point.x * width;
    const y = point.y * height;

    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
  });
}

export default function FaceUnlock() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function setupCameraAndLandmarker() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("This browser does not support webcam access.");
        return;
      }

      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        if (cancelled) {
          return;
        }

        landmarkerRef.current = faceLandmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const renderFrame = () => {
          const video = videoRef.current;
          const canvas = canvasRef.current;

          if (!video || !canvas || video.readyState < 2) {
            animationRef.current = requestAnimationFrame(renderFrame);
            return;
          }

          const context = canvas.getContext("2d");
          if (!context) {
            animationRef.current = requestAnimationFrame(renderFrame);
            return;
          }

          const width = video.videoWidth || 640;
          const height = video.videoHeight || 480;

          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          context.clearRect(0, 0, canvas.width, canvas.height);

          if (landmarkerRef.current) {
            const results = landmarkerRef.current.detectForVideo(video, performance.now());
            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
              drawFaceLandmarks(context, results.faceLandmarks[0]);
            }
          }

          animationRef.current = requestAnimationFrame(renderFrame);
        };

        animationRef.current = requestAnimationFrame(renderFrame);
      } catch (error) {
        console.error("Unable to start face landmark detection:", error);
      }
    }

    setupCameraAndLandmarker();

    return () => {
      cancelled = true;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: 640,
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          display: "block",
          width: "100%",
          borderRadius: 12,
          background: "#111",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          borderRadius: 12,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
