import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    hmr: {
      host: "localhost",
      port: 5173,
      protocol: "ws"
    },
    proxy: {
      "/soroban-rpc": {
        target: "https://soroban-testnet.stellar.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/soroban-rpc/, "")
      }
    }
  }
});
