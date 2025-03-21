"use client";

import { useCamera } from "@/context/CameraContext";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  const { stopCamera } = useCamera();

  return (
    <header className="flex justify-center items-center px-4 md:px-8 py-3 z-50">
      <Link href="/" className="flex items-center gap-1" onClick={stopCamera}>
        <Image
          src="/logo.png"
          alt="Logo"
          width={64}
          height={64}
          className="w-12 h-12 md:w-16 md:h-16"
        />
        <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
          E-Booth
        </h1>
      </Link>
    </header>
  );
};

export default Header;
