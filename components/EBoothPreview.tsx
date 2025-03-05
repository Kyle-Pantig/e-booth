/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Input } from "./ui/input";
import { FaArrowDown, FaSmile } from "react-icons/fa";
import { useRouter } from "next/navigation";
// import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCapturedImages } from "@/context/CapturedImagesContext";
import { FaRepeat } from "react-icons/fa6";
import EmojiPicker from "emoji-picker-react";
import { MdBlock } from "react-icons/md";
import { toast } from "sonner";

type Frame = {
  draw: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => void;
};
const frames: Record<string, Frame> = {
  none: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    draw: (ctx, x, y, width, height) => {
      // Default frame logic (empty frame)
    },
  },
  glowingStar: {
    draw: (
      ctx: CanvasRenderingContext2D, // ✅ Correct type
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const drawGlowingStar = (
        centerX: number,
        centerY: number,
        size: number,
        color = "#FFFACD"
      ) => {
        // Outer Glow Effect
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          size * 0.1,
          centerX,
          centerY,
          size
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, "rgba(255, 215, 0, 0.8)");
        gradient.addColorStop(1, "rgba(255, 215, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Main Star Shape
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const point = i === 0 ? "moveTo" : "lineTo";
          (ctx as any)[point](
            centerX + size * Math.cos(angle),
            centerY + size * Math.sin(angle)
          );
        }
        ctx.closePath();
        ctx.fill();
      };

      // Draw glowing stars around the frame
      drawGlowingStar(x + 120, y + 1, 15);
      drawGlowingStar(x + 1, y + 70, 12);
      drawGlowingStar(x + width - 50, y + 80, 15);
      drawGlowingStar(x + width - 10, y + 250, 14);
      drawGlowingStar(x + 20, y + height - 55, 10);
      drawGlowingStar(x + width - 100, y + height - 20, 12);
    },
  },

  leaf: {
    draw: (
      ctx: CanvasRenderingContext2D, // ✅ Correct type
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const drawLeaf = (
        centerX: number,
        centerY: number,
        size: number,
        color = "#3CB371"
      ) => {
        ctx.fillStyle = color;

        // Leaf Shape
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.quadraticCurveTo(
          centerX - size * 0.5,
          centerY - size,
          centerX,
          centerY - size * 1.5
        );
        ctx.quadraticCurveTo(
          centerX + size * 0.5,
          centerY - size,
          centerX,
          centerY
        );
        ctx.fill();

        // Leaf Vein (Middle)
        ctx.strokeStyle = "#2E8B57";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - size * 1.5);
        ctx.stroke();

        // Side Veins
        for (let i = 1; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - (size * i) / 3);
          ctx.lineTo(centerX - size * 0.3, centerY - (size * i) / 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(centerX, centerY - (size * i) / 3);
          ctx.lineTo(centerX + size * 0.3, centerY - (size * i) / 2);
          ctx.stroke();
        }
      };

      // Draw leaves around the frame
      drawLeaf(x + 100, y + 20, 35, "#3CB371");
      drawLeaf(x + width - 1, y + 80, 28, "#3CB371");
      drawLeaf(x + width - 50, y + 250, 30, "#3CB371");
      drawLeaf(x + 10, y + height - 55, 35, "#3CB371");
    },
  },
  butterfly: {
    draw: (
      ctx: CanvasRenderingContext2D, // ✅ Correct type
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const drawButterfly = (
        centerX: number,
        centerY: number,
        size: number,
        color = "#7B68EE"
      ) => {
        ctx.fillStyle = color;

        // Left Wing (Upper)
        ctx.beginPath();
        ctx.ellipse(
          centerX - size * 0.4,
          centerY - size * 0.3,
          size * 0.5,
          size * 0.8,
          Math.PI / 4,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Left Wing (Lower)
        ctx.beginPath();
        ctx.ellipse(
          centerX - size * 0.45,
          centerY + size * 0.3,
          size * 0.4,
          size * 0.6,
          Math.PI / 4,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Right Wing (Upper)
        ctx.beginPath();
        ctx.ellipse(
          centerX + size * 0.4,
          centerY - size * 0.3,
          size * 0.5,
          size * 0.8,
          -Math.PI / 4,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Right Wing (Lower)
        ctx.beginPath();
        ctx.ellipse(
          centerX + size * 0.45,
          centerY + size * 0.3,
          size * 0.4,
          size * 0.6,
          -Math.PI / 4,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Body
        ctx.fillStyle = "#4B0082"; // Dark purple for contrast
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          size * 0.15,
          size * 0.7,
          0,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Antennae
        ctx.strokeStyle = "#4B0082";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.1, centerY - size * 0.6);
        ctx.quadraticCurveTo(
          centerX - size * 0.2,
          centerY - size,
          centerX - size * 0.05,
          centerY - size * 1.1
        );
        ctx.moveTo(centerX + size * 0.1, centerY - size * 0.6);
        ctx.quadraticCurveTo(
          centerX + size * 0.2,
          centerY - size,
          centerX + size * 0.05,
          centerY - size * 1.1
        );
        ctx.stroke();
      };

      // Draw butterflies around the frame
      drawButterfly(x + 150, y + 18, 12, "#7B68EE");
      drawButterfly(x + width - 1, y + 45, 18, "#7B68EE");
      drawButterfly(x + 0, y + height - 65, 15, "#7B68EE");
      drawButterfly(x + width - 120, y + height - 5, 18, "#7B68EE");
    },
  },
  flowers: {
    draw: (
      ctx: CanvasRenderingContext2D, // ✅ Correct type
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const drawFlowers = (x: number, y: number) => {
        ctx.fillStyle = "#FF9BE4";
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const angle = (i * 2 * Math.PI) / 5;
          ctx.ellipse(
            x + Math.cos(angle) * 10,
            y + Math.sin(angle) * 10,
            8,
            8,
            0,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
        ctx.fillStyle = "#FFE4E1";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
      };

      // Draw decorations around the frame
      drawFlowers(x + 70, y + 40);
      drawFlowers(x + width - 1, y + 45);
      drawFlowers(x + width - 1, y + 300);
      drawFlowers(x + 0, y + height - 65);
      drawFlowers(x + 130, y + height + 10);
    },
  },
  bow: {
    draw: (
      ctx: CanvasRenderingContext2D, // ✅ Correct type
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const drawBow = (x: number, y: number) => {
        ctx.fillStyle = "#f9cee7";
        ctx.beginPath();
        ctx.ellipse(x - 10, y, 10, 6, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 10, y, 10, 6, -Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#e68bbe";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      };

      // Draw decorations around the frame
      drawBow(x + 70, y + 40);
      drawBow(x + width - 1, y + 45);
      drawBow(x + width - 1, y + 300);
      drawBow(x + 0, y + height - 65);
      drawBow(x + 130, y + height + 10);
    },
  },
  stars: {
    draw: (
      ctx: CanvasRenderingContext2D, // ✅ Correct type
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const drawStar = (
        centerX: number,
        centerY: number,
        size: number,
        color = "#9370DB"
      ) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const point = i === 0 ? "moveTo" : "lineTo";
          (ctx as any)[point](
            centerX + size * Math.cos(angle),
            centerY + size * Math.sin(angle)
          );
        }
        ctx.closePath();
        ctx.fill();
      };

      // Draw decorations around the frame
      drawStar(x + 150, y + 18, 25, "#9370DB");
      drawStar(x + 20, y + 100, 10, "#9370DB");
      drawStar(x + width - 1, y + 45, 12, "#9370DB");
      drawStar(x + width - 1, y + 300, 12, "#9370DB");
      drawStar(x + 0, y + height - 65, 15, "#9370DB");
      drawStar(x + width - 120, y + height - 5, 12, "#9370DB");
    },
  },
  clouds: {
    draw: (
      ctx: CanvasRenderingContext2D, // ✅ Correct type
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const drawCloud = (centerX: number, centerY: number) => {
        ctx.fillStyle = "#87CEEB";
        const cloudParts = [
          { x: 0, y: 0, r: 14 },
          { x: -6, y: 2, r: 10 },
          { x: 6, y: 2, r: 10 },
        ];
        cloudParts.forEach((part) => {
          ctx.beginPath();
          ctx.arc(centerX + part.x, centerY + part.y, part.r, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      // Draw decorations around the frame
      drawCloud(x + 150, y + 18);
      drawCloud(x + width - 1, y + 45);
      drawCloud(x + width - 1, y + 300);
      drawCloud(x + 0, y + height - 65);
    },
  },
  hearts: {
    draw: (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const drawHeart = (x: number, y: number) => {
        ctx.fillStyle = "#cc8084";
        ctx.beginPath();
        const heartSize = 22;
        ctx.moveTo(x, y + heartSize / 4);
        ctx.bezierCurveTo(
          x,
          y,
          x - heartSize / 2,
          y,
          x - heartSize / 2,
          y + heartSize / 4
        );
        ctx.bezierCurveTo(
          x - heartSize / 2,
          y + heartSize / 2,
          x,
          y + heartSize * 0.75,
          x,
          y + heartSize
        );
        ctx.bezierCurveTo(
          x,
          y + heartSize * 0.75,
          x + heartSize / 2,
          y + heartSize / 2,
          x + heartSize / 2,
          y + heartSize / 4
        );
        ctx.bezierCurveTo(x + heartSize / 2, y, x, y, x, y + heartSize / 4);
        ctx.fill();
      };

      // Hearts positioned to match the "cute" frame
      drawHeart(x + 150, y + 18); // Top middle
      drawHeart(x + 20, y + 5); // Top left
      drawHeart(x + width - 1, y + 45); // Top right
      drawHeart(x + width - 80, y + 5); // Near top-right

      drawHeart(x + 150, y + height - 5); // Bottom middle
      drawHeart(x + 0, y + height - 65); // Bottom left
      drawHeart(x + width - 5, y + height - 85); // Bottom right
      drawHeart(x + width - 120, y + height - 5); // Near bottom-right
    },
  },
};

interface PhotoPreviewProps {
  capturedImages: string[];
}

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStripColor(customColor);
    }, 100);

    return () => clearTimeout(timeout);
  }, [customColor]);

  const generatePhotoStrip = useCallback(() => {
    const canvas = stripCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgWidth = 400;
    const imgHeight = 300;
    const borderSize = 40;
    const photoSpacing = 20;
    const textHeight = 70;

    const numShots = capturedImages.length;
    const totalHeight =
      imgHeight * numShots +
      photoSpacing * (numShots - 1) +
      borderSize * 2 +
      textHeight;

    canvas.width = imgWidth + borderSize * 2;
    canvas.height = totalHeight;

    if (stripColor === "film") {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 40, canvas.height);
      ctx.fillRect(canvas.width - 40, 0, 40, canvas.height);

      ctx.fillStyle = "#fff";
      const holeWidth = 30;
      const holeHeight = 25;
      const borderRadius = 5;

      for (let i = 40; i < canvas.height - 40; i += 80) {
        ctx.beginPath();
        ctx.roundRect(10, i, holeWidth, holeHeight, borderRadius);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(
          canvas.width - 35,
          i,
          holeWidth,
          holeHeight,
          borderRadius
        );
        ctx.fill();
      }
    } else {
      ctx.fillStyle = stripColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let imagesLoaded = 0;
    capturedImages.forEach((image, index) => {
      const img = new Image();
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

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          borderSize,
          yOffset,
          imgWidth,
          imgHeight
        );

        if (
          frames[selectedFrame] &&
          typeof frames[selectedFrame].draw === "function"
        ) {
          frames[selectedFrame].draw(
            ctx,
            borderSize,
            yOffset,
            imgWidth,
            imgHeight
          );
        }

        imagesLoaded++;
        if (imagesLoaded === numShots) {
          const now = new Date();
          const timestamp = now.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          });

          ctx.fillStyle =
            stripColor === "black" || stripColor === "film"
              ? "#FFFFFF"
              : "#000000";
          ctx.font = "16px Arial";
          ctx.textAlign = "center";
          ctx.letterSpacing = "2px";

          ctx.fillText(timestamp, canvas.width / 2, totalHeight - borderSize);

          if (textInput) {
            ctx.fillStyle =
              stripColor === "black" || stripColor === "film"
                ? "#FFFFFF"
                : "#000000";
            ctx.font = "italic bold 20px Arial";
            ctx.textAlign = "center";
            ctx.letterSpacing = "2px";
            ctx.fillText(
              textInput,
              canvas.width / 2,
              totalHeight - borderSize - 30
            );
          }
        }
      };
    });
  }, [capturedImages, stripColor, selectedFrame, textInput]);

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

  const handleEmojiClick = (emojiObject: { emoji: any }) => {
    setTextInput((prev: any) => prev + emojiObject.emoji);
    setShowPicker(false);
  };

  const sendPhotoStripToEmail = async () => {
    // Clear previous status
    // setStatus("");

    // Comprehensive email validation
    const validateEmail = (email: string) => {
      // Basic format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return false;

      // Common typos and issues
      if (email.includes("..") || email.endsWith(".") || email.startsWith("."))
        return false;
      if (email.includes("@@") || email.startsWith("@")) return false;

      // Length checks
      if (email.length < 5 || email.length > 254) return false;

      // Domain part checks
      const [localPart, domain] = email.split("@");
      if (!domain || domain.length < 3) return false;
      if (!domain.includes(".")) return false;

      // Local part length check
      if (localPart.length > 64) return false;

      // TLD validation (must be at least 2 characters)
      const tld = domain.split(".").pop();
      if (!tld || tld.length < 2) return false;

      return true;
    };

    // List of commonly mistyped domains and their corrections
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

    // Check and suggest corrections for common email misspellings
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
      return { hasTypo: false, suggestion: email }; // Ensure suggestion always returns a string
    };

    if (!email) {
      // setStatus("");
      toast.error("Please enter an email address.", {
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }

    setSending(true);

    // Check for common typos
    const typoCheck = checkForTypos(email);
    if (typoCheck.hasTypo) {
      if (confirm(`Did you mean ${typoCheck.suggestion}?`)) {
        setEmail(typoCheck.suggestion);
        // Continue with the corrected email
      } else {
        // User declined correction, continue with validation
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
      return;
    }

    // Blocked domains validation
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
      return;
    }

    try {
      const loadingToastId = toast.loading("Sending email...", {
        position: "bottom-right",
      });

      // Small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!stripCanvasRef.current) {
        console.error("Canvas reference is null");
        toast.dismiss(loadingToastId); // Dismiss loading toast
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/send-photo-strip`,
        {
          recipientEmail: email.trim(),
          imageData: stripCanvasRef.current.toDataURL("image/jpeg", 0.7),
        }
      );
      toast.dismiss(loadingToastId); // Dismiss loading toast after request
      setSending(false);

      if (response.data.success) {
        toast.success(
          "Your E-Booth photo strip is sent! Check your inbox or spam.",
          {
            position: "bottom-right",
            duration: 3000,
          }
        );
        setEmail(""); // Reset input field after success
      } else {
        toast.error(
          `Failed to send: ${response.data.message || "Unknown error"}`,
          {
            position: "bottom-right",
            duration: 3000,
          }
        );
      }
    } catch (error: any) {
      console.error("Network Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      toast.dismiss(); // Ensure any loading toast is closed
      setSending(false);

      if (error.response?.status === 400) {
        toast.error(
          `Error: ${error.response.data.message || "Invalid email address"}`,
          {
            position: "bottom-right",
            duration: 3000,
          }
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
          {
            position: "bottom-right",
            duration: 3000,
          }
        );
      }
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
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <p className="text-xs tracking-wider leading-3 text-black-100 dark:text-primary-foreground  mt-4">
            Stickers
          </p>
          <div className="flex flex-wrap gap-3 my-6">
            <Button
              onClick={() => setSelectedFrame("none")}
              className="p-2 bg-white hover:bg-primary group w-10 h-10 rounded-full border border-gray-300 dark:border-none"
            >
              <MdBlock
                size={24}
                className="text-black group-hover:text-white"
              />
            </Button>

            <Button
              onClick={() => setSelectedFrame("flowers")}
              className="p-2 bg-white hover:bg-primary w-10 h-10 rounded-full border border-gray-300 dark:border-none"
            >
              🌸
            </Button>
            <Button
              onClick={() => setSelectedFrame("stars")}
              className="p-2 bg-white hover:bg-primary w-10 h-10 rounded-full border border-gray-300 dark:border-none"
            >
              ⭐
            </Button>
            <Button
              onClick={() => setSelectedFrame("hearts")}
              className="p-2 bg-white hover:bg-primary w-10 h-10 rounded-full border border-gray-300 dark:border-none"
            >
              ❤️
            </Button>
            <Button
              onClick={() => setSelectedFrame("clouds")}
              className="p-2 bg-white hover:bg-primary w-10 h-10 rounded-full border border-gray-300 dark:border-none"
            >
              ☁️
            </Button>
            <Button
              onClick={() => setSelectedFrame("bow")}
              className="p-2 bg-white hover:bg-primary w-10 h-10 rounded-full border border-gray-300 dark:border-none"
            >
              🎀
            </Button>
            <Button
              onClick={() => setSelectedFrame("butterfly")}
              className="p-2 bg-white hover:bg-primary w-10 h-10 rounded-full border border-gray-300 dark:border-none"
            >
              🦋
            </Button>
            <Button
              onClick={() => setSelectedFrame("leaf")}
              className="p-2 bg-white hover:bg-primary w-10 h-10 rounded-full border border-gray-300 dark:border-none"
            >
              🍃
            </Button>
            <Button
              onClick={() => setSelectedFrame("glowingStar")}
              className="p-2 bg-white hover:bg-primary w-10 h-10 rounded-full border border-gray-300 dark:border-none"
            >
              ✨
            </Button>
          </div>
          {/* {customize text} */}
          <p className="text-xs tracking-wider leading-3 text-black-100 dark:text-primary-foreground  mt-4">
            Custom Text
          </p>
          <div className="relative flex items-center w-full max-w-md my-6">
            {/* Input with emoji button inside */}
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Type something..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full px-4 py-2  rounded-md bg-white text-black"
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
          <div className="flex items-center gap-4 pb-6">
            <Button onClick={downloadPhotoStrip}>
              Download <FaArrowDown />
            </Button>
            <Button
              onClick={() => {
                router.push("/generatebooth"); // Navigate first
                // setTimeout(() => {
                //   window.location.reload(); // Reload after a short delay
                // }, 500);
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
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-black-100 dark:bg-white dark:text-black-100 border border-black-100 rounded-md px-4 py-2"
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
