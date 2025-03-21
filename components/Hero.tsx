"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
// import { Spotlight } from "./ui/spotlight-new";
import Counter from "./Counter";

const Hero = () => {
  const router = useRouter();

  const handleStartClick = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        router.push("/generatebooth");
      })
      .catch(() => {
        alert("Camera access denied. Please allow access to continue.");
      });
  };
  return (
    <div className="w-full flex md:items-center md:justify-center  relative overflow-hidden">
      {/* <Spotlight /> */}
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-12 text-center flex flex-col justify-center items-center">
        <h1 className="txt-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-neutral-50 dark:to-neutral-400 bg-opacity-50">
          Capture moments, create memories with <br />{" "}
          <span className="text-primary">E-Booth.</span>
        </h1>
        <p className="mt-4 font-normal text-base text-neutral-700 dark:text-neutral-300 max-w-lg text-center mx-auto">
          Your online photo booth — customize, filter, and make every shot
          unique!
        </p>
        <Button
          onClick={handleStartClick}
          className="my-10 py-5 px-10 text-white"
        >
          Get Started
        </Button>
        <Counter />
      </div>
    </div>
  );
};

export default Hero;
