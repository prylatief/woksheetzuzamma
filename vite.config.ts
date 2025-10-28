import { defineConfig } from 'vite'

export default defineConfig({
  // ... konfigurasi lainnya
  build: {
    // Properti ini yang akan menghilangkan peringatan chunk size
    chunkSizeWarningLimit: 2000 // Mengatur batas peringatan menjadi 2000 kB (2 MB)
  }
})
