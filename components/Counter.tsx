"use client";
import { FaEye, FaUsers } from "react-icons/fa";
import { AnimatedCircularProgressBar } from "./magicui/animated-circular-progress-bar";
import { useCapturedImages } from "@/context/CapturedImagesContext";

const Counter: React.FC = () => {
  const { pageviews, visits } = useCapturedImages();

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
        {/* Pageviews Counter */}
        <div className="flex items-center justify-center gap-6 w-full p-4 bg-white/30 backdrop-blur-md border border-gray-300 dark:bg-black/30 dark:border-gray-700 rounded-2xl shadow-md transition-all">
          <AnimatedCircularProgressBar
            max={100}
            min={0}
            value={pageviews}
            text="Page views"
            icon={<FaEye className="text-black-100 dark:text-white text-3xl" />}
            gaugePrimaryColor="rgb(239 68 68)" // Red-500 from Tailwind (ShadCN red)
            gaugeSecondaryColor="rgba(239, 68, 68, 0.2)" // Light faded red
            className="text-3xl font-semibold text-black dark:text-white"
          />
        </div>

        {/* Visits Counter */}
        <div className="flex items-center justify-center gap-6 w-full p-4 bg-white/30 backdrop-blur-md border border-gray-300 dark:bg-black/30 dark:border-gray-700 rounded-2xl shadow-md transition-all">
          <AnimatedCircularProgressBar
            max={100}
            min={0}
            value={visits}
            text="Site Visits"
            icon={
              <FaUsers className="text-black-100 dark:text-white text-3xl" />
            }
            gaugePrimaryColor="rgb(239 68 68)" // Red-500 from Tailwind (ShadCN red)
            gaugeSecondaryColor="rgba(239, 68, 68, 0.2)" // Light faded red
            className="text-3xl font-semibold text-black dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default Counter;
