"use client";
import SelectCamera from "@/components/SelectCamera";
import { Button } from "@/components/ui/button";
import { useCapturedImages } from "@/context/CapturedImagesContext";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

const filters = [
  { name: "No Filter", value: "none" },
  {
    name: "Fresh",
    value: "brightness(110%) saturate(115%) contrast(105%)",
    slider: "fresh",
  },
  {
    name: "Clear",
    value: "contrast(125%) brightness(108%) saturate(105%)",
    slider: "clear",
  },
  {
    name: "Warm",
    value: "sepia(20%) brightness(108%) contrast(110%)",
    slider: "warm",
  },
  {
    name: "Film",
    value: "contrast(105%) brightness(98%) saturate(92%)",
    slider: "film",
  },
  {
    name: "Modern Gold",
    value: "sepia(42%) brightness(108%) contrast(115%) hue-rotate(25deg)",
    slider: "modernGold",
  },
  { name: "B&W", value: "grayscale(100%) contrast(125%)", slider: "bw" },
  { name: "Contrast", value: "contrast(155%)", slider: "contrast" },
  { name: "Gray", value: "grayscale(100%)", slider: "gray" },
  {
    name: "Cool",
    value: "hue-rotate(220deg) brightness(98%) contrast(108%)",
    slider: "cool",
  },
  {
    name: "Vintage",
    value: "sepia(40%) contrast(115%) brightness(102%) saturate(88%)",
    slider: "vintage",
  },
  {
    name: "Fade",
    value: "grayscale(30%) brightness(105%) contrast(92%)",
    slider: "fade",
  },
  {
    name: "Mist",
    value: "brightness(103%) contrast(97%) blur(0.5px)",
    slider: "mist",
  },
  {
    name: "Food",
    value: "saturate(135%) contrast(112%) brightness(105%)",
    slider: "food",
  },
  {
    name: "Autumn",
    value: "sepia(35%) hue-rotate(25deg) brightness(108%) contrast(112%)",
    slider: "autumn",
  },
  {
    name: "City",
    value: "contrast(120%) brightness(98%) saturate(108%)",
    slider: "city",
  },
  {
    name: "Country",
    value: "sepia(25%) brightness(106%) contrast(110%)",
    slider: "country",
  },
  {
    name: "Sunset",
    value: "hue-rotate(20deg) brightness(108%) contrast(115%)",
    slider: "sunset",
  },
  {
    name: "Voyage",
    value: "hue-rotate(215deg) brightness(97%) contrast(110%)",
    slider: "voyage",
  },
  {
    name: "Forest",
    value: "hue-rotate(130deg) brightness(97%) contrast(108%)",
    slider: "forest",
  },
  {
    name: "Flamingo",
    value: "hue-rotate(340deg) saturate(140%) brightness(108%)",
    slider: "flamingo",
  },
  {
    name: "Cyberpunk",
    value: "hue-rotate(310deg) contrast(135%) brightness(95%) saturate(140%)",
    slider: "cyberpunk",
  },
];

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

const GenerateBooth: React.FC = () => {
  const { setCapturedImages, numShots, setNumShots } = useCapturedImages();
  const router = useRouter();
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const [capturedImages, setImages] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("none");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
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

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  useEffect(() => {
    if (pathname === "/generatebooth") {
      getCameras();
      setCameraOn(true);
    } else {
      setCameraOn(false);
    }
  }, [pathname]);

  useEffect(() => {
    getCameras();
  }, []);

  useEffect(() => {
    if (pathname === "/generatebooth") {
      setCameraOn(true);
    } else {
      setCameraOn(false);
    }
  }, [pathname]);

  const startCamera = useCallback(
    async (deviceId: string) => {
      try {
        if (pathname !== "/generatebooth") return;

        stopCamera();

        await new Promise((resolve) => setTimeout(resolve, 100));

        const permissionStatus = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });

        if (permissionStatus.state === "denied") {
          alert(
            "Camera access is denied. Please enable it in your browser settings."
          );
          return;
        }

        const constraints = {
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 60, max: 60 },
          },
        };

        const newStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert(
          "Error accessing the camera. Make sure you have allowed camera permissions."
        );
      }
    },
    [pathname, videoRef]
  );

  useEffect(() => {
    if (cameraOn && selectedDeviceId) {
      startCamera(selectedDeviceId);
    } else {
      stopCamera();
    }
  }, [cameraOn, selectedDeviceId, startCamera]);

  // Function to trigger the flash effect
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

          stopCamera();

          await new Promise((resolve) => setTimeout(resolve, 100));

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

            // ✅ Recursively call to capture the next photo
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
  // Capture Photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");
      if (!context) {
        console.error("Failed to get 2D context.");
        return null;
      }

      // Match canvas size with the video stream's resolution
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      context.save();

      // Ensure filter compatibility with Safari
      context.filter = filter !== "none" ? filter : "none";

      if (isMirrored) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      // Use requestAnimationFrame for better rendering on iOS
      requestAnimationFrame(() => {
        context.drawImage(video, 0, 0, videoWidth, videoHeight);
        context.restore();
      });

      return canvas.toDataURL("image/png");
    }
    return null;
  };

  // const stopCamera = () => {
  //   if (videoRef.current && videoRef.current.srcObject) {
  //     const stream = videoRef.current.srcObject as MediaStream;
  //     const tracks = stream.getTracks();
  //     tracks.forEach((track) => track.stop());
  //     videoRef.current.srcObject = null;
  //   }
  // };
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      videoRef.current.srcObject = null;
    }
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
          `brightness(${100 + value / 10}%) saturate(${
            100 + value / 5
          }%) contrast(${100 + value / 10}%)`
        );
        break;
      case "clear":
        setFilter(
          `contrast(${100 + value / 2}%) brightness(${
            100 + value / 10
          }%) saturate(${100 + value / 5}%)`
        );
        break;
      case "warm":
        setFilter(
          `sepia(${value / 3}%) brightness(${100 + value / 10}%) contrast(${
            100 + value / 10
          }%)`
        );
        break;
      case "film":
        setFilter(
          `contrast(${100 + value / 5}%) brightness(${
            100 - value / 10
          }%) saturate(${100 - value / 10}%)`
        );
        break;
      case "modernGold":
        setFilter(
          `sepia(${value / 2}%) brightness(${100 + value / 10}%) contrast(${
            100 + value / 5
          }%) hue-rotate(${value / 2}deg)`
        );
        break;
      case "bw":
        setFilter(`grayscale(${value}%) contrast(${100 + value / 2}%)`);
        break;
      case "gray":
        setFilter(`grayscale(${value}%)`);
        break;
      case "cool":
        setFilter(
          `hue-rotate(${200 + value / 2}deg) brightness(${
            100 - value / 10
          }%) contrast(${100 + value / 10}%)`
        );
        break;
      case "vintage":
        setFilter(
          `sepia(${value / 2}%) contrast(${100 + value / 5}%) brightness(${
            100 + value / 10
          }%) saturate(${100 - value / 10}%)`
        );
        break;
      case "fade":
        setFilter(
          `grayscale(${value / 2}%) brightness(${100 + value / 10}%) contrast(${
            100 - value / 10
          }%)`
        );
        break;
      case "mist":
        setFilter(
          `brightness(${100 + value / 10}%) contrast(${100 - value / 10}%)`
        );
        break;
      case "food":
        setFilter(
          `saturate(${100 + value / 2}%) contrast(${
            100 + value / 10
          }%) brightness(${100 + value / 10}%)`
        );
        break;
      case "autumn":
        setFilter(
          `sepia(${value / 3}%) hue-rotate(${value / 2}deg) brightness(${
            100 + value / 10
          }%) contrast(${100 + value / 10}%)`
        );
        break;
      case "city":
        setFilter(
          `contrast(${100 + value / 2}%) brightness(${
            100 - value / 10
          }%) saturate(${100 + value / 5}%)`
        );
        break;
      case "country":
        setFilter(
          `sepia(${value / 3}%) brightness(${100 + value / 10}%) contrast(${
            100 + value / 10
          }%)`
        );
        break;
      case "sunset":
        setFilter(
          `hue-rotate(${value / 2}deg) brightness(${
            100 + value / 10
          }%) contrast(${100 + value / 5}%)`
        );
        break;
      case "voyage":
        setFilter(
          `hue-rotate(${220 + value / 2}deg) brightness(${
            100 - value / 10
          }%) contrast(${100 + value / 10}%)`
        );
        break;
      case "forest":
        setFilter(
          `hue-rotate(${130 + value / 2}deg) brightness(${
            97 - value / 10
          }%) contrast(${108 + value / 10}%)`
        );
        break;

      case "flamingo":
        setFilter(
          `hue-rotate(${330 + value / 2}deg) saturate(${
            100 + value / 2
          }%) brightness(${100 + value / 10}%)`
        );
        break;
      case "cyberpunk":
        setFilter(
          `hue-rotate(${300 + value / 2}deg) contrast(${
            100 + value / 2
          }%) brightness(${100 - value / 10}%) saturate(${100 + value / 2}%)`
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
            selectedDeviceId={selectedDeviceId}
            setSelectedDeviceId={setSelectedDeviceId}
          />

          {/* Camera Feed */}
          <div className="flex justify-center items-center w-full max-w-[37.5rem] lg:max-w-[43.75rem] h-64 sm:h-80 md:h-96 relative pt-2">
            {cameraOn ? (
              <>
                {/* Video Feed */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="video-feed w-[20rem] md:w-[30rem] h-full object-cover rounded-lg"
                  style={{
                    WebkitFilter: filter,
                    filter,
                    transform: isMirrored ? "scaleX(-1)" : "none",
                    willChange: "transform, filter",
                    backfaceVisibility: "hidden",
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
              onClick={() => setCameraOn((prev) => !prev)}
              disabled={capturing}
              className="ml-auto dark:border bg-accent"
              variant={"ghost"}
            >
              {cameraOn ? <FiCameraOff /> : <FiCamera />}
            </Button>
          </div>

          <div className="flex justify-center items-center mx-auto gap-2">
            {[1, 2, 3, 4].map((shot) => (
              <Button
                key={shot}
                onClick={() => setNumShots(shot)}
                className={
                  numShots === shot
                    ? "bg-primary text-white text-xs"
                    : "bg-gray-300 text-black-100 text-xs"
                }
                disabled={capturing}
              >
                {shot} Shot{shot > 1 ? "s" : ""}
              </Button>
            ))}
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

      <Tabs defaultValue="adjust" className="w-[350px] my-10 mx-8">
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
                            onValueChange={(val) => handleSliderChange(val[0])}
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
    </div>
  );
};

export default GenerateBooth;
