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
import { fontOptions, fontSizeOptions, frames, stickers, filters } from "@/data";
import { Slider } from "./ui/slider";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Bold, Italic } from "lucide-react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { IoIosColorFilter } from "react-icons/io";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  FaAdjust,
  FaSlidersH,
  FaThermometerHalf,
  FaCompress,
} from "react-icons/fa";
import { CiBrightnessUp } from "react-icons/ci";
import { MdExposure } from "react-icons/md";
import { BsHighlights } from "react-icons/bs";
import { IoTriangleOutline } from "react-icons/io5";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  const [dateFirst, setDateFirst] = useState<boolean>(false);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [selectedFont, setSelectedFont] = useState<string>("Arial");
  const [fontSize, setFontSize] = useState<number>(20);
  const [radius, setRadius] = useState<number>(10);
  const [selectedStripDesign, setSelectedStripDesign] = useState<string>("none");
  const [isFilmEffect, setIsFilmEffect] = useState<boolean>(false);
  
  // Photo selection and filters
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [modifiedImages, setModifiedImages] = useState<string[]>([]);
  
  // Filters and adjustments per photo
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
  
  const [photoFilters, setPhotoFilters] = useState<Record<number, string>>({});
  const [photoAdjustments, setPhotoAdjustments] = useState<Record<number, Adjustments>>({});
  const [photoFilterValues, setPhotoFilterValues] = useState<Record<number, Record<string, number>>>({});
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(100);
  
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

  const handleToggle = (values: string[]) => {
    setIsBold(values.includes("bold"));
    setIsItalic(values.includes("italic"));
  };

  const MAX_LENGTH = 20;

  // Initialize modified images with captured images
  useEffect(() => {
    if (capturedImages.length > 0 && modifiedImages.length === 0) {
      setModifiedImages([...capturedImages]);
    }
  }, [capturedImages, modifiedImages.length]);

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
    selectedFrame: string,
    yOffset: number = 0
  ) => {
    const selectedStickers = stickers[selectedFrame];
    if (selectedStickers) {
      selectedStickers.forEach((sticker) => {
        const img = document.createElement("img");
        img.src = sticker.src;
        img.onload = () => {
          const x = typeof sticker.x === "function" ? sticker.x(totalWidth) : sticker.x;
          const y = typeof sticker.y === "function"
            ? sticker.y(totalHeight) + yOffset
            : sticker.y + yOffset;
          
          ctx.drawImage(
            img,
            x,
            y,
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

  const drawStripDesign = (
    ctx: CanvasRenderingContext2D,
    adjustedOffsetX: number,
    totalWidth: number,
    totalHeight: number,
    borderSize: number,
    stripDesign: string,
    redrawPhotosCallback?: () => void
  ) => {
    if (stripDesign === "none") {
      if (redrawPhotosCallback) redrawPhotosCallback();
      return;
    }

    const img = document.createElement("img");
    img.src = `/strip/${stripDesign}`;
    img.onload = () => {
      if (!ctx) return;
      
      // Use the image's natural dimensions
      const tileWidth = img.width;
      const tileHeight = img.height;
      
      // Calculate right edge position
      const stripRightEdge = adjustedOffsetX + totalWidth;
      const rightEdgeX = stripRightEdge - tileWidth;
      
      // Draw right side border - repeating vertically
      let currentY = 0;
      while (currentY < totalHeight) {
        ctx.drawImage(
          img,
          rightEdgeX,
          currentY,
          tileWidth,
          tileHeight
        );
        currentY += tileHeight;
      }
      
      // Draw left side border - flipped horizontally and repeating vertically
      ctx.save();
      // Flip horizontally around the left edge
      const stripLeftEdge = adjustedOffsetX + totalWidth - 330;
      const leftEdgeX = stripLeftEdge - tileWidth;
      ctx.translate(stripLeftEdge, 0);
      ctx.scale(-1, 1);
      ctx.translate(-leftEdgeX, 0);
      
      currentY = 0;
      while (currentY < totalHeight) {
        ctx.drawImage(
          img,
          leftEdgeX,
          currentY,
          tileWidth,
          tileHeight
        );
        currentY += tileHeight;
      }
      
      ctx.restore();
      
      // Redraw photos on top after strip design is drawn
      if (redrawPhotosCallback) {
        redrawPhotosCallback();
      }
    };
    img.onerror = (e: any) => {
      console.error(`Failed to load strip design ${stripDesign}:`, e);
      if (redrawPhotosCallback) redrawPhotosCallback();
    };
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
    
    // Calculate text area position offset - move to top if dateFirst is true (regardless of showDate)
    const dateOffset = dateFirst ? textHeight : 0;

    const totalWidth = isDuplicate
      ? imgWidth * 2 + borderSize * 3
      : imgWidth + borderSize * 2;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    const drawStrip = (offsetX = 0, removeLeftBorder = false) => {
      const adjustedOffsetX = removeLeftBorder ? offsetX - borderSize : offsetX;

      // Always draw background color first
      ctx.fillStyle = stripColor;
      ctx.fillRect(
        adjustedOffsetX,
        0,
        imgWidth + borderSize * 2,
        canvas.height
      );

      // Draw film holes if film effect is enabled
      if (isFilmEffect) {
        // Use white holes on black background, black holes on other colors
        const holeColor = stripColor === "black" ? "#fff" : "#000";
        ctx.fillStyle = holeColor;
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

      // Function to draw photos (will be called after strip design loads)
      const drawPhotos = () => {
        let imagesLoaded = 0;
        const imagesToDraw = modifiedImages.length > 0 ? modifiedImages : capturedImages;
        imagesToDraw.forEach((image, index) => {
          const img = document.createElement("img");
          img.src = image;
          img.onload = () => {
          if (!ctx) return;
          const yOffset = borderSize + dateOffset + (imgHeight + photoSpacing) * index;

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

          imagesLoaded++;
          if (imagesLoaded === numShots) {
            const gap = 10;
            // Calculate centerY based on text area position (works for both date and custom text)
            const centerY = dateFirst 
              ? borderSize + textHeight / 2
              : totalHeight - textHeight + 50;

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

            // Draw stickers in the text/date area only (not on photos)
            if (selectedFrame && stickers[selectedFrame]) {
              // Calculate y offset for stickers in text area
              // Stickers are defined to be at totalHeight - 120 (120px from bottom)
              // When dateFirst is false: keep them at bottom (offset = 0)
              // When dateFirst is true: move them to top text area with extra spacing
              const textAreaYOffset = dateFirst
                ? borderSize + 10 - (totalHeight - 110)  // Position higher up with 20px spacing from top border
                : 0;
              
              drawStickers(ctx, totalWidth, totalHeight, selectedFrame, textAreaYOffset);
            }
          }
        };
      });
      };
      
      // Draw strip design first, then photos on top
      if (selectedStripDesign !== "none") {
        drawStripDesign(
          ctx,
          adjustedOffsetX,
          imgWidth + borderSize * 2,
          canvas.height,
          borderSize,
          selectedStripDesign,
          drawPhotos // Redraw photos after strip design loads
        );
      } else {
        // If no strip design, draw photos immediately
        drawPhotos();
      }
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
    dateFirst,
    fontSize,
    isItalic,
    isBold,
    selectedFont,
    selectedStripDesign,
    isFilmEffect,
    modifiedImages,
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
    if (bgColor === "black") return "#FFFFFF";
    return "#000000";
  };

  // Apply filter to a specific photo
  const applyFilterToPhoto = async (photoIndex: number, filterString: string): Promise<string> => {
    if (photoIndex < 0 || photoIndex >= capturedImages.length) {
      return capturedImages[photoIndex] || "";
    }

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = capturedImages[photoIndex];

    return new Promise<string>((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(capturedImages[photoIndex]);
          return;
        }

        ctx.drawImage(img, 0, 0);

        if (filterString && filterString !== "none") {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const filterValues = parseFilterString(filterString);
          applyFiltersToImageData(imageData, filterValues);
          ctx.putImageData(imageData, 0, 0);
        }

        const modifiedImage = canvas.toDataURL("image/png");
        resolve(modifiedImage);
      };
      img.onerror = () => resolve(capturedImages[photoIndex]);
    });
  };

  // Parse filter string (from generatebooth)
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

    const brightnessMatch = filterString.match(/brightness\((\d+(\.\d+)?)%\)/);
    const contrastMatch = filterString.match(/contrast\((\d+(\.\d+)?)%\)/);
    const saturateMatch = filterString.match(/saturate\((\d+(\.\d+)?)%\)/);
    const grayscaleMatch = filterString.match(/grayscale\((\d+(\.\d+)?)%\)/);
    const sepiaMatch = filterString.match(/sepia\((\d+(\.\d+)?)%\)/);
    const hueRotateMatch = filterString.match(/hue-rotate\((-?\d+(\.\d+)?)deg\)/);
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

  // Apply filters to image data (from generatebooth)
  const applyFiltersToImageData = (
    imageData: ImageData,
    filters: FilterValues
  ): void => {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const brightnessRatio = filters.brightness / 100;
      r *= brightnessRatio;
      g *= brightnessRatio;
      b *= brightnessRatio;

      r = (r - 128) * (filters.contrast / 100) + 128;
      g = (g - 128) * (filters.contrast / 100) + 128;
      b = (b - 128) * (filters.contrast / 100) + 128;

      const saturationRatio = filters.saturate / 100;
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + saturationRatio * (r - gray);
      g = gray + saturationRatio * (g - gray);
      b = gray + saturationRatio * (b - gray);

      if (filters.grayscale > 0) {
        const grayIntensity = filters.grayscale / 100;
        const grayValue = 0.2989 * r + 0.587 * g + 0.114 * b;
        r = r * (1 - grayIntensity) + grayValue * grayIntensity;
        g = g * (1 - grayIntensity) + grayValue * grayIntensity;
        b = b * (1 - grayIntensity) + grayValue * grayIntensity;
      }

      if (filters.sepia > 0) {
        const sepiaIntensity = filters.sepia / 100;
        const sepiaR = r * 0.393 + g * 0.769 + b * 0.189;
        const sepiaG = r * 0.349 + g * 0.686 + b * 0.168;
        const sepiaB = r * 0.272 + g * 0.534 + b * 0.131;
        r = r * (1 - sepiaIntensity) + sepiaR * sepiaIntensity;
        g = g * (1 - sepiaIntensity) + sepiaG * sepiaIntensity;
        b = b * (1 - sepiaIntensity) + sepiaB * sepiaIntensity;
      }

      if (filters.hueRotate !== 0) {
        const hueRotate = filters.hueRotate % 360;
        const hsl = rgbToHsl(r, g, b);
        hsl[0] = (hsl[0] + hueRotate / 360) % 1;
        const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
      }

      if (filters.invert > 0) {
        const invertIntensity = filters.invert / 100;
        r = r * (1 - invertIntensity) + (255 - r) * invertIntensity;
        g = g * (1 - invertIntensity) + (255 - g) * invertIntensity;
        b = b * (1 - invertIntensity) + (255 - b) * invertIntensity;
      }

      data[i] = Math.max(0, Math.min(255, Math.round(r)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));

      if (filters.opacity < 100) {
        data[i + 3] = data[i + 3] * (filters.opacity / 100);
      }
    }
  };

  // RGB to HSL conversion
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

  // HSL to RGB conversion
  const hslToRgb = (
    h: number,
    s: number,
    l: number
  ): [number, number, number] => {
    let r = 0;
    let g = 0;
    let b = 0;

    if (s === 0) {
      r = g = b = l;
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

  // Handler for filter changes
  const handleFilterChange = async (filterName: string, sliderValue: number) => {
    if (selectedPhotoIndex === null) return;

    const filter = filters.find((f) => f.name === filterName);
    if (!filter) return;

    let filterString = filter.value;
    if (filter.slider) {
      // Apply slider value to filter
      const applyFilter = (filterType: string, value: number) => {
        switch (filterType) {
          case "fresh":
            return `brightness(${100 + value / 20}%) saturate(${100 + value / 10}%) contrast(${100 + value / 20}%)`;
          case "clear":
            return `contrast(${100 + value / 10}%) brightness(${100 + value / 20}%) saturate(${100 + value / 15}%)`;
          case "warm":
            return `sepia(${value / 10}%) brightness(${100 + value / 20}%) contrast(${100 + value / 20}%)`;
          case "film":
            return `contrast(${100 + value / 15}%) brightness(${100 - value / 30}%) saturate(${100 - value / 20}%)`;
          case "modernGold":
            return `sepia(${value / 10}%) brightness(${100 + value / 20}%) contrast(${100 + value / 15}%) hue-rotate(${value / 4}deg)`;
          case "bw":
            return `grayscale(${value}%) contrast(${100 + value / 10}%)`;
          case "contrast":
            return `contrast(${100 + value / 2}%)`;
          case "gray":
            return `grayscale(${value}%)`;
          case "cool":
            return `hue-rotate(${200 + value / 4}deg) brightness(${100 - value / 20}%) contrast(${100 + value / 20}%)`;
          case "vintage":
            return `sepia(${value / 10}%) contrast(${100 + value / 15}%) brightness(${100 + value / 20}%) saturate(${100 - value / 20}%)`;
          case "fade":
            return `grayscale(${value / 15}%) brightness(${100 + value / 20}%) contrast(${100 - value / 20}%)`;
          case "mist":
            return `brightness(${100 + value / 20}%) contrast(${100 - value / 20}%)`;
          case "food":
            return `saturate(${100 + value / 10}%) contrast(${100 + value / 15}%) brightness(${100 + value / 20}%)`;
          case "autumn":
            return `sepia(${value / 10}%) hue-rotate(${value / 4}deg) brightness(${100 + value / 20}%) contrast(${100 + value / 20}%)`;
          case "city":
            return `contrast(${100 + value / 10}%) brightness(${100 - value / 20}%) saturate(${100 + value / 15}%)`;
          case "country":
            return `sepia(${value / 10}%) brightness(${100 + value / 20}%) contrast(${100 + value / 20}%)`;
          case "sunset":
            return `hue-rotate(${value / 4}deg) brightness(${100 + value / 20}%) contrast(${100 + value / 15}%)`;
          case "voyage":
            return `hue-rotate(${220 + value / 4}deg) brightness(${100 - value / 20}%) contrast(${100 + value / 20}%)`;
          case "forest":
            return `hue-rotate(${130 + value / 4}deg) brightness(${97 - value / 20}%) contrast(${108 + value / 20}%)`;
          case "flamingo":
            return `hue-rotate(${330 + value / 4}deg) saturate(${100 + value / 10}%) brightness(${100 + value / 20}%)`;
          case "cyberpunk":
            return `hue-rotate(${300 + value / 4}deg) contrast(${100 + value / 10}%) brightness(${100 - value / 20}%) saturate(${100 + value / 10}%)`;
          default:
            return "none";
        }
      };
      filterString = applyFilter(filter.slider, sliderValue);
    }

    setPhotoFilters((prev) => ({ ...prev, [selectedPhotoIndex]: filterString }));
    setPhotoFilterValues((prev) => ({
      ...prev,
      [selectedPhotoIndex]: { ...prev[selectedPhotoIndex], [filter.slider || ""]: sliderValue },
    }));

    const modifiedImage = await applyFilterToPhoto(selectedPhotoIndex, filterString);
    if (modifiedImage) {
      const newModifiedImages = [...modifiedImages];
      newModifiedImages[selectedPhotoIndex] = modifiedImage;
      setModifiedImages(newModifiedImages);
    }
  };

  // Handler for adjustment changes
  const handleAdjustmentChange = async (key: keyof Adjustments, value: number) => {
    if (selectedPhotoIndex === null) return;

    const currentAdjustments = photoAdjustments[selectedPhotoIndex] || {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      highlights: 0,
      colorTemperature: 0,
      tone: 0,
      sharpness: 0,
    };

    const newAdjustments = { ...currentAdjustments, [key]: value };
    setPhotoAdjustments((prev) => ({ ...prev, [selectedPhotoIndex]: newAdjustments }));

    // Build filter string from adjustments
    const filterString = `
      brightness(${100 + newAdjustments.brightness}%)
      contrast(${100 + newAdjustments.contrast}%)
      saturate(${100 + newAdjustments.saturation}%)
      grayscale(${Math.abs(newAdjustments.exposure)}%)
      sepia(${Math.abs(newAdjustments.highlights)}%)
      hue-rotate(${newAdjustments.colorTemperature}deg)
      invert(${Math.abs(newAdjustments.tone)}%)
      opacity(${100 - Math.abs(newAdjustments.sharpness)}%)
    `;

    const modifiedImage = await applyFilterToPhoto(selectedPhotoIndex, filterString);
    if (modifiedImage) {
      const newModifiedImages = [...modifiedImages];
      newModifiedImages[selectedPhotoIndex] = modifiedImage;
      setModifiedImages(newModifiedImages);
    }
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

  const generateRandomDesign = () => {
    // Random colors (including predefined and custom)
    const predefinedColors = [
      "white",
      "black",
      "#FFF2CC", // Yellow
      "#f6d5da", // Pink
      "#dde6d5", // Green
      "#adc3e5", // Blue
      "#dbcfff", // Purple
    ];
    
    // Generate random hex color
    const randomHexColor = () => {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
      }
      return color;
    };

    // Randomly choose between predefined or custom color
    const useCustomColor = Math.random() > 0.5;
    if (useCustomColor) {
      const randomColor = randomHexColor();
      setCustomColor(randomColor);
      setStripColor(randomColor);
    } else {
      const randomPredefinedColor = predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
      setStripColor(randomPredefinedColor);
      if (randomPredefinedColor !== "white" && randomPredefinedColor !== "black") {
        setCustomColor(randomPredefinedColor);
      }
    }

    // Random film effect (separate from color)
    setIsFilmEffect(Math.random() > 0.5);

    // Random sticker/frame (combine buttonFrames and stickers keys)
    const allFrameOptions = [
      ...buttonFrames.map(f => f.id),
      ...Object.keys(stickers),
    ];
    const randomFrame = allFrameOptions[Math.floor(Math.random() * allFrameOptions.length)];
    setSelectedFrame(randomFrame);

    // Random text phrases
    const randomTexts = [
      "Memories ✨",
      "Best Day Ever!",
      "Smile 😊",
      "Love & Laugh",
      "Good Times",
      "Happy Moments",
      "Friends Forever",
      "Dream Big",
      "Live Laugh Love",
      "Stay Awesome",
      "You're Amazing!",
      "Pure Joy",
      "Magic ✨",
      "Adventure Awaits",
      "Keep Smiling",
      "Be Yourself",
      "Stay Positive",
      "Make Memories",
      "Enjoy Life",
      "Stay Cool 😎",
    ];
    const randomText = Math.random() > 0.3 ? randomTexts[Math.floor(Math.random() * randomTexts.length)] : "";
    setTextInput(randomText);

    // Random font
    const randomFont = fontOptions[Math.floor(Math.random() * fontOptions.length)];
    setSelectedFont(randomFont.value);

    // Random font size
    const randomFontSize = fontSizeOptions[Math.floor(Math.random() * fontSizeOptions.length)];
    setFontSize(Number(randomFontSize.value));

    // Random bold/italic
    setIsBold(Math.random() > 0.5);
    setIsItalic(Math.random() > 0.5);

    // Random corner radius (0-50)
    const randomRadius = Math.floor(Math.random() * 51);
    setRadius(randomRadius);

    // Random show date
    setShowDate(Math.random() > 0.5);

    // Random text area first
    setDateFirst(Math.random() > 0.5);

    // Random strip design
    const stripDesigns = ["none", "strip-1.png"];
    const randomStripDesign = stripDesigns[Math.floor(Math.random() * stripDesigns.length)];
    setSelectedStripDesign(randomStripDesign);

    toast.success("Random design generated!");
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
        <div className="flex flex-col justify-center items-center gap-4">
          {capturedImages?.length > 0 && (
            <canvas
              ref={stripCanvasRef}
              className="block max-w-64  -mt-2 mb-1 rounded-lg shadow-md border cursor-pointer"
              onClick={(e) => {
                const canvas = stripCanvasRef.current;
                if (!canvas) return;

                const rect = canvas.getBoundingClientRect();
                const y = e.clientY - rect.top;

                // Get canvas dimensions
                const canvasHeight = canvas.height;
                
                // Scale coordinates to match canvas internal dimensions
                const scaleY = canvasHeight / rect.height;
                const canvasY = y * scaleY;

                // Calculate photo dimensions (same as in generatePhotoStrip)
                const imgHeight = 300;
                const borderSize = 30;
                const photoSpacing = 20;
                const textHeight = 100;
                const dateOffset = dateFirst ? textHeight : 0;
                
                // Check if click is within photo area (not in text area)
                const textAreaStart = dateFirst ? 0 : canvasHeight - textHeight;
                const textAreaEnd = dateFirst ? textHeight : canvasHeight;
                
                // Skip if clicked in text area
                if (canvasY >= textAreaStart && canvasY <= textAreaEnd) {
                  return;
                }

                // Calculate photo index based on y position
                let photoIndex = -1;
                for (let i = 0; i < numShots; i++) {
                  const photoYStart = borderSize + dateOffset + (imgHeight + photoSpacing) * i;
                  const photoYEnd = photoYStart + imgHeight;
                  
                  if (canvasY >= photoYStart && canvasY <= photoYEnd) {
                    photoIndex = i;
                    break;
                  }
                }

                if (photoIndex >= 0 && photoIndex < numShots) {
                  setSelectedPhotoIndex(photoIndex);
                  const savedFilter = photoFilters[photoIndex] || "none";
                  const savedFilterValue = photoFilterValues[photoIndex]?.[Object.keys(photoFilterValues[photoIndex] || {})[0]] || 100;
                  setSelectedFilter(savedFilter === "none" ? null : savedFilter);
                  setSliderValue(savedFilterValue);
                }
              }}
            />
          )}
        </div>

        <div className="my-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-black-100 dark:text-primary-foreground font-semibold">
              Customize your photo strip
            </h3>
            <div className="relative inline-block">
              <Button
                onClick={generateRandomDesign}
                variant="default"
              >
                Random Design
              </Button>
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 py-0.3 rounded-full">
                New
              </Badge>
            </div>
          </div>
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
            ].map(({ color }) => (
              <button
                key={color}
                onClick={() => {
                  setStripColor(color);
                  // Deselect strip design when selecting a frame color
                  if (selectedStripDesign !== "none") {
                    setSelectedStripDesign("none");
                  }
                  // Film effect can stay active with any color
                }}
                className={`w-10 h-10 rounded-full border border-gray-300 dark:border-white relative ${
                  stripColor === color && !isFilmEffect
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                style={{
                  background: color,
                }}
              />
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
                  onChange={(e) => {
                    handleColorChange(e);
                    // Deselect strip design when selecting a custom color
                    if (selectedStripDesign !== "none") {
                      setSelectedStripDesign("none");
                    }
                    // Film effect can stay active with any color
                  }}
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

          <p className="text-xs tracking-wider leading-3 text-black-100 dark:text-primary-foreground  mt-4">
            Strip Design
          </p>
          <div className="flex flex-wrap gap-3 my-6">
            <button
              onClick={() => {
                setSelectedStripDesign("none");
                setIsFilmEffect(false); // Also disable film effect when selecting none
              }}
              className={`w-10 h-10 rounded-full border border-gray-300 dark:border-white flex items-center justify-center ${
                selectedStripDesign === "none" && !isFilmEffect
                  ? "bg-primary border-primary"
                  : "bg-white dark:bg-accent"
              }`}
              title="None"
            >
              <MdBlock size={20} className="text-black dark:text-white" />
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  setSelectedStripDesign("strip-1.png");
                  if (isFilmEffect) {
                    setIsFilmEffect(false); // Disable film effect when selecting strip design
                  }
                }}
                className={`w-10 h-10 rounded-full border border-gray-300 dark:border-white relative overflow-hidden ${
                  selectedStripDesign === "strip-1.png"
                    ? "border-primary ring-2 ring-primary"
                    : ""
                }`}
                title="Floral Border"
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: "url(/strip/strip-1-btn.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </button>
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 py-0.3 rounded-full">
                New
              </Badge>
            </div>
            <button
              onClick={() => {
                setIsFilmEffect(!isFilmEffect);
                // When enabling film effect, deselect strip design
                if (!isFilmEffect && selectedStripDesign !== "none") {
                  setSelectedStripDesign("none");
                }
              }}
              className={`w-10 h-10 rounded-full border border-gray-300 dark:border-white relative ${
                isFilmEffect
                  ? "border-primary ring-2 ring-primary"
                  : ""
              }`}
              style={{
                background: "linear-gradient(to right, black 10%, transparent 30%, transparent 70%, black 90%)",
              }}
              title="Film Effect"
            >
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
            </button>
          </div>

          {/* Photo Filters and Adjustments */}
          {selectedPhotoIndex !== null ? (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs tracking-wider leading-3 text-black-100 dark:text-primary-foreground">
                  Edit Photo {selectedPhotoIndex + 1}
                </p>
                <Badge className="bg-red-500 text-white text-[8px] px-1 py-0.3 rounded-full">
                  New
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Click on a photo in the strip to select and edit it
              </p>
              <Tabs defaultValue="adjust" className="w-96">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="adjust" className="flex items-center gap-2 text-xs">
                    <HiOutlineAdjustmentsHorizontal />
                    Adjust
                  </TabsTrigger>
                  <TabsTrigger value="filters" className="flex items-center gap-2 text-xs">
                    <IoIosColorFilter />
                    Filters
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="filters">
                  <div className="text-center my-5">
                    <ScrollArea className="w-96 rounded-md border">
                      <div className="w-max space-x-4 p-4">
                        {filters.map((item) => (
                          <Popover key={item.name}>
                            <PopoverTrigger asChild>
                              <Button
                                onClick={() => {
                                  const savedValue = photoFilterValues[selectedPhotoIndex]?.[item.slider || ""] ?? 100;
                                  setSelectedFilter(item.slider || null);
                                  setSliderValue(savedValue);
                                  handleFilterChange(item.name, savedValue);
                                }}
                                className={`min-w-[100px] ${
                                  selectedFilter === item.slider
                                    ? "bg-white text-black"
                                    : ""
                                }`}
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
                                  onValueChange={(val) => {
                                    setSliderValue(val[0]);
                                    handleFilterChange(item.name, val[0]);
                                  }}
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
                </TabsContent>
                <TabsContent value="adjust">
                  <div className="text-center my-2">
                    <ScrollArea className="w-96 rounded-md border">
                      <div className="flex w-max gap-8 px-4 pt-4">
                        {Object.entries(photoAdjustments[selectedPhotoIndex] || {
                          brightness: 0,
                          contrast: 0,
                          saturation: 0,
                          exposure: 0,
                          highlights: 0,
                          colorTemperature: 0,
                          tone: 0,
                          sharpness: 0,
                        }).map(([key, value]) => (
                          <Popover key={key}>
                            <PopoverTrigger asChild>
                              <button className="flex flex-col items-center gap-2">
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
                            <PopoverContent className="w-48">
                              <p className="text-sm font-medium flex justify-between">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                <span className="text-gray-500 text-xs">
                                  {value}
                                </span>
                              </p>
                              <Slider
                                value={[value]}
                                onValueChange={(val) => {
                                  handleAdjustmentChange(key as keyof Adjustments, val[0]);
                                }}
                                min={key === "sharpness" ? 0 : -100}
                                max={key === "sharpness" ? 100 : 100}
                                step={1}
                              />
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" className="mt-2" />
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs tracking-wider leading-3 text-black-100 dark:text-primary-foreground">
                  Edit Photo
                </p>
                <Badge className="bg-red-500 text-white text-[8px] px-1 py-0.3 rounded-full">
                  New
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Click on a photo in the strip to select and edit it
              </p>
            </div>
          )}

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
              id="dateFirst"
              checked={dateFirst}
              onCheckedChange={(checked) => setDateFirst(!!checked)}
            />
            <label
              htmlFor="dateFirst"
              className="text-xs text-black-100 dark:text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Text Area First
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
