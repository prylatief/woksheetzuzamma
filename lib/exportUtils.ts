import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ProgressCallback = (progress: { current: number; total: number }) => void;

export const exportToPdf = async (onProgress: ProgressCallback) => {
  // Menargetkan elemen yang disiapkan khusus untuk ekspor
  const pages = document.querySelectorAll<HTMLElement>('.page-container-for-export');
  const totalPages = pages.length;

  if (totalPages === 0) {
    throw new Error('Tidak ada halaman yang ditemukan untuk diekspor. Pastikan kontainer yang dapat dicetak dirender.');
  }

  // Inisialisasi progres
  onProgress({ current: 0, total: totalPages });

  // Menggunakan unit 'in' dan format 'a4' standar untuk memastikan kompatibilitas cetak.
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in', // Gunakan inci agar sesuai dengan ukuran CSS di preview
    format: 'a4', // Ukuran A4 standar yang dikenali oleh printer
    putOnlyUsedFonts: true,
    floatPrecision: 16,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // Ini akan menjadi 8.27 inci
  const pdfHeight = pdf.internal.pageSize.getHeight(); // Ini akan menjadi 11.69 inci

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    
    // Memperbarui progres sebelum memproses setiap halaman
    onProgress({ current: i + 1, total: totalPages });

    // Meningkatkan skala untuk resolusi cetak yang lebih tinggi (~300 DPI).
    // Browser menggunakan ~96 DPI, jadi skala 3 menghasilkan ~288 DPI.
    const canvas = await html2canvas(page, {
      scale: 3, // Menangkap dengan resolusi 3x untuk kualitas cetak yang tajam
      useCORS: true, // Untuk gambar latar dari domain eksternal
      logging: false, // Menyembunyikan log konsol dari html2canvas
      backgroundColor: null // Menggunakan latar belakang dari elemen
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0); // Menggunakan PNG kualitas tinggi
    
    if (i > 0) {
      pdf.addPage();
    }
    
    // Menambahkan gambar ke PDF dengan kompresi cepat
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  pdf.save('worksheet-latiefathfall.pdf');
};