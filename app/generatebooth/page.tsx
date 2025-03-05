"use client";
import SelectCamera from "@/components/SelectCamera";
import { Button } from "@/components/ui/button";
import { useCapturedImages } from "@/context/CapturedImagesContext";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { RiFlipHorizontalFill, RiFlipHorizontalLine } from "react-icons/ri";
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

const filters = [
  { name: "No Filter", value: "none" },
  { name: "Grayscale", value: "grayscale(100%)", slider: "grayscale" },
  {
    name: "Vintage",
    value:
      "grayscale(100%) contrast(120%) brightness(110%) sepia(30%) hue-rotate(10deg) blur(0.4px)",
    slider: "vintage",
  },
  { name: "Sepia", value: "sepia(100%)", slider: "sepia" },
  {
    name: "Soft",
    value: "brightness(130%) contrast(105%) saturate(80%) blur(0.3px)",
    slider: "soft",
  },
  { name: "Invert", value: "invert(100%)", slider: "invert" },
  { name: "High Contrast", value: "contrast(200%)", slider: "contrast" },
  { name: "Hue Rotate", value: "hue-rotate(90deg)", slider: "hue" },
  { name: "Blur", value: "blur(3px)", slider: "blur" },
  {
    name: "Warm Glow",
    value: "sepia(40%) brightness(110%) contrast(120%)",
    slider: "warmGlow",
  },
  {
    name: "Cool Tone",
    value: "hue-rotate(200deg) brightness(90%) contrast(110%)",
    slider: "coolTone",
  },
  {
    name: "Dramatic",
    value: "contrast(150%) brightness(80%) saturate(130%)",
    slider: "dramatic",
  },
  {
    name: "Retro",
    value: "sepia(50%) contrast(120%) brightness(105%) saturate(90%)",
    slider: "retro",
  },
  {
    name: "Night Vision",
    value: "invert(100%) hue-rotate(120deg) brightness(130%)",
    slider: "nightVision",
  },
  {
    name: "Dreamy",
    value: "blur(2px) brightness(120%) saturate(110%)",
    slider: "dreamy",
  },
  {
    name: "Cyberpunk",
    value: "hue-rotate(300deg) contrast(130%) brightness(90%) saturate(150%)",
    slider: "cyberpunk",
  },
  {
    name: "Faded",
    value: "grayscale(40%) brightness(110%) contrast(90%)",
    slider: "faded",
  },
  {
    name: "Deep Blue",
    value: "hue-rotate(220deg) contrast(120%) brightness(95%) saturate(130%)",
    slider: "deepBlue",
  },
  {
    name: "Golden Hour",
    value: "sepia(50%) brightness(110%) contrast(115%)",
    slider: "goldenHour",
  },
  {
    name: "Cinematic",
    value: "contrast(140%) brightness(85%) saturate(90%)",
    slider: "cinematic",
  },
  {
    name: "Pastel",
    value: "saturate(90%) brightness(115%) contrast(95%)",
    slider: "pastel",
  },
  {
    name: "Shadow",
    value: "brightness(85%) contrast(120%)",
    slider: "shadow",
  },
  {
    name: "Muted",
    value: "saturate(70%) brightness(105%) contrast(95%)",
    slider: "muted",
  },
  {
    name: "Vibrant",
    value: "saturate(140%) contrast(120%) brightness(110%)",
    slider: "vibrant",
  },
  {
    name: "Frosted",
    value: "blur(3px) brightness(110%)",
    slider: "frosted",
  },
];

const GenerateBooth: React.FC = () => {
  const { setCapturedImages, numShots, setNumShots } = useCapturedImages();
  const router = useRouter();
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImages, setImages] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("none");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState<number>(100);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, number>>({});
  const [captureProgress, setCaptureProgress] = useState<string | null>(null);

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

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  const startCamera = useCallback(
    async (deviceId: string) => {
      try {
        if (pathname !== "/generatebooth") return;

        // Explicitly request permission to trigger the browser prompt
        await navigator.mediaDevices.getUserMedia({ video: true });

        // Check if camera permission is granted
        const permissionStatus = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });

        if (permissionStatus.state === "denied") {
          alert(
            "Camera access is denied. Please enable it in your browser settings."
          );
          return;
        }

        // Apply video constraints using the selected device
        const constraints = {
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          },
        };

        // Get camera stream
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

  // Countdown to take 4 pictures automatically
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
          setTimeout(() => {
            router.push("/photopreview");
          }, 200);
        } catch (error) {
          console.error("Error navigating to preview:", error);
        }
        return;
      }

      let timeLeft = 3;
      setCountdown(timeLeft);

      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft === 0) {
          clearInterval(timer);
          const imageUrl = capturePhoto();
          if (imageUrl) {
            newCapturedImages.push(imageUrl);
            setImages((prevImages) => [...prevImages, imageUrl]);
          }
          photosTaken += 1;
          setCaptureProgress(`Capturing ${photosTaken}/${numShots}`);
          setTimeout(captureSequence, 1000);
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
      context.filter = filter !== "none" ? filter : "none";

      if (isMirrored) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      // Draw the entire video frame without cropping
      context.drawImage(video, 0, 0, videoWidth, videoHeight);

      context.restore();

      return canvas.toDataURL("image/png");
    }
    return null;
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
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

  const applyFilter = (filterType: string, value: number) => {
    switch (filterType) {
      case "grayscale":
        setFilter(`grayscale(${value}%)`);
        break;
      case "sepia":
        setFilter(`sepia(${value}%)`);
        break;
      case "vintage":
        setFilter(
          `grayscale(${value}%) contrast(${100 + value / 2}%) brightness(${
            100 + value / 5
          }%) sepia(${value / 3}%) hue-rotate(${value / 10}deg) blur(${
            value / 250
          }px)`
        );
        break;
      case "soft":
        setFilter(
          `brightness(${100 + value / 3}%) contrast(${
            100 + value / 5
          }%) saturate(${value}%) blur(${value / 250}px)`
        );
        break;
      case "invert":
        setFilter(`invert(${value}%)`);
        break;
      case "contrast":
        setFilter(`contrast(${value * 2}%)`);
        break;
      case "blur":
        setFilter(`blur(${value / 20}px)`);
        break;
      case "hue":
        setFilter(`hue-rotate(${value}deg)`);
        break;

      // New Filters
      case "warmGlow":
        setFilter(
          `sepia(${value / 2}%) brightness(${100 + value / 5}%) contrast(${
            100 + value / 4
          }%)`
        );
        break;
      case "coolTone":
        setFilter(
          `hue-rotate(${180 + value / 2}deg) brightness(${
            90 + value / 5
          }%) contrast(${100 + value / 4}%)`
        );
        break;
      case "dramatic":
        setFilter(
          `contrast(${100 + value}%) brightness(${80 + value / 5}%) saturate(${
            100 + value / 2
          }%)`
        );
        break;
      case "retro":
        setFilter(
          `sepia(${value / 2}%) contrast(${100 + value / 3}%) brightness(${
            100 + value / 4
          }%) saturate(${100 - value / 4}%)`
        );
        break;
      case "nightVision":
        setFilter(
          `invert(100%) hue-rotate(${120 + value / 2}deg) brightness(${
            100 + value / 4
          }%)`
        );
        break;
      case "dreamy":
        setFilter(
          `blur(${value / 30}px) brightness(${100 + value / 5}%) saturate(${
            100 + value / 4
          }%)`
        );
        break;
      case "cyberpunk":
        setFilter(
          `hue-rotate(${300 + value / 2}deg) contrast(${
            100 + value / 3
          }%) brightness(${100 - value / 4}%) saturate(${100 + value / 2}%)`
        );
        break;
      case "faded":
        setFilter(
          `grayscale(${value / 2}%) brightness(${100 + value / 5}%) contrast(${
            100 - value / 5
          }%)`
        );
        break;

      // More New Filters
      case "deepBlue":
        setFilter(
          `hue-rotate(${220 + value / 3}deg) contrast(${
            100 + value / 3
          }%) brightness(${90 + value / 4}%) saturate(${100 + value / 2}%)`
        );
        break;
      case "goldenHour":
        setFilter(
          `sepia(${50 + value / 2}%) brightness(${105 + value / 5}%) contrast(${
            110 + value / 4
          }%)`
        );
        break;
      case "cinematic":
        setFilter(
          `contrast(${120 + value / 2}%) brightness(${
            90 + value / 5
          }%) saturate(${100 - value / 4}%)`
        );
        break;
      case "pastel":
        setFilter(
          `saturate(${80 + value / 3}%) brightness(${
            110 + value / 4
          }%) contrast(${90 + value / 4}%)`
        );
        break;
      case "shadow":
        setFilter(
          `brightness(${80 + value / 5}%) contrast(${110 + value / 3}%)`
        );
        break;
      case "muted":
        setFilter(
          `saturate(${80 - value / 3}%) brightness(${
            100 + value / 5
          }%) contrast(${90 + value / 5}%)`
        );
        break;
      case "vibrant":
        setFilter(
          `saturate(${120 + value / 3}%) contrast(${
            110 + value / 4
          }%) brightness(${105 + value / 5}%)`
        );
        break;
      case "frosted":
        setFilter(`blur(${value / 15}px) brightness(${105 + value / 5}%)`);
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
              <video
                ref={videoRef}
                playsInline
                autoPlay
                className="video-feed w-full h-full object-cover  rounded-lg"
                style={{
                  filter,
                  transform: isMirrored ? "scaleX(-1)" : "none",
                }}
              />
            ) : (
              <div className="w-[22rem] sm:w-[26rem] md:w-[30rem] h-full flex items-center justify-center text-white text-xl md:text-2xl bg-gray-800 rounded-lg">
                Camera Off
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            {countdown !== null && (
              <h2 className="absolute inset-0 flex items-center justify-center text-white text-4xl md:text-6xl font-bold animate-pulse">
                {countdown}
              </h2>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex flex-wrap justify-center mx-auto gap-2 my-4 md:my-6">
            {cameraOn && (
              <>
                <Button
                  onClick={startCountdown}
                  disabled={capturing}
                  variant="outline"
                  className="bg-gray-300 dark:bg-white dark:text-black-100"
                >
                  {capturing ? captureProgress : "Start Capture"}
                </Button>

                <Button onClick={toggleMirror} disabled={capturing}>
                  {isMirrored ? (
                    <RiFlipHorizontalFill />
                  ) : (
                    <RiFlipHorizontalLine />
                  )}
                </Button>
              </>
            )}
            <Button
              onClick={() => setCameraOn((prev) => !prev)}
              disabled={capturing}
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
                    ? "bg-primary text-white"
                    : "bg-gray-300 text-black-100"
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

      {/* Filter Section */}
      <div className="text-center my-5 max-w-4xl">
        <p className="text-sm font-medium dark:text-white text-black-100">Choose a filter!</p>

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
    </div>
  );
};

export default GenerateBooth;
