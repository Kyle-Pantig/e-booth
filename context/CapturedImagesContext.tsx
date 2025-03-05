"use client";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

interface CapturedImagesContextType {
  capturedImages: string[];
  setCapturedImages: (images: string[]) => void;
  numShots: number;
  setNumShots: (shots: number) => void;
  pageviews: number;
  visits: number;
}

const CapturedImagesContext = createContext<CapturedImagesContextType | undefined>(undefined);

export const CapturedImagesProvider = ({ children }: { children: ReactNode }) => {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [numShots, setNumShots] = useState<number>(4); // Default to 4 shots

  // Page views & visits state
  const [pageviews, setPageviews] = useState<number>(0);
  const [visits, setVisits] = useState<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    const updateCounter = async (type: string) => {
      try {
        const response = await axios.post("/api/counter", { type }, {
          headers: { "Content-Type": "application/json" },
        });

        setPageviews(response.data.pageviews);
        setVisits(response.data.visits);
      } catch (error) {
        console.error("Error updating counter:", error);
      }
    };

    if (!sessionStorage.getItem("visit")) {
      updateCounter("visit-pageview"); // Count as visit & pageview
      sessionStorage.setItem("visit", "true");
    } else {
      updateCounter("pageview"); // Count only as pageview
    }
  }, [pathname]); // Update count on every page change

  return (
    <CapturedImagesContext.Provider
      value={{
        capturedImages,
        setCapturedImages,
        numShots,
        setNumShots,
        pageviews,
        visits,
      }}
    >
      {children}
    </CapturedImagesContext.Provider>
  );
};

export const useCapturedImages = () => {
  const context = useContext(CapturedImagesContext);
  if (!context) {
    throw new Error("useCapturedImages must be used within a CapturedImagesProvider");
  }
  return context;
};
