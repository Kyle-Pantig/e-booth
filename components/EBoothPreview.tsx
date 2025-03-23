/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Input } from "./ui/input";
import { FaArrowDown, FaSmile } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useCapturedImages } from "@/context/CapturedImagesContext";
import { FaRepeat } from "react-icons/fa6";
import EmojiPicker from "emoji-picker-react";
import { MdBlock } from "react-icons/md";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { fontOptions, fontSizeOptions, frames, stickers } from "@/data";
import { Slider } from "./ui/slider";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Bold, Italic } from "lucide-react";

interface PhotoPreviewProps {
  capturedImages: string[];
}

const buttonFrames = [
  {
    id: "none",
    icon: <MdBlock size={24} className="text-black group-hover:text-white" />,
  },
  { id: "flowers", icon: "🌸" },
  { id: "stars", icon: "⭐" },
  { id: "hearts", icon: "❤️" },
  { id: "clouds", icon: "☁️" },
  { id: "bow", icon: "🎀" },
  { id: "butterfly", icon: "🦋" },
  { id: "leaf", icon: "🍃" },
  { id: "glowingStar", icon: "✨" },
];

const EBoothPreview: React.FC<PhotoPreviewProps> = ({ capturedImages }) => {
  const { numShots } = useCapturedImages();
  const stripCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();
  const [stripColor, setStripColor] = useState<string>("#ffffff");
  const [selectedFrame, setSelectedFrame] = useState<string>("none");
  const [email, setEmail] = useState<string>("");
  const [customColor, setCustomColor] = useState<string>("#ffffff");
  const [textInput, setTextInput] = useState<string>("");
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [showDate, setShowDate] = useState<boolean>(true);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [selectedFont, setSelectedFont] = useState<string>("Arial");
  const [fontSize, setFontSize] = useState<number>(20);
  const [radius, setRadius] = useState<number>(10);

  const handleToggle = (values: string[]) => {
    setIsBold(values.includes("bold"));
    setIsItalic(values.includes("italic"));
  };

  const MAX_LENGTH = 20;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStripColor(customColor);
    }, 100);

    return () => clearTimeout(timeout);
  }, [customColor]);

  const drawStickers = (
    ctx: CanvasRenderingContext2D,
    totalWidth: number,
    totalHeight: number,
    selectedFrame: string
  ) => {
    const selectedStickers = stickers[selectedFrame];
    if (selectedStickers) {
      selectedStickers.forEach((sticker) => {
        const img = document.createElement("img");
        img.src = sticker.src;
        img.onload = () => {
          ctx.drawImage(
            img,
            typeof sticker.x === "function" ? sticker.x(totalWidth) : sticker.x,
            typeof sticker.y === "function"
              ? sticker.y(totalHeight)
              : sticker.y,
            sticker.width,
            sticker.height
          );
        };
        img.onerror = (e: any) => {
          console.error(`Failed to load sticker ${sticker.src}:`, e);
        };
      });
    }
  };

  const generatePhotoStrip = useCallback(() => {
    const canvas = stripCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgWidth = 400;
    const imgHeight = 300;
    const borderSize = 30;
    const photoSpacing = 20;
    const textHeight = 100;

    const numShots = capturedImages.length;
    const totalHeight =
      imgHeight * numShots +
      photoSpacing * (numShots - 1) +
      borderSize * 2 +
      textHeight;

    const totalWidth = isDuplicate
      ? imgWidth * 2 + borderSize * 3
      : imgWidth + borderSize * 2;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    const drawStrip = (offsetX = 0, removeLeftBorder = false) => {
      const adjustedOffsetX = removeLeftBorder ? offsetX - borderSize : offsetX;

      // Draw background
      ctx.fillStyle = stripColor === "film" ? "black" : stripColor;
      ctx.fillRect(
        adjustedOffsetX,
        0,
        imgWidth + borderSize * 2,
        canvas.height
      );

      // Draw film holes
      if (stripColor === "film") {
        ctx.fillStyle = "#fff";
        const holeWidth = 20;
        const holeHeight = 25;
        const borderRadius = 2;

        for (let i = 40; i < canvas.height - 40; i += 80) {
          // Left side
          ctx.beginPath();
          ctx.roundRect(
            adjustedOffsetX + 5,
            i,
            holeWidth,
            holeHeight,
            borderRadius
          );
          ctx.fill();

          // Right side
          ctx.beginPath();
          ctx.roundRect(
            adjustedOffsetX + imgWidth + borderSize * 2 - 26,
            i,
            holeWidth,
            holeHeight,
            borderRadius
          );
          ctx.fill();
        }
      }

      let imagesLoaded = 0;
      capturedImages.forEach((image, index) => {
        const img = document.createElement("img");
        img.src = image;
        img.onload = () => {
          if (!ctx) return;
          const yOffset = borderSize + (imgHeight + photoSpacing) * index;

          const imageRatio = img.width / img.height;
          const targetRatio = imgWidth / imgHeight;

          let sourceWidth = img.width;
          let sourceHeight = img.height;
          let sourceX = 0;
          let sourceY = 0;

          if (imageRatio > targetRatio) {
            sourceWidth = sourceHeight * targetRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            sourceHeight = sourceWidth / targetRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }

          // ✅ Apply rounded corners using roundRect + clip
          ctx.save(); // Save the current context state
          ctx.beginPath();
          ctx.roundRect(
            adjustedOffsetX + borderSize,
            yOffset,
            imgWidth,
            imgHeight,
            radius // ✅ Use the adjustable `radius`
          );
          ctx.clip(); // Clip the canvas to the rounded rectangle

          // Draw the image
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            adjustedOffsetX + borderSize,
            yOffset,
            imgWidth,
            imgHeight
          );

          ctx.restore(); // Restore the previous context state

          // Draw frame if selected
          if (
            frames[selectedFrame] &&
            typeof frames[selectedFrame].draw === "function"
          ) {
            frames[selectedFrame].draw(
              ctx,
              adjustedOffsetX + borderSize,
              yOffset,
              imgWidth,
              imgHeight
            );
          }

          // Draw stickers if selected
          if (selectedFrame && stickers[selectedFrame]) {
            drawStickers(ctx, totalWidth, totalHeight, selectedFrame);
          }

          imagesLoaded++;
          if (imagesLoaded === numShots) {
            const gap = 10;
            const centerY = totalHeight - textHeight + 50;

            // Dynamic color adjustment based on luminance
            ctx.fillStyle = getTextColor(stripColor);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (textInput && showDate) {
              const textPositionY = centerY - fontSize / 2 - gap / 2;
              const datePositionY = centerY + fontSize / 2 + gap / 2;

              ctx.font = `${isItalic ? "italic" : ""} ${
                isBold ? "bold" : ""
              } ${fontSize}px ${selectedFont}, sans-serif`;
              ctx.fillText(
                textInput,
                adjustedOffsetX + imgWidth / 2 + borderSize,
                textPositionY
              );

              ctx.font = "20px Courier New";
              const now = new Date();
              const timestamp = now.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "2-digit",
              });

              ctx.fillText(
                timestamp,
                adjustedOffsetX + imgWidth / 2 + borderSize,
                datePositionY
              );
            } else if (textInput) {
              ctx.font = `${isItalic ? "italic" : ""} ${
                isBold ? "bold" : ""
              } ${fontSize}px ${selectedFont}, sans-serif`;
              ctx.fillText(
                textInput,
                adjustedOffsetX + imgWidth / 2 + borderSize,
                centerY
              );
            } else if (showDate) {
              ctx.font = "20px Courier New";
              const now = new Date();
              const timestamp = now.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "2-digit",
              });

              ctx.fillText(
                timestamp,
                adjustedOffsetX + imgWidth / 2 + borderSize,
                centerY
              );
            }
          }
        };
      });
    };

    // Draw single or double strip without a gap
    drawStrip(0);
    if (isDuplicate) drawStrip(imgWidth + borderSize * 2, true);
  }, [
    capturedImages,
    isDuplicate,
    stripColor,
    radius,
    selectedFrame,
    textInput,
    showDate,
    fontSize,
    isItalic,
    isBold,
    selectedFont,
  ]);

  useEffect(() => {
    if (capturedImages && capturedImages.length === numShots) {
      setTimeout(() => {
        generatePhotoStrip();
      }, 100);
    }
  }, [capturedImages, numShots, stripColor, selectedFrame, generatePhotoStrip]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleColorChange = (e: { target: { value: any } }) => {
    const color = e.target.value;
    setCustomColor(color);
  };

  const getTextColor = (bgColor: string) => {
    if (bgColor.startsWith("#")) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);

      // Luminance formula
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      return luminance < 128 ? "#FFFFFF" : "#000000";
    }

    // Default for predefined colors
    if (bgColor === "black" || bgColor === "film") return "#FFFFFF";
    return "#000000";
  };

  const downloadPhotoStrip = () => {
    if (!stripCanvasRef.current) {
      console.error("Canvas is not available");
      return;
    }

    const link = document.createElement("a");
    link.download = "photostrip.png";
    link.href = stripCanvasRef.current.toDataURL("image/png");
    link.click();
  };

  const countCharacters = (text: string) => {
    if ("Segmenter" in Intl) {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      return [...segmenter.segment(text)].length;
    }
    // Fallback to Array.from if Segmenter is not supported
    return Array.from(text.normalize("NFC")).length;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (countCharacters(input) <= MAX_LENGTH) {
      setTextInput(input);
    }
  };

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    const newText = textInput + emojiObject.emoji;

    if (countCharacters(newText) <= MAX_LENGTH) {
      setTextInput(newText);
    }
  };

  const handleFontChange = (value: string) => {
    setSelectedFont(value);
  };

  const handleFontSizeChange = (value: string) => {
    setFontSize(Number(value));
  };

  const sendPhotoStripToEmail = async () => {
    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return false;

      if (email.includes("..") || email.endsWith(".") || email.startsWith("."))
        return false;
      if (email.includes("@@") || email.startsWith("@")) return false;

      if (email.length < 5 || email.length > 254) return false;

      const [localPart, domain] = email.split("@");
      if (!domain || domain.length < 3 || !domain.includes(".")) return false;
      if (localPart.length > 64) return false;

      const tld = domain.split(".").pop();
      if (!tld || tld.length < 2) return false;

      return true;
    };

    const commonMisspellings: Record<string, string> = {
      "gmail.co": "gmail.com",
      "gmail.cm": "gmail.com",
      "gmai.com": "gmail.com",
      "gmial.com": "gmail.com",
      "gamil.com": "gmail.com",
      "yahoo.co": "yahoo.com",
      "yahooo.com": "yahoo.com",
      "hotmail.co": "hotmail.com",
      "hotmial.com": "hotmail.com",
      "outloo.com": "outlook.com",
      "outlok.com": "outlook.com",
    };

    const checkForTypos = (
      email: string
    ): { hasTypo: boolean; suggestion: string } => {
      const [localPart, domain] = email.split("@");
      if (commonMisspellings[domain]) {
        return {
          hasTypo: true,
          suggestion: `${localPart}@${commonMisspellings[domain]}`,
        };
      }
      return { hasTypo: false, suggestion: email };
    };

    if (!email) {
      toast.error("Please enter an email address.", {
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }

    setSending(true);

    const typoCheck = checkForTypos(email);
    if (typoCheck.hasTypo) {
      if (confirm(`Did you mean ${typoCheck.suggestion}?`)) {
        setEmail(typoCheck.suggestion);
      }
    }

    if (!validateEmail(email)) {
      toast.error(
        "Please enter a valid email address. Example: name@example.com",
        {
          position: "bottom-right",
          duration: 3000,
        }
      );
      setSending(false);
      return;
    }

    const blockedDomains = [
      "mymail.lausd.net",
      "lausd.net",
      "domain@undefined",
      "undefined",
      "@undefined",
    ];

    const domain = email.split("@")[1];
    if (blockedDomains.includes(domain) || domain.includes("undefined")) {
      toast.error(
        "This email domain is not supported. Please use a different email address.",
        {
          position: "bottom-right",
          duration: 3000,
        }
      );
      setSending(false);
      return;
    }

    let loadingToastId: string | number | null = null;

    try {
      loadingToastId = toast.loading("Sending email...", {
        position: "bottom-right",
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!stripCanvasRef.current) {
        console.error("Canvas reference is null");
        if (loadingToastId) toast.dismiss(loadingToastId);
        setSending(false);
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/send-photo-strip`,
        {
          recipientEmail: email.trim(),
          imageData: stripCanvasRef.current.toDataURL("image/jpeg", 0.7),
        }
      );

      if (loadingToastId) toast.dismiss(loadingToastId);

      // Add a small delay to let the state update before showing the toast
      setTimeout(() => {
        if (response.data.success) {
          toast.success(
            "Your E-Booth photo strip is sent! Check your inbox or spam.",
            {
              position: "bottom-right",
              duration: 3000,
            }
          );
          setEmail("");
        } else {
          toast.error(
            `Failed to send: ${response.data.message || "Unknown error"}`,
            {
              position: "bottom-right",
              duration: 3000,
            }
          );
        }
      }, 100);

      setSending(false);
    } catch (error: any) {
      console.error("Network Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (loadingToastId) toast.dismiss(loadingToastId);

      setTimeout(() => {
        if (error.response?.status === 400) {
          toast.error(
            `Error: ${error.response.data.message || "Invalid email address"}`,
            { position: "bottom-right", duration: 3000 }
          );
        } else if (error.message.includes("Network Error")) {
          toast.error(
            "Network connection error. Please check your internet and try again.",
            {
              position: "bottom-right",
              duration: 3000,
            }
          );
        } else {
          toast.error(
            `Error: ${
              error.response?.data?.message ||
              "Failed to send. Please try again later."
            }`,
            { position: "bottom-right", duration: 3000 }
          );
        }
      }, 100);

      setSending(false);
    }
  };

  return (
    <div
      className={`relative antialiased flex justify-center items-center flex-col mx-auto sm:px-10 px-5 overflow-clip pb-20 ${
        sending ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <h2 className="py-5 text-xl sm:text-2xl md:text-4xl font-bold dark:text-primary-foreground text-primary ">
        Photo Strip Preview
      </h2>
      <div className="flex flex-col md:flex md:flex-row justify-center w-full mt-4 text-white gap-20">
        <div className="flex justify-center items-center ">
          {capturedImages?.length > 0 && (
            <canvas
              ref={stripCanvasRef}
              className="block max-w-64  -mt-2 mb-1 rounded-lg shadow-md border"
            />
          )}
        </div>

        <div className="my-3">
          <h3 className="text-lg text-black-100 dark:text-primary-foreground font-semibold">
            Customize your photo strip
          </h3>
          <p className="text-xs tracking-wider leading-3 text-black-100 dark:text-primary-foreground  mt-4">
            Frame Color
          </p>
          <div className="flex flex-wrap gap-3 my-6">
            {[
              { color: "white" },
              { color: "black" },
              { color: "#FFF2CC" }, // Yellow
              { color: "#f6d5da" }, // Pink
              { color: "#dde6d5" }, // Green
              { color: "#adc3e5" }, // Blue
              { color: "#dbcfff" }, // Purple
              { color: "film" }, // Film effect
            ].map(({ color }) => (
              <button
                key={color}
                onClick={() => setStripColor(color)}
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-white relative"
                style={{
                  background:
                    color === "film"
                      ? "linear-gradient(to right, black 10%, transparent 30%, transparent 70%, black 90%)"
                      : color,
                }}
              >
                {color === "film" && (
                  <div className="absolute inset-0 flex justify-between items-center px-[2px]">
                    {/* Left film perforations */}
                    <div className="flex flex-col gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-[3px] h-[4px] bg-white rounded-sm"
                        ></div>
                      ))}
                    </div>
                    {/* Right film perforations */}
                    <div className="flex flex-col gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-[3px] h-[4px] bg-white rounded-sm"
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}

            {/* Custom Color Wheel */}
            <div className="relative flex items-center">
              <label className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden cursor-pointer">
                {/* Color Wheel Background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                  }}
                />

                {/* Transparent Overlay */}
                <input
                  type="color"
                  value={customColor}
                  onChange={handleColorChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <p className="text-xs tracking-wider leading-3 text-black-100 dark:text-primary-foreground  mt-4">
            Stickers
          </p>
          <div className="flex flex-wrap gap-3 my-6">
            {buttonFrames.map((frame) => (
              <Button
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                className="p-2 bg-white hover:bg-primary w-10 h-10 rounded-full border border-gray-300 dark:border-none"
              >
                {frame.icon}
              </Button>
            ))}

            {/* Popover for extra stickers */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Button className="p-2 bg-white hover:bg-primary w-10 h-10 rounded-full border border-gray-300 dark:border-none">
                    🐼
                  </Button>
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 py-0.3 rounded-full">
                    New
                  </Badge>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-40 grid grid-cols-2 gap-2 p-2">
                {Object.keys(stickers).map((frame) => (
                  <Button
                    key={frame}
                    onClick={() => setSelectedFrame(frame)}
                    className="p-2 bg-white hover:bg-primary rounded-md border border-gray-300 dark:border-none"
                  >
                    <Image
                      src={stickers[frame][0].src}
                      alt={frame}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
          {/* {customize text} */}
          <p className="text-xs tracking-wider leading-3 text-black-100 dark:text-primary-foreground  mt-4">
            Custom Text
          </p>
          <div className="relative flex items-center w-full max-w-md mt-6 gap-2">
            {/* Input with emoji button inside */}
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Type something..."
                value={textInput}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md bg-white text-black "
              />
              <button
                onClick={() => setShowPicker((prev) => !prev)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <FaSmile size={20} />
              </button>
            </div>

            {/* Emoji Picker */}
            {showPicker && (
              <div ref={pickerRef} className="absolute right-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
          {/* Character Counter */}
          <div className="text-xs text-black-200 dark:text-white-100 mb-6 mt-1 pl-1">
            {countCharacters(textInput)}/{MAX_LENGTH}
          </div>
          <p className="text-xs tracking-wider leading-3 text-black-100 dark:text-primary-foreground  mb-4">
            Font Style
          </p>
          <div className="flex items-center gap-2 mb-6">
            <Select value={selectedFont} onValueChange={handleFontChange}>
              <SelectTrigger className="w-[180px] border border-gray-300 bg-white text-black dark:bg-accent dark:text-white">
                <SelectValue placeholder="Select Font" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-accent border border-gray-300 dark:border-gray-700">
                {fontOptions.map((font) => (
                  <SelectItem
                    key={font.value}
                    value={font.value}
                    className={`hover:bg-gray-100 dark:hover:bg-accent text-black dark:text-white ${font.className}`}
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(fontSize)}
              onValueChange={handleFontSizeChange}
            >
              <SelectTrigger className="w-[100px] border border-gray-300 bg-white text-black dark:bg-accent dark:text-white">
                <SelectValue placeholder="Font Size" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-accent border border-gray-300 dark:border-gray-700">
                {fontSizeOptions.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ToggleGroup
              variant="outline"
              type="multiple"
              value={
                [
                  isBold ? "bold" : undefined,
                  isItalic ? "italic" : undefined,
                ].filter(Boolean) as string[]
              }
              onValueChange={handleToggle}
              className="space-x-1"
            >
              <ToggleGroupItem
                value="bold"
                aria-label="Toggle bold"
                className="shadow border bg-white dark:bg-accent border-input data-[state=on]:!bg-primary data-[state=on]:!text-white"
              >
                <Bold className="h-4 w-4 text-black-100 dark:text-white" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="italic"
                aria-label="Toggle italic"
                className="shadow border bg-white dark:bg-accent border-input data-[state=on]:!bg-primary data-[state=on]:!text-white"
              >
                <Italic className="h-4 w-4 text-black-100 dark:text-white" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="w-64 my-6 relative">
            <div className="flex items-center mb-4">
              <p className="text-xs tracking-wider leading-3 text-black-100 dark:text-primary-foreground">
                Corner Radius: {radius}
              </p>
              <Badge className="ml-2 bg-red-500 text-white text-[8px] px-1 py-0.3 rounded-full">
                New
              </Badge>
            </div>
            <Slider
              value={[radius]}
              onValueChange={(val) => setRadius(val[0])}
              min={0}
              max={50}
              step={1}
            />
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <Checkbox
              id="showDate"
              checked={showDate}
              onCheckedChange={(checked) => setShowDate(!!checked)}
            />
            <label
              htmlFor="showDate"
              className="text-xs text-black-100 dark:text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Date
            </label>

            <Checkbox
              id="duplicateStrip"
              checked={isDuplicate}
              onCheckedChange={(checked) => setIsDuplicate(!!checked)}
            />
            <label
              htmlFor="duplicateStrip"
              className="text-xs text-black-100 dark:text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Duplicate Strip
            </label>
          </div>
          <div className="flex items-center gap-4 pb-6">
            <Button onClick={downloadPhotoStrip}>
              Download <FaArrowDown />
            </Button>

            {/* //update v1.2.1 */}
            <Button
              onClick={() => {
                router.push("/generatebooth");
              }}
            >
              Take New Photos <FaRepeat />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendPhotoStripToEmail();
              }}
              className="flex items-center gap-2 w-full"
            >
              <Input
                id="email-input"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-black-100 dark:bg-white dark:text-black-100 border border-black-100 rounded-md px-4 py-2"
                autoComplete="email"
              />
              <Button type="submit">Send to Email</Button>
            </form>
          </div>

          {/* <ToastContainer /> */}
        </div>
      </div>
    </div>
  );
};

export default EBoothPreview;
