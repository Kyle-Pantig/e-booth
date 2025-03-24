"use client";
import SelectCamera from "@/components/SelectCamera";
import { Button } from "@/components/ui/button";
import { useCapturedImages } from "@/context/CapturedImagesContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { IoIosColorFilter } from "react-icons/io";
import { FiCamera, FiCameraOff } from "react-icons/fi";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { motion } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  FaAdjust,
  FaSlidersH,
  FaThermometerHalf,
  FaMagic,
  FaCompress,
} from "react-icons/fa";
import { CiBrightnessUp } from "react-icons/ci";
import { MdExposure } from "react-icons/md";
import { BsHighlights } from "react-icons/bs";
import { IoTriangleOutline } from "react-icons/io5";
import {
  RiFlipHorizontalFill,
  RiFlipHorizontalLine,
  RiResetLeftFill,
} from "react-icons/ri";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filters } from "@/data";
import Webcam from "react-webcam";
import { useCameras } from "@/hooks/useCameras";

const ICONS = {
  brightness: <CiBrightnessUp size={16} />,
  contrast: <FaAdjust size={12} />,
  saturation: <FaSlidersH size={12} />,
  exposure: <MdExposure size={12} />,
  highlights: <BsHighlights size={12} />,
  colorTemperature: <FaThermometerHalf size={12} />,
  tone: <FaCompress size={12} />,
  sharpness: <IoTriangleOutline size={12} />,
};

type Adjustments = Record<
  | "brightness"
  | "contrast"
  | "saturation"
  | "exposure"
  | "highlights"
  | "colorTemperature"
  | "tone"
  | "sharpness",
  number
>;

interface FilterValues {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  invert: number;
  opacity: number;
}

const GenerateBooth: React.FC = () => {
  const { setCapturedImages, numShots, setNumShots } = useCapturedImages();
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const { devices, selectedDeviceId, setSelectedDeviceId } = useCameras();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const [capturedImages, setImages] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("none");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState<number>(100);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null); // Currently selected filter for slider
  const [filterValues, setFilterValues] = useState<Record<string, number>>({}); // Store slider values for each filter
  const [captureProgress, setCaptureProgress] = useState<string | null>(null);
  const [countdownTime, setCountdownTime] = useState<number>(3);
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    highlights: 0,
    colorTemperature: 0,
    tone: 0,
    sharpness: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [autoAdjustments, setAutoAdjustments] = useState<Adjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    highlights: 0,
    colorTemperature: 0,
    tone: 0,
    sharpness: 0,
  });

  const [autoValue, setAutoValue] = useState<number>(50);
  
  useEffect(() => {
    if (webcamRef.current && selectedDeviceId) {
      setCameraOn(false);
      setTimeout(() => setCameraOn(true), 100);
    }
  }, [selectedDeviceId]);

  const handleSelectCamera = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };
  const triggerFlash = () => {
    if (flashRef.current) {
      flashRef.current.style.opacity = "1";
      flashRef.current.style.animation = "none";
      void flashRef.current.offsetWidth;
      flashRef.current.style.animation = "flash 0.2s ease-in-out";

      setTimeout(() => {
        if (flashRef.current) {
          flashRef.current.style.opacity = "0";
        }
      }, 200);
    }
  };

  const startCountdown = () => {
    if (capturing) return;
    setCapturing(true);
    setCaptureProgress(`Capturing 0/${numShots}`);

    let photosTaken = 0;
    const newCapturedImages: string[] = [];

    const captureSequence = async () => {
      if (photosTaken >= numShots) {
        setCountdown(null);
        setCapturing(false);
        setCaptureProgress(null);

        try {
          setCapturedImages([...newCapturedImages]);
          setImages([...newCapturedImages]);
          router.push("/photopreview");
        } catch (error) {
          console.error("Error navigating to preview:", error);
        }
        return;
      }

      let timeLeft = countdownTime;
      setCountdown(timeLeft);

      const timer = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft > 0) {
          setCountdown(timeLeft);
        } else {
          clearInterval(timer);
          setCountdown(null);

          setTimeout(() => {
            triggerFlash();
            const imageUrl = capturePhoto();
            if (imageUrl) {
              newCapturedImages.push(imageUrl);
              setImages((prevImages) => [...prevImages, imageUrl]);
            }
            photosTaken += 1;
            setCaptureProgress(`Capturing ${photosTaken}/${numShots}`);

            //Recursively call to capture the next photo
            setTimeout(captureSequence, 1000);
          }, 200);
        }
      }, 1000);
    };

    captureSequence();
  };

  const toggleMirror = () => {
    setIsMirrored((prev) => !prev);
  };
  // Capture Photo update filter ios issues
  const capturePhoto = (): string | null => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;

    if (video && canvas) {
      // Set willReadFrequently to true for better performance
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        console.error("Failed to get 2D context.");
        return null;
      }

      // Match canvas size with video stream's resolution
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // First draw the video frame to canvas
      if (isMirrored) {
        context.save();
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, videoWidth, videoHeight);
        context.restore();
      } else {
        context.drawImage(video, 0, 0, videoWidth, videoHeight);
      }

      // For iOS, we'll manually apply the filters using a second canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = videoWidth;
      tempCanvas.height = videoHeight;

      // Also set willReadFrequently to true for temp context
      const tempContext = tempCanvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (tempContext && filter !== "none") {
        // Parse the filter string to get individual filter values
        const filterValues = parseFilterString(filter);

        // Get the image data from the first canvas with better performance
        const imageData = context.getImageData(0, 0, videoWidth, videoHeight);

        // Apply each filter manually
        applyFiltersToImageData(imageData, filterValues);

        // Put the modified image data back to the temp canvas
        tempContext.putImageData(imageData, 0, 0);

        // Clear the original canvas and draw the filtered image
        context.clearRect(0, 0, videoWidth, videoHeight);
        context.drawImage(tempCanvas, 0, 0);
      }

      // Return captured image as base64
      return canvas.toDataURL("image/png");
    }
    return null;
  };

  // Helper function to parse filter string into an object with values
  const parseFilterString = (filterString: string): FilterValues => {
    const result: FilterValues = {
      brightness: 100,
      contrast: 100,
      saturate: 100,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      invert: 0,
      opacity: 100,
    };

    if (filterString === "none") return result;

    // Extract values from filter string
    const brightnessMatch = filterString.match(/brightness\((\d+(\.\d+)?)%\)/);
    const contrastMatch = filterString.match(/contrast\((\d+(\.\d+)?)%\)/);
    const saturateMatch = filterString.match(/saturate\((\d+(\.\d+)?)%\)/);
    const grayscaleMatch = filterString.match(/grayscale\((\d+(\.\d+)?)%\)/);
    const sepiaMatch = filterString.match(/sepia\((\d+(\.\d+)?)%\)/);
    const hueRotateMatch = filterString.match(
      /hue-rotate\((-?\d+(\.\d+)?)deg\)/
    );
    const invertMatch = filterString.match(/invert\((\d+(\.\d+)?)%\)/);
    const opacityMatch = filterString.match(/opacity\((\d+(\.\d+)?)%\)/);

    if (brightnessMatch) result.brightness = parseFloat(brightnessMatch[1]);
    if (contrastMatch) result.contrast = parseFloat(contrastMatch[1]);
    if (saturateMatch) result.saturate = parseFloat(saturateMatch[1]);
    if (grayscaleMatch) result.grayscale = parseFloat(grayscaleMatch[1]);
    if (sepiaMatch) result.sepia = parseFloat(sepiaMatch[1]);
    if (hueRotateMatch) result.hueRotate = parseFloat(hueRotateMatch[1]);
    if (invertMatch) result.invert = parseFloat(invertMatch[1]);
    if (opacityMatch) result.opacity = parseFloat(opacityMatch[1]);

    return result;
  };

  // Helper function to apply filters to image data
  const applyFiltersToImageData = (
    imageData: ImageData,
    filters: FilterValues
  ): void => {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply brightness
      const brightnessRatio = filters.brightness / 100;
      r *= brightnessRatio;
      g *= brightnessRatio;
      b *= brightnessRatio;

      // Apply contrast
      r = (r - 128) * (filters.contrast / 100) + 128;
      g = (g - 128) * (filters.contrast / 100) + 128;
      b = (b - 128) * (filters.contrast / 100) + 128;

      // Apply saturation
      const saturationRatio = filters.saturate / 100;
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + saturationRatio * (r - gray);
      g = gray + saturationRatio * (g - gray);
      b = gray + saturationRatio * (b - gray);

      // Apply grayscale
      if (filters.grayscale > 0) {
        const grayIntensity = filters.grayscale / 100;
        const grayValue = 0.2989 * r + 0.587 * g + 0.114 * b;
        r = r * (1 - grayIntensity) + grayValue * grayIntensity;
        g = g * (1 - grayIntensity) + grayValue * grayIntensity;
        b = b * (1 - grayIntensity) + grayValue * grayIntensity;
      }

      // Apply sepia
      if (filters.sepia > 0) {
        const sepiaIntensity = filters.sepia / 100;
        const sepiaR = r * 0.393 + g * 0.769 + b * 0.189;
        const sepiaG = r * 0.349 + g * 0.686 + b * 0.168;
        const sepiaB = r * 0.272 + g * 0.534 + b * 0.131;
        r = r * (1 - sepiaIntensity) + sepiaR * sepiaIntensity;
        g = g * (1 - sepiaIntensity) + sepiaG * sepiaIntensity;
        b = b * (1 - sepiaIntensity) + sepiaB * sepiaIntensity;
      }

      // Apply hue rotation
      if (filters.hueRotate !== 0) {
        const hueRotate = filters.hueRotate % 360;
        const hsl = rgbToHsl(r, g, b);
        hsl[0] = (hsl[0] + hueRotate / 360) % 1;
        const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
      }

      // Apply invert
      if (filters.invert > 0) {
        const invertIntensity = filters.invert / 100;
        r = r * (1 - invertIntensity) + (255 - r) * invertIntensity;
        g = g * (1 - invertIntensity) + (255 - g) * invertIntensity;
        b = b * (1 - invertIntensity) + (255 - b) * invertIntensity;
      }

      // Clamp values
      data[i] = Math.max(0, Math.min(255, Math.round(r)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));

      // Apply opacity
      if (filters.opacity < 100) {
        data[i + 3] = data[i + 3] * (filters.opacity / 100);
      }
    }
  };

  // Helper function to convert RGB to HSL
  const rgbToHsl = (
    r: number,
    g: number,
    b: number
  ): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return [h, s, l];
  };

  // Helper function to convert HSL to RGB
  const hslToRgb = (
    h: number,
    s: number,
    l: number
  ): [number, number, number] => {
    let r = 0;
    let g = 0;
    let b = 0;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
  };

  const handleCameraOff = () => {
    setCameraOn((prev) => !prev);
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    if (selectedFilter) {
      setFilterValues((prev) => ({ ...prev, [selectedFilter]: value })); // Store slider value
      applyFilter(selectedFilter, value);
    }
  };

  const resetAutoAdjustments = () => {
    setAutoAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      highlights: 0,
      colorTemperature: 0,
      tone: 0,
      sharpness: 0,
    });
    setAutoValue(0);
    setSelectedFilter(null);

    applyAdjustments(adjustments, {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      highlights: 0,
      colorTemperature: 0,
      tone: 0,
      sharpness: 0,
    });
  };

  const resetAllAdjustments = () => {
    const defaultAdjustments: Adjustments = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      highlights: 0,
      colorTemperature: 0,
      tone: 0,
      sharpness: 0,
    };

    setAdjustments(defaultAdjustments);
    setAutoAdjustments(defaultAdjustments);
    setAutoValue(0);
    setSelectedFilter(null);
    setSliderValue(0);

    applyAdjustments(defaultAdjustments, defaultAdjustments);
  };

  const handleAdjustmentChange = (key: keyof Adjustments, value: number) => {
    resetAutoAdjustments();

    setAdjustments((prev) => {
      const newAdjustments = { ...prev, [key]: value };
      applyAdjustments(newAdjustments, {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        exposure: 0,
        highlights: 0,
        colorTemperature: 0,
        tone: 0,
        sharpness: 0,
      });
      return newAdjustments;
    });

    setSelectedFilter(key);
    setSliderValue(value);
  };

  const handleAutoAdjust = (value: number) => {
    const scale = value / 100;
    const autoValues: Adjustments = {
      brightness: -20 * scale,
      contrast: 22 * scale,
      saturation: 27 * scale,
      exposure: 15 * scale,
      highlights: -50 * scale,
      colorTemperature: 0,
      tone: 0,
      sharpness: 0,
    };

    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      highlights: 0,
      colorTemperature: 0,
      tone: 0,
      sharpness: 0,
    });

    setAutoAdjustments(autoValues);
    setAutoValue(value);
    setSelectedFilter("auto");

    applyAdjustments(
      {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        exposure: 0,
        highlights: 0,
        colorTemperature: 0,
        tone: 0,
        sharpness: 0,
      },
      autoValues
    );
  };

  const handleOpenChange = (key: keyof Adjustments, open: boolean) => {
    if (open) {
      setSelectedFilter(key);
      setSliderValue(adjustments[key]);
    } else {
      setSelectedFilter(null);
    }
  };

  const toggleAuto = () => {
    if (selectedFilter === "auto") {
      resetAutoAdjustments();
    } else {
      handleAutoAdjust(50);
    }
  };

  const applyAdjustments = (
    adjustments: Adjustments,
    autoAdjustments: Adjustments
  ) => {
    const filterString = `
    brightness(${100 + adjustments.brightness + autoAdjustments.brightness}%)
    contrast(${100 + adjustments.contrast + autoAdjustments.contrast}%)
    saturate(${100 + adjustments.saturation + autoAdjustments.saturation}%)
    grayscale(${Math.abs(adjustments.exposure + autoAdjustments.exposure)}%)
    sepia(${Math.abs(adjustments.highlights + autoAdjustments.highlights)}%)
    hue-rotate(${
      adjustments.colorTemperature + autoAdjustments.colorTemperature
    }deg)
    invert(${Math.abs(adjustments.tone + autoAdjustments.tone)}%)
    opacity(${
      100 - Math.abs(adjustments.sharpness + autoAdjustments.sharpness)
    }%)
  `;
    setFilter(filterString);
  };

  const applyFilter = (filterType: string, value: number) => {
    switch (filterType) {
      case "fresh":
        setFilter(
          `brightness(${100 + value / 20}%) saturate(${
            100 + value / 10
          }%) contrast(${100 + value / 20}%)`
        );
        break;
      case "clear":
        setFilter(
          `contrast(${100 + value / 10}%) brightness(${
            100 + value / 20
          }%) saturate(${100 + value / 15}%)`
        );
        break;
      case "warm":
        setFilter(
          `sepia(${value / 10}%) brightness(${100 + value / 20}%) contrast(${
            100 + value / 20
          }%)`
        );
        break;
      case "film":
        setFilter(
          `contrast(${100 + value / 15}%) brightness(${
            100 - value / 30
          }%) saturate(${100 - value / 20}%)`
        );
        break;
      case "modernGold":
        setFilter(
          `sepia(${value / 10}%) brightness(${100 + value / 20}%) contrast(${
            100 + value / 15
          }%) hue-rotate(${value / 4}deg)`
        );
        break;
      case "bw":
        setFilter(`grayscale(${value}%) contrast(${100 + value / 10}%)`);
        break;
      case "contrast":
        setFilter(`contrast(${100 + value / 2}%)`);
        break;
      case "gray":
        setFilter(`grayscale(${value}%)`);
        break;
      case "cool":
        setFilter(
          `hue-rotate(${200 + value / 4}deg) brightness(${
            100 - value / 20
          }%) contrast(${100 + value / 20}%)`
        );
        break;
      case "vintage":
        setFilter(
          `sepia(${value / 10}%) contrast(${100 + value / 15}%) brightness(${
            100 + value / 20
          }%) saturate(${100 - value / 20}%)`
        );
        break;
      case "fade":
        setFilter(
          `grayscale(${value / 15}%) brightness(${
            100 + value / 20
          }%) contrast(${100 - value / 20}%)`
        );
        break;
      case "mist":
        setFilter(
          `brightness(${100 + value / 20}%) contrast(${100 - value / 20}%)`
        );
        break;
      case "food":
        setFilter(
          `saturate(${100 + value / 10}%) contrast(${
            100 + value / 15
          }%) brightness(${100 + value / 20}%)`
        );
        break;
      case "autumn":
        setFilter(
          `sepia(${value / 10}%) hue-rotate(${value / 4}deg) brightness(${
            100 + value / 20
          }%) contrast(${100 + value / 20}%)`
        );
        break;
      case "city":
        setFilter(
          `contrast(${100 + value / 10}%) brightness(${
            100 - value / 20
          }%) saturate(${100 + value / 15}%)`
        );
        break;
      case "country":
        setFilter(
          `sepia(${value / 10}%) brightness(${100 + value / 20}%) contrast(${
            100 + value / 20
          }%)`
        );
        break;
      case "sunset":
        setFilter(
          `hue-rotate(${value / 4}deg) brightness(${
            100 + value / 20
          }%) contrast(${100 + value / 15}%)`
        );
        break;
      case "voyage":
        setFilter(
          `hue-rotate(${220 + value / 4}deg) brightness(${
            100 - value / 20
          }%) contrast(${100 + value / 20}%)`
        );
        break;
      case "forest":
        setFilter(
          `hue-rotate(${130 + value / 4}deg) brightness(${
            97 - value / 20
          }%) contrast(${108 + value / 20}%)`
        );
        break;
      case "flamingo":
        setFilter(
          `hue-rotate(${330 + value / 4}deg) saturate(${
            100 + value / 10
          }%) brightness(${100 + value / 20}%)`
        );
        break;
      case "cyberpunk":
        setFilter(
          `hue-rotate(${300 + value / 4}deg) contrast(${
            100 + value / 10
          }%) brightness(${100 - value / 20}%) saturate(${100 + value / 10}%)`
        );
        break;
      default:
        setFilter("none");
    }
  };

  return (
    <div className="px-4 md:px-10 lg:px-20 relative antialiased flex flex-col justify-center items-center ">
      {/* Main Flex Layout: Responsive for Mobile, Tablet, and Desktop */}
      <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-32 relative pt-10 ">
        {/* Left Section: Camera */}
        <div className="flex flex-col justify-center items-center w-full md:w-auto md:flex md:justify-center md:items-start ">
          {/* Camera Selection Dropdown */}
          <SelectCamera
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onSelectCamera={handleSelectCamera}
          />

          {/* Camera Feed */}
          <div className="flex justify-center items-center w-full max-w-[37.5rem] lg:max-w-[43.75rem] h-64 sm:h-80 md:h-96 relative pt-2">
            {cameraOn ? (
              <>
                {/* Video Feed using react-webcam */}
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  videoConstraints={{
                    deviceId: selectedDeviceId
                      ? { exact: selectedDeviceId }
                      : undefined,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { min: 30, max: 60 },
                  }}
                  mirrored={isMirrored}
                  className="w-full h-full max-w-[20.5rem] sm:max-w-[26rem] md:max-w-[30rem] object-cover rounded-lg"
                  style={{
                    WebkitFilter: filter,
                    filter,
                    willChange: "transform, filter",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  onUserMediaError={(error) => {
                    console.error("Webcam error:", error);
                    setCameraOn(false);
                  }}
                />

                {/* White Flash Overlay */}
                <div
                  ref={flashRef}
                  className="absolute inset-0 w-full h-full bg-white opacity-0 pointer-events-none rounded-lg"
                ></div>
              </>
            ) : (
              <div className="w-[22rem] sm:w-[26rem] md:w-[30rem] h-full flex items-center justify-center text-white text-xl md:text-2xl bg-gray-800 rounded-lg">
                Camera Off
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Shutter Effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-white rounded-full animate-shutter"></div>
                </div>
                {/* Countdown Number */}
                <h2 className="relative text-white text-6xl md:text-8xl font-bold animate-pulse">
                  {countdown}
                </h2>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex justify-between items-center w-full my-4 md:my-6">
            {/* Left Side Controls */}
            <div className="flex items-center gap-2">
              {/* Countdown Dropdown - Positioned to the left */}
              {cameraOn && (
                <>
                  <Select
                    value={String(countdownTime)}
                    onValueChange={(value) => setCountdownTime(Number(value))}
                    disabled={capturing}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10s</SelectItem>
                      <SelectItem value="5">5s</SelectItem>
                      <SelectItem value="4">4s</SelectItem>
                      <SelectItem value="3">3s</SelectItem>
                      <SelectItem value="2">2s</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Start Capture Button */}
                  <Button
                    onClick={startCountdown}
                    disabled={capturing}
                    variant="outline"
                    className="bg-gray-300 dark:bg-white dark:text-black-100"
                  >
                    {capturing ? captureProgress : "Start Capture"}
                  </Button>

                  {/* Mirror Button */}
                  <Button
                    onClick={toggleMirror}
                    className="bg-accent"
                    variant={"ghost"}
                    disabled={capturing}
                  >
                    {isMirrored ? (
                      <RiFlipHorizontalFill />
                    ) : (
                      <RiFlipHorizontalLine />
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Right Side - Camera On/Off Button */}
            <Button
              onClick={handleCameraOff}
              disabled={capturing}
              className="ml-auto dark:border bg-accent"
              variant={"ghost"}
            >
              {cameraOn ? <FiCameraOff /> : <FiCamera />}
            </Button>
          </div>

          <div className="flex justify-center items-center mx-auto gap-4 w-full">
            {cameraOn && (
              <>
                {[1, 2, 3, 4].map((shot) => (
                  <Button
                    key={shot}
                    onClick={() => setNumShots(shot)}
                    className={`rounded-full ${
                      numShots === shot
                        ? "bg-primary dark:text-white text-xs"
                        : "bg-accent dark:text-white text-black-100 text-xs"
                    }`}
                    disabled={capturing}
                  >
                    {shot} Shot{shot > 1 ? "s" : ""}
                  </Button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Section: Captured Images */}
        {capturedImages.length > 0 && (
          <div className="flex flex-col justify-center gap-2 p-2 pb-10 min-w-32 bg-black-100 dark:bg-white rounded-lg shadow-lg">
            {capturedImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={image}
                  alt={`Captured ${index + 1}`}
                  className="w-32 h-24 md:w-48 md:h-36 object-cover bg-white-100"
                  width={500}
                  height={500}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {cameraOn && (
        <>
          <Tabs defaultValue="adjust" className="w-[350px] mb-10 pt-6 mx-8">
            <div className="flex justify-end items-center w-full">
              <Button
                onClick={resetAllAdjustments}
                className="text-sm px-3 py-1 rounded-md"
                variant={"ghost"}
                disabled={capturing}
              >
                <RiResetLeftFill />
              </Button>
            </div>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="adjust"
                className="flex items-center gap-2 text-xs"
              >
                <HiOutlineAdjustmentsHorizontal />
                Adjust
              </TabsTrigger>
              <TabsTrigger
                value="filters"
                className="flex items-center gap-2 text-xs"
              >
                <IoIosColorFilter />
                Filters
              </TabsTrigger>
            </TabsList>
            <TabsContent value="filters">
              {/* Filter Section */}
              <div className="text-center my-5 max-w-4xl">
                <div className="flex flex-col items-center gap-4 py-2 max-w-96 md:max-w-lg">
                  <ScrollArea className="w-full max-w-lg rounded-md border">
                    <div className="w-max space-x-4 p-4">
                      {filters.map((item) => (
                        <Popover key={item.name}>
                          <PopoverTrigger asChild>
                            <Button
                              onClick={() => {
                                const savedValue =
                                  filterValues[item.slider as string] ?? 100;
                                setSelectedFilter(item.slider || null);
                                setSliderValue(savedValue);
                                applyFilter(item.slider as string, savedValue);
                              }}
                              className={`min-w-[100px] ${
                                selectedFilter === item.slider
                                  ? "bg-white text-black"
                                  : ""
                              }`}
                              disabled={capturing}
                            >
                              {item.name}
                            </Button>
                          </PopoverTrigger>
                          {item.slider && (
                            <PopoverContent className="w-48">
                              <p className="text-sm font-medium flex justify-between">
                                {item.name} Intensity
                                <span className="text-gray-500 text-xs">
                                  {sliderValue}%
                                </span>
                              </p>
                              <Slider
                                value={[sliderValue]}
                                onValueChange={(val) =>
                                  handleSliderChange(val[0])
                                }
                                min={0}
                                max={100}
                                step={1}
                              />
                            </PopoverContent>
                          )}
                        </Popover>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="adjust">
              <div className="text-center my-2 max-w-4xl">
                <div className="flex flex-col items-center gap-4 py-2 max-w-96 md:max-w-lg">
                  <ScrollArea className="w-full max-w-lg rounded-md border">
                    <div className="flex w-max gap-8 p-4 ">
                      {/* Auto Adjustment Button */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            onClick={toggleAuto}
                            className="flex flex-col items-center gap-2"
                            disabled={capturing}
                          >
                            <div
                              className={`w-10 h-10 flex items-center justify-center rounded-full transition border ${
                                selectedFilter === "auto" && autoValue !== 0
                                  ? "bg-black-100 dark:bg-white"
                                  : "bg-gray-300 dark:bg-accent hover:bg-gray-400 dark:hover:bg-gray-600"
                              }`}
                            >
                              <span
                                className={`${
                                  selectedFilter === "auto" && autoValue !== 0
                                    ? "text-white dark:text-black-100"
                                    : "text-black-100 dark:text-white "
                                } text-xl`}
                              >
                                <FaMagic size={12} />
                              </span>
                            </div>
                            <span className="text-xs text-black dark:text-white">
                              Auto
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48">
                          <p className="text-sm font-medium flex justify-between">
                            Auto Adjust
                            <span className="text-gray-500 text-xs">
                              {autoValue}
                            </span>
                          </p>
                          <Slider
                            value={[autoValue]}
                            onValueChange={(val) => handleAutoAdjust(val[0])}
                            min={0}
                            max={100}
                            step={1}
                          />
                        </PopoverContent>
                      </Popover>

                      {/* Individual Adjustment Buttons + Sliders */}
                      {Object.entries(adjustments).map(([key, value]) => (
                        <Popover
                          key={key}
                          onOpenChange={(open) =>
                            handleOpenChange(key as keyof Adjustments, open)
                          }
                        >
                          <PopoverTrigger asChild>
                            <button
                              disabled={capturing}
                              onClick={() => {
                                if (selectedFilter === key) {
                                  setSelectedFilter(null);
                                } else {
                                  handleAdjustmentChange(
                                    key as keyof Adjustments,
                                    value
                                  );
                                }
                              }}
                              className={`flex flex-col items-center gap-2`}
                            >
                              <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition border ${
                                  value !== 0
                                    ? "bg-black-100 dark:bg-white"
                                    : "bg-gray-300 dark:bg-accent hover:bg-gray-400 dark:hover:bg-gray-600"
                                }`}
                              >
                                <span
                                  className={`${
                                    value !== 0
                                      ? "text-white dark:text-black-100"
                                      : "text-black dark:text-white"
                                  } text-xl`}
                                >
                                  {ICONS[key as keyof Adjustments]}
                                </span>
                              </div>
                              <span className="text-xs text-black dark:text-white text-center">
                                {key === "colorTemperature" ? (
                                  <>
                                    <span className="block">Color</span>
                                    <span className="block">Temperature</span>
                                  </>
                                ) : (
                                  key.charAt(0).toUpperCase() + key.slice(1)
                                )}
                              </span>
                            </button>
                          </PopoverTrigger>
                          {selectedFilter === key && (
                            <PopoverContent className="w-48">
                              <p className="text-sm font-medium flex justify-between">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                <span className="text-gray-500 text-xs">
                                  {sliderValue}
                                </span>
                              </p>
                              <Slider
                                value={[sliderValue]}
                                onValueChange={(val) => {
                                  handleAdjustmentChange(
                                    key as keyof Adjustments,
                                    val[0]
                                  );
                                  setSliderValue(val[0]);
                                }}
                                min={key === "sharpness" ? 0 : -100}
                                max={key === "sharpness" ? 100 : 100}
                                step={1}
                              />
                            </PopoverContent>
                          )}
                        </Popover>
                      ))}
                    </div>
                    {/* Fix ScrollBar Visibility */}
                    <ScrollBar orientation="horizontal" className="mt-2" />
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default GenerateBooth;