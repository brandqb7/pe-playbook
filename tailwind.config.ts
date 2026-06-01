import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f1117",
        surface: "#1a1d2a",
        surface2: "#20253a",
        surface3: "#262b40",
        border: "#2d3450",
        border2: "#3d4570",
        text: "#f0f2ff",
        muted: "#8892b0",
        dim: "#4a5070",
        green: "#22c55e",
        blue: "#3b82f6",
        purple: "#a855f7",
        orange: "#f97316",
        yellow: "#f59e0b",
        red: "#ef4444",
        cyan: "#06b6d4",
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "Impact", "Arial Narrow", "sans-serif"],
        dm: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
