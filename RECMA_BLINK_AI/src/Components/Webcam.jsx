import { useEffect, useRef } from "react";

export default function Webcam() {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream;

    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia is not supported in this browser.");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Unable to access the webcam:", error);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      width={640}
      height={480}
      style={{ display: "block", borderRadius: 12, background: "#111" }}
    />
  );
}
