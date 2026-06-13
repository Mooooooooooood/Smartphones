import { PixelArt } from "@/components/pixel/pixelArt";

/**
 * Small reusable pixel scenery for the Academy world map — bushes, rocks,
 * flowers, mushrooms and a distant castle. Drawn with the shared PixelArt
 * renderer so they stay crisp and cheap.
 */
const C = {
  // greens
  g1: "#7fe0a0", g2: "#4cc079", g3: "#2f8f55", gd: "#1d6b3c",
  trunk: "#7a4a22",
  // rock
  r1: "#aeb8d0", r2: "#7d88a8", r3: "#525c7e",
  // flowers / mushroom
  pink: "#ff8fb0", yellow: "#ffd24a", red: "#e0485f", white: "#fbf4e2", stem: "#3f8a4a",
  // castle
  c1: "#9aa6cc", c2: "#6f7aa6", c3: "#4a5480", flag: "#f7bd3f",
} as const;

export function Bush({ size = 26, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <PixelArt w={10} size={size} className={className} style={style} shadow={false}
      grid={["..gggg....", ".gGGGGg...", "gGGGHHGg..", "gGGGGGGg.g", "gGdGGdGGgG", ".gddddgggG", "..dddddg.."]}
      colors={{ g: C.g2, G: C.g1, H: "#bff0d0", d: C.g3 }}
    />
  );
}

export function Rock({ size = 22, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <PixelArt w={10} size={size} className={className} style={style} shadow={false}
      grid={["...rr.....", "..rRRr....", ".rRRRRrr..", "rRRHRRRRr.", "rRRRRRRRr.", ".sssssss.."]}
      colors={{ r: C.r3, R: C.r2, H: C.r1, s: "#3a4366" }}
    />
  );
}

export function Flower({ size = 16, className = "", style, petal = C.pink }: { size?: number; className?: string; style?: React.CSSProperties; petal?: string }) {
  return (
    <PixelArt w={7} size={size} className={className} style={style} shadow={false}
      grid={[".p.p.p.", "ppYppp.", ".p.p.p.", "...s...", "..sss..", "...s..."]}
      colors={{ p: petal, Y: C.yellow, s: C.stem }}
    />
  );
}

export function Mushroom({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <PixelArt w={8} size={size} className={className} style={style} shadow={false}
      grid={["..rrrr..", ".rRwRRr.", "rRRRwRRr", "rwRRRRwr", "..wwww..", "..wssw..", "..wwww.."]}
      colors={{ r: "#a82e3e", R: C.red, w: C.white, s: "#e8dcc0" }}
    />
  );
}

export function CastleFar({ size = 64, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <PixelArt w={16} size={size} className={className} style={style} shadow={false}
      grid={[
        ".......F........",
        ".......f........",
        "..C.C..CCC..C.C.",
        "..CcC..CcC..CcC.",
        "..CCC..CCC..CCC.",
        "..ccccccccccccc.",
        "..CCCwCCCwCCCCC.",
        "..CCCwCCCwCCCCC.",
        "..ccccwwwwccccc.",
        "..CCCCwwwwCCCCC.",
      ]}
      colors={{ C: C.c2, c: C.c3, w: "#2a3150", F: C.flag, f: "#8a5a18" }}
    />
  );
}
