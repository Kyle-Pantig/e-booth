type Sticker = {
  id: string;
  src: string;
  x: number | ((totalWidth: number) => number);
  y: number | ((totalHeight: number) => number);
  width: number;
  height: number;
};

export const stickers: Record<string, Sticker[]> = {
  panda: [
    {
      id: "panda",
      src: "/stickers/panda.png",
      x: 20,
      y: (totalHeight: number) => totalHeight - 120,
      width: 100,
      height: 100,
    },
  ],
  "panda-1": [
    {
      id: "panda-1",
      src: "/stickers/panda-1.png",
      x: (totalWidth: number) => totalWidth - 120,
      y: (totalHeight: number) => totalHeight - 120,
      width: 100,
      height: 100,
    },
    {
      id: "panda-2",
      src: "/stickers/panda.png",
      x: 20,
      y: (totalHeight: number) => totalHeight - 120,
      width: 100,
      height: 100,
    },
  ],
  "panda-2": [
    {
      id: "panda-2",
      src: "/stickers/panda-2.png",
      x: 20,
      y: (totalHeight: number) => totalHeight - 120,
      width: 120,
      height: 120,
    },
  ],
  "panda-3": [
    {
      id: "panda-3",
      src: "/stickers/panda-3.png",
      x: 20,
      y: (totalHeight: number) => totalHeight - 120,
      width: 110,
      height: 110,
    },
  ],
  cat: [
    {
      id: "cat",
      src: "/stickers/cat.png",
      x: 20,
      y: (totalHeight: number) => totalHeight - 120,
      width: 110,
      height: 110,
    },
    {
      id: "cat",
      src: "/stickers/cat.png",
      x: (totalWidth: number) => totalWidth - 120,
      y: (totalHeight: number) => totalHeight - 120,
      width: 110,
      height: 110,
    },
  ],
  "cat-1": [
    {
      id: "cat-1",
      src: "/stickers/cat-1.png",
      x: (totalWidth: number) => totalWidth - 120,
      y: (totalHeight: number) => totalHeight - 120,
      width: 110,
      height: 110,
    },
    {
      id: "cat-2",
      src: "/stickers/cat-2.png",
      x: 20,
      y: (totalHeight: number) => totalHeight - 120,
      width: 110,
      height: 110,
    },
  ],
  corgi: [
    {
      id: "corgi",
      src: "/stickers/corgi.png",
      x: (totalWidth: number) => totalWidth - 120,
      y: (totalHeight: number) => totalHeight - 120,
      width: 110,
      height: 110,
    },
  ],
  "corgi-1": [
    {
      id: "corgi-1",
      src: "/stickers/corgi-1.png",
      x: 20,
      y: (totalHeight: number) => totalHeight - 120,
      width: 110,
      height: 110,
    },
  ],
  "corgi-2": [
    {
      id: "corgi-2",
      src: "/stickers/corgi-2.png",
      x: 30,
      y: (totalHeight: number) => totalHeight - 120,
      width: 120,
      height: 120,
    },
  ],
  "teddy-bear": [
    {
      id: "teddy-bear",
      src: "/stickers/teddy-bear.png",
      x: 30,
      y: (totalHeight: number) => totalHeight - 120,
      width: 120,
      height: 120,
    },
  ],
};

type Frame = {
  draw: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => void;
};

export const frames: Record<string, Frame> = {
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
          ctx[point](
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
          ctx[point](
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

export const fontOptions = [
  // Standard Fonts
  { value: "Arial", label: "Arial", className: "font-arial" },
  { value: "Courier New", label: "Courier New", className: "font-courier" },
  { value: "Verdana", label: "Verdana", className: "font-verdana" },
  {
    value: "Times New Roman",
    label: "Times New Roman",
    className: "font-times",
  },

  // Calligraphy and Handwriting Fonts
  {
    value: "Brush Script MT",
    label: "Brush Script MT (Calligraphy)",
    className: "font-brush",
  },
  {
    value: "Pacifico",
    label: "Pacifico (Handwriting)",
    className: "font-pacifico",
  },

  // Decorative and Cursive Fonts
  {
    value: "Lobster",
    label: "Lobster (Decorative)",
    className: "font-lobster",
  },
  {
    value: "Dancing Script",
    label: "Dancing Script (Cursive)",
    className: "font-dancing",
  },

  // Classic Fonts
  { value: "Georgia", label: "Georgia (Serif)", className: "font-georgia" },
  {
    value: "Comic Sans MS",
    label: "Comic Sans MS (Casual)",
    className: "font-comic",
  },
  { value: "Impact", label: "Impact (Bold)", className: "font-impact" },
];

export const fontSizeOptions = [
  { value: "12", label: "12px" },
  { value: "14", label: "14px" },
  { value: "16", label: "16px" },
  { value: "18", label: "18px" },
  { value: "20", label: "20px" },
  { value: "24", label: "24px" },
  { value: "28", label: "28px" },
  { value: "32", label: "32px" },
];


export const filters = [
  { name: "No Filter", value: "none" },
  {
    name: "Fresh",
    value: "brightness(110%) saturate(115%) contrast(105%)",
    slider: "fresh",
  },
  {
    name: "Clear",
    value: "contrast(125%) brightness(108%) saturate(105%)",
    slider: "clear",
  },
  {
    name: "Warm",
    value: "sepia(20%) brightness(108%) contrast(110%)",
    slider: "warm",
  },
  {
    name: "Film",
    value: "contrast(105%) brightness(98%) saturate(92%)",
    slider: "film",
  },
  {
    name: "Modern Gold",
    value: "sepia(42%) brightness(108%) contrast(115%) hue-rotate(25deg)",
    slider: "modernGold",
  },
  { name: "B&W", value: "grayscale(100%) contrast(125%)", slider: "bw" },
  { name: "Contrast", value: "contrast(155%)", slider: "contrast" },
  { name: "Gray", value: "grayscale(100%)", slider: "gray" },
  {
    name: "Cool",
    value: "hue-rotate(220deg) brightness(98%) contrast(108%)",
    slider: "cool",
  },
  {
    name: "Vintage",
    value: "sepia(40%) contrast(115%) brightness(102%) saturate(88%)",
    slider: "vintage",
  },
  {
    name: "Fade",
    value: "grayscale(30%) brightness(105%) contrast(92%)",
    slider: "fade",
  },
  {
    name: "Mist",
    value: "brightness(103%) contrast(97%) blur(0.5px)",
    slider: "mist",
  },
  {
    name: "Food",
    value: "saturate(135%) contrast(112%) brightness(105%)",
    slider: "food",
  },
  {
    name: "Autumn",
    value: "sepia(35%) hue-rotate(25deg) brightness(108%) contrast(112%)",
    slider: "autumn",
  },
  {
    name: "City",
    value: "contrast(120%) brightness(98%) saturate(108%)",
    slider: "city",
  },
  {
    name: "Country",
    value: "sepia(25%) brightness(106%) contrast(110%)",
    slider: "country",
  },
  {
    name: "Sunset",
    value: "hue-rotate(20deg) brightness(108%) contrast(115%)",
    slider: "sunset",
  },
  {
    name: "Voyage",
    value: "hue-rotate(215deg) brightness(97%) contrast(110%)",
    slider: "voyage",
  },
  {
    name: "Forest",
    value: "hue-rotate(130deg) brightness(97%) contrast(108%)",
    slider: "forest",
  },
  {
    name: "Flamingo",
    value: "hue-rotate(340deg) saturate(140%) brightness(108%)",
    slider: "flamingo",
  },
  {
    name: "Cyberpunk",
    value: "hue-rotate(310deg) contrast(135%) brightness(95%) saturate(140%)",
    slider: "cyberpunk",
  },
];


