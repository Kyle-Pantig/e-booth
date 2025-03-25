/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef } from "react";

type AdBannerType = {
  dataAdSlot: string;
  dataAdFormat: string;
  dataFullWidthResponsive: boolean;
};

const AdBanner = ({
  dataAdSlot,
  dataAdFormat,
  dataFullWidthResponsive,
}: AdBannerType) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && (window as any).adsbygoogle) {
      try {
        // Avoid calling push more than once
        if (!adRef.current.getAttribute("data-ad-loaded")) {
          (window as any).adsbygoogle.push({});
          adRef.current.setAttribute("data-ad-loaded", "true");
        }
      } catch (error: any) {
        console.error("AdSense error:", error.message);
      }
    }
  }, []);

  return (
    <div
      ref={adRef}
      style={{ width: "100%", minWidth: "300px", minHeight: "100px" }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={`${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}`}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
};

export default AdBanner;
