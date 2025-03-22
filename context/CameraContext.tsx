"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useRef } from "react";

type CameraContextType = {
  videoRef: React.RefObject<HTMLVideoElement>;
  stopCamera: () => void;
};

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider = ({ children }: { children: React.ReactNode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pathname = usePathname();

  const stopCamera = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  
    // ✅ Only stop permissions if on the home page `/`
    if (pathname === "/generatebooth") {
      try {
        const tracks = (
          await navigator.mediaDevices.getUserMedia({ video: true })
        ).getTracks();
        tracks.forEach((track) => track.stop());
      } catch (error) {
        console.error("Error releasing camera permissions:", error);
      }
    }
  };

  return (
    <CameraContext.Provider value={{ videoRef, stopCamera }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
};
