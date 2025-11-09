const Footer = () => {
  const version = "1.4.0"; 

  return (
    <div className="w-full relative">
      <div className="flex md:flex-row flex-col justify-center items-center max-w-7xl mx-auto px-10 pb-6 gap-4">
        <p className="md:text-sm text-xs md:font-normal font-light tracking-wide">
          Copyright © 2025 Kyle Pantig | v{version}
        </p>
      </div>
    </div>
  );
};

export default Footer;
