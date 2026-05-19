import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react") || id.includes("scheduler")) {
            return "vendor-react";
          }

          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }

          if (id.includes("@dnd-kit")) {
            return "vendor-dnd";
          }

          if (id.includes("framer-motion") || id.includes("motion-dom")) {
            return "vendor-motion";
          }

          if (
            id.includes("@tanstack") ||
            id.includes("axios") ||
            id.includes("react-router")
          ) {
            return "vendor-data";
          }

          if (
            id.includes("lucide-react") ||
            id.includes("date-fns") ||
            id.includes("react-datepicker")
          ) {
            return "vendor-ui";
          }

          return "vendor";
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
