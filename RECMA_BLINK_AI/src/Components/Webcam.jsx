import { useEffect, useRef } from "react";

export default function FaceUnlock() {
  const videoRef = useRef(null);

  useEffect(() => {
    startCamera();
  }, []);

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoRef.current.srcObject = stream;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      width={640}
      height={480}
    />
  );
}
