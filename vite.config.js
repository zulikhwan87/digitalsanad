import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // PENTING untuk GitHub Pages: base MESTI sepadan dengan nama repo GitHub anda,
  // dalam format "/nama-repo/" (ada "/" di depan dan belakang).
  // Contoh: jika repo anda https://github.com/anda/digitalsanad, base = "/digitalsanad/"
  base: "/digitalsanad/",
});
