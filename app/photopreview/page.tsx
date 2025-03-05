"use client";
import EBoothPreview from "@/components/EBoothPreview";
import { useCapturedImages } from "@/context/CapturedImagesContext";

const PhotoPreview = () => {
  const { capturedImages } = useCapturedImages();
  return (
    <div>
      <EBoothPreview capturedImages={capturedImages} />
    </div>
  );
};

export default PhotoPreview;
