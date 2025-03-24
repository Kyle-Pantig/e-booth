import { useState, useCallback, useEffect } from "react";

interface Device {
  deviceId: string;
  label: string;
}

export const useCameras = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const getCameras = useCallback(async () => {
    try {
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
      
      setInitialized(true);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  }, []);

  // Initial enumeration
  useEffect(() => {
    getCameras();
  }, [getCameras]);

  // Set up listener for when permissions might have changed
  useEffect(() => {
    const handleDeviceChange = () => {
      getCameras();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    // This will run after react-webcam has requested permissions
    const checkForLabels = setInterval(() => {
      // If we already have labels, no need to check
      if (devices.some(device => device.label && !device.label.startsWith('Camera '))) {
        clearInterval(checkForLabels);
        return;
      }
      
      // Otherwise, try to update our device list
      getCameras();
    }, 100);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      clearInterval(checkForLabels);
    };
  }, [getCameras, devices]);

  return { devices, selectedDeviceId, setSelectedDeviceId, initialized };
};