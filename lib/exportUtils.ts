import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ProgressCallback = (progress: { current: number; total: number }) => void;

// Fungsi untuk memastikan font sudah dimuat dengan benar
const waitForFonts = async (): Promise<void> => {
  // Tunggu font API siap
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Tunggu tambahan untuk memastikan font Arab dirender dengan benar
  return new Promise((resolve) => {
    setTimeout(resolve, 800);
  });
};

export const exportToPdf = async (onProgress: ProgressCallback) => {
  // Tunggu font dimuat sebelum memulai export
  await waitForFonts();

  // Ambil container utama
  const exportContainer = document.querySelector<HTMLElement>('.printable-export-container');
  if (!exportContainer) {
    throw new Error('Export container tidak ditemukan');
  }

  // Simpan style asli
  const originalStyle = exportContainer.style.cssText;

  // Buat container VISIBLE untuk capture yang benar
  // Posisikan di luar viewport tapi masih rendered
  exportContainer.style.cssText = `
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    z-index: 99999 !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: none !important;
    background: white !important;
  `;

  // Tunggu browser render
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Menargetkan elemen yang disiapkan khusus untuk ekspor
  const pages = document.querySelectorAll<HTMLElement>('.page-container-for-export');
  const totalPages = pages.length;

  if (totalPages === 0) {
    // Kembalikan style asli
    exportContainer.style.cssText = originalStyle;
    throw new Error('Tidak ada halaman yang ditemukan untuk diekspor. Pastikan kontainer yang dapat dicetak dirender.');
  }

  // Inisialisasi progres
  onProgress({ current: 0, total: totalPages });

  // Menggunakan unit 'in' dan format 'a4' standar untuk memastikan kompatibilitas cetak.
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  try {
    for (let i = 0; i < totalPages; i++) {
      const page = pages[i];

      // Memperbarui progres sebelum memproses setiap halaman
      onProgress({ current: i + 1, total: totalPages });

      // Capture dengan html2canvas
      const canvas = await html2canvas(page, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: false,
        // Gunakan window dimensions untuk memastikan capture yang benar
        windowWidth: page.scrollWidth,
        windowHeight: page.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    pdf.save('worksheet-latiefathfall.pdf');
  } finally {
    // SELALU kembalikan style asli, bahkan jika terjadi error
    exportContainer.style.cssText = originalStyle;
  }
};
