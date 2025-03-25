import React from "react";

type AdsenseTypes = {
  pId: string;
};

const AdSense = ({ pId }: AdsenseTypes) => {
  return (
    <script
      async
      crossOrigin="anonymous"
      dangerouslySetInnerHTML={{
        __html: `
          (adsbygoogle = window.adsbygoogle || []).push({});
        `,
      }}
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
    />
  );
};

export default AdSense;
