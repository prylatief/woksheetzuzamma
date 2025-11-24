import React, { useState, useMemo, useEffect } from 'react';
import { WorksheetConfig, Surah, ActivityType } from './types';
import { ControlPanel } from './components/ControlPanel';
import { WorksheetPage } from './components/WorksheetPage';
import { ActivityRenderer } from './components/ActivityRenderer';
import { quranData } from './data/quranData';
import { exportToPdf } from './lib/exportUtils';
import { ExportOptionsModal } from './components/ExportOptionsModal';
import { estimatePageHeight } from './lib/pageHeightEstimator';
import { PageFullWarning } from './components/PageFullWarning';

const ExportOverlay: React.FC<{ progress: number; total: number }> = ({ progress, total }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
    <div className="bg-white rounded-2xl p-8 shadow-2xl text-center w-96 transform transition-all duration-300 scale-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Mengekspor PDF...</h3>
      <p className="text-gray-600 mb-6">Harap tunggu, ini mungkin memakan waktu beberapa saat.</p>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
        <div 
          className="bg-teal-500 h-4 rounded-full transition-all duration-500 ease-out" 
          style={{ width: total > 0 ? `${(progress / total) * 100}%` : '0%' }}
        ></div>
      </div>
      <p className="font-semibold text-teal-700">{`Memproses Halaman ${progress} dari ${total}`}</p>
    </div>
  </div>
);

const PrintableWorksheet: React.FC<{ config: WorksheetConfig; surah: Surah; pagesContent: React.ReactNode[] }> = ({ config, surah, pagesContent }) => (
    <div
      className="printable-export-container"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: -9999,
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
        {pagesContent.map((content, index) => (
            <div key={index} className="page-container-for-export">
                <WorksheetPage
                    config={config}
                    surah={surah}
                    pageNumber={index + 1}
                    totalPages={pagesContent.length}
                >
                    {content}
                </WorksheetPage>
            </div>
        ))}
    </div>
);


const App: React.FC = () => {
  const [config, setConfig] = useState<WorksheetConfig>({
    header: {
      schoolName: "SD Contoh Nusantara",
      className: "3A",
      logoUrl: "",
    },
    surahNumber: 114,
    ayahRange: [1, 6],
    activities: ["tracing", "copy_lines"],
    design: {
      fontLatin: "Comic Neue",
      fontArabic: "Amiri Quran",
      border: "stars",
      background: "pastel",
    },
    output: {
      format: "PDF",
      includeAnswerKey: true,
      paginationMode: "single_activity_per_page",
    },
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [pagesToExport, setPagesToExport] = useState<React.ReactNode[]>([]);


  const selectedSurah = quranData[config.surahNumber];

  // Get current ayahs for estimation
  const currentAyahs = useMemo(() => {
    return quranData[config.surahNumber].ayahs.filter(
      (ayah) => ayah.ayah >= config.ayahRange[0] && ayah.ayah <= config.ayahRange[1]
    );
  }, [config.surahNumber, config.ayahRange]);

  // Calculate page estimation for compact mode
  const pageEstimation = useMemo(() => {
    if (config.output.paginationMode !== 'compact') return undefined;
    return estimatePageHeight(config.activities, currentAyahs);
  }, [config.activities, currentAyahs, config.output.paginationMode]);

  const isCompactMode = config.output.paginationMode === 'compact';
  const isPageFull = isCompactMode && pageEstimation?.isFull;

  const studentPagesContent = useMemo(() => {
    const currentSurah = quranData[config.surahNumber];
    const ayahsToRender = currentSurah.ayahs.filter(
        (ayah) => ayah.ayah >= config.ayahRange[0] && ayah.ayah <= config.ayahRange[1]
    );

    const activities = config.activities.map(activity => (
        <ActivityRenderer 
          key={activity} 
          activity={activity} 
          ayahs={ayahsToRender} 
          allAyahsInSurah={currentSurah.ayahs}
        />
    ));

    if (config.output.paginationMode === 'compact') {
        return activities.length > 0 ? [<div>{activities}</div>] : [];
    }
    
    return activities;
  }, [config.activities, config.output.paginationMode, config.surahNumber, config.ayahRange]);

  const SOLVABLE_ACTIVITIES: ActivityType[] = [
    'mcq_meaning', 
    'match_ayah_translation', 
    'fill_in_blank', 
    'word_meaning', 
    'reorder_words', 
    'puzzle_ayah'
  ];

  const answerKeyPagesContent = useMemo(() => {
      if (!config.output.includeAnswerKey) return [];
      
      const currentSurah = quranData[config.surahNumber];
      const ayahsToRender = currentSurah.ayahs.filter(
          (ayah) => ayah.ayah >= config.ayahRange[0] && ayah.ayah <= config.ayahRange[1]
      );
      
      const answerKeyActivities = config.activities
        .filter(activity => SOLVABLE_ACTIVITIES.includes(activity))
        .map(activity => (
          <ActivityRenderer 
            key={`${activity}-answer`} 
            activity={activity} 
            ayahs={ayahsToRender} 
            allAyahsInSurah={currentSurah.ayahs}
            isAnswerKey={true}
          />
        ));

      if (answerKeyActivities.filter(Boolean).length === 0) return [];
      
      const content = (
        <div>
          <h1 className="text-3xl font-bold text-center mb-8 border-b-4 pb-4 border-gray-700">KUNCI JAWABAN</h1>
          {answerKeyActivities}
        </div>
      );
      
      return [content];

  }, [config.activities, config.surahNumber, config.ayahRange, config.output.includeAnswerKey]);

  
  useEffect(() => {
    setCurrentPageIndex(0);
  }, [studentPagesContent.length]);
  
  useEffect(() => {
    if (isExporting && pagesToExport.length > 0) {
      setExportProgress({ current: 0, total: pagesToExport.length });

      const timer = setTimeout(async () => {
        try {
          await exportToPdf((progress) => setExportProgress(progress));
        } catch (error) {
          console.error("Gagal mengekspor PDF:", error);
          alert("Terjadi kesalahan saat mengekspor PDF. Lihat konsol untuk detail.");
        } finally {
          setIsExporting(false);
          setPagesToExport([]);
        }
      }, 800); // Penundaan lebih lama untuk memastikan font Arab dirender dengan benar

      return () => clearTimeout(timer);
    }
  }, [isExporting, pagesToExport]);


  const openExportModal = () => {
    if (config.activities.length === 0) {
      alert("Silakan pilih setidaknya satu aktivitas untuk membuat worksheet.");
      return;
    }
    setIsExportModalOpen(true);
  };
  
  const handleConfirmExport = (selection: { type: string; range: [number, number] }) => {
    setIsExportModalOpen(false);
    let studentPages: React.ReactNode[] = [];
    
    switch (selection.type) {
        case 'all':
            studentPages = studentPagesContent;
            break;
        case 'current':
            studentPages = [studentPagesContent[currentPageIndex]];
            break;
        case 'custom':
            studentPages = studentPagesContent.slice(selection.range[0] - 1, selection.range[1]);
            break;
    }
    
    let finalPagesToExport = [...studentPages];
    if (answerKeyPagesContent.length > 0) {
      finalPagesToExport.push(...answerKeyPagesContent);
    }

    if (finalPagesToExport.length > 0) {
      setPagesToExport(finalPagesToExport);
      setIsExporting(true);
    } else {
        alert("Tidak ada halaman yang dipilih untuk diekspor.");
    }
  };


  const currentPageContent = studentPagesContent[currentPageIndex];

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-white font-sans">
      {isExporting && <ExportOverlay progress={exportProgress.current} total={exportProgress.total} />}
      {isExporting && <PrintableWorksheet config={config} surah={selectedSurah} pagesContent={pagesToExport} />}
      
      <ExportOptionsModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleConfirmExport}
        totalPages={studentPagesContent.length}
        currentPage={currentPageIndex + 1}
      />
      
      <style>{`
          /* Container untuk export - menggunakan fixed positioning agar html2canvas bisa capture dengan benar */
          .printable-export-container {
            font-family: 'Poppins', sans-serif;
          }
          .page-container-for-export {
            /* Menerapkan gaya langsung ke elemen wrapper untuk ekspor */
            width: 8.27in;
            height: 11.69in;
            overflow: hidden;
            background-color: white !important;
            /* Pastikan font rendering yang konsisten */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }
          /* Reset semua transform dan origin pada page-container untuk export */
          .page-container-for-export .page-container {
            box-shadow: none !important;
            border-radius: 16px !important;
            transform: none !important;
            transform-origin: center !important;
          }
          /* Pastikan font Arab dirender dengan benar saat export */
          .page-container-for-export .font-quran,
          .page-container-for-export [dir="rtl"] {
            font-family: 'Amiri Quran', serif !important;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            letter-spacing: normal !important;
          }
          /* Pastikan alignment tetap konsisten */
          .page-container-for-export header,
          .page-container-for-export footer,
          .page-container-for-export main {
            transform: none !important;
          }
          /* Fix untuk flexbox items agar tidak berubah posisi */
          .page-container-for-export .flex {
            flex-shrink: 0;
          }
          /* Fix untuk text alignment */
          .page-container-for-export .text-right {
            text-align: right !important;
          }
          .page-container-for-export .text-center {
            text-align: center !important;
          }
          .page-container-for-export .justify-center {
            justify-content: center !important;
          }
          .page-container-for-export .items-center {
            align-items: center !important;
          }
          .A4-preview-wrapper {
            transform: scale(0.85);
            transform-origin: top;
          }
           @media (max-width: 1536px) { .A4-preview-wrapper { transform: scale(0.75); } }
           @media (max-width: 1280px) { .A4-preview-wrapper { transform: scale(0.65); } }
           @media (max-width: 1024px) { .A4-preview-wrapper { transform: scale(0.5); } }
      `}</style>

      <ControlPanel config={config} setConfig={setConfig} onExport={openExportModal} isExporting={isExporting} pageEstimation={pageEstimation} />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 bg-gray-200">
        
        {studentPagesContent.length > 1 && (
            <div className="flex items-center justify-center mb-4 gap-4">
                <button 
                    onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))} 
                    disabled={currentPageIndex === 0}
                    className="px-4 py-2 bg-white rounded-md shadow font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                    Halaman Sebelumnya
                </button>
                <span className="font-bold text-gray-600">
                    Halaman {currentPageIndex + 1} dari {studentPagesContent.length}
                </span>
                <button 
                    onClick={() => setCurrentPageIndex(p => Math.min(studentPagesContent.length - 1, p + 1))} 
                    disabled={currentPageIndex >= studentPagesContent.length - 1}
                    className="px-4 py-2 bg-white rounded-md shadow font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                    Halaman Berikutnya
                </button>
            </div>
        )}

        <div id="worksheet-preview" className="flex flex-col items-center">
            {currentPageContent ? (
                <div key={`${config.surahNumber}-${config.ayahRange.join('-')}-${currentPageIndex}`} className="A4-preview-wrapper relative">
                  <WorksheetPage
                    config={config}
                    surah={selectedSurah}
                    pageNumber={currentPageIndex + 1}
                    totalPages={studentPagesContent.length}
                  >
                      {currentPageContent}
                  </WorksheetPage>

                  {/* Page Full Overlay Indicator */}
                  {isCompactMode && pageEstimation && (pageEstimation.isFull || pageEstimation.isNearlyFull) && (
                    <PageFullWarning estimation={pageEstimation} variant="overlay" />
                  )}
                </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-white rounded-lg shadow-md p-10 mt-8">
                  <h3 className="text-2xl font-bold mb-2">Selamat Datang di latiefAthfall!</h3>
                  <p>Pilih surah dan setidaknya satu aktivitas di panel sebelah kiri untuk memulai.</p>
              </div>
            )}
        </div>
      </main>

      <footer className="fixed bottom-0 right-0 bg-gray-800 text-white text-xs px-3 py-1 rounded-tl-lg">
        © latiefAthfall • “From Idea to App 🚀”
      </footer>
    </div>
  );
};

export default App;