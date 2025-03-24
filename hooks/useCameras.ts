import { useState, useCallback, useEffect } from "react";

interface Device {
  deviceId: string;
  label: string;
}

export const useCameras = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const getCameras = useCallback(async () => {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${devices.indexOf(device) + 1}`,
        }));
  
      setDevices(videoDevices);
  
      if (videoDevices.length > 0) {
        setSelectedDeviceId((prev) =>
          videoDevices.some((device) => device.deviceId === prev)
            ? prev
            : videoDevices[0].deviceId
        );
      }
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  }, []);
  

  useEffect(() => {
    getCameras();
  }, [getCameras]);

  return { devices, selectedDeviceId, setSelectedDeviceId };
};
