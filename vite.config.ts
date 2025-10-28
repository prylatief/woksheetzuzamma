import { defineConfig } from 'vite';

// Anda juga dapat mengimpor tipe 'UserConfig' jika ingin lebih ketat dalam penentuan tipe
// import type { UserConfig } from 'vite';

export default defineConfig({
  // Tempatkan konfigurasi utama Vite Anda di sini
  // Misalnya: plugins, resolve, server, dll.

  build: {
    // Properti ini menaikkan batas peringatan dari default 500kB.
    chunkSizeWarningLimit: 2000, // Mengatur batas menjadi 2000 kB (2 MB)
    
    // Anda bisa menambahkan konfigurasi build lainnya di sini
    // Misalnya, untuk code splitting yang lebih detail:
    // rollupOptions: {
    //   output: {
    //     manualChunks(id) {
    //       if (id.includes('node_modules')) {
    //         return 'vendor'; // Menggabungkan semua dari node_modules menjadi satu chunk
    //       }
    //     },
    //   },
    // },
  },

  // ... konfigurasi lainnya
});
