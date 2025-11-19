import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // ADD THIS LINE TO SET THE BASE PATH FOR GITHUB PAGES:
  base: "/clkr/", 
  
  plugins: [react()],
})