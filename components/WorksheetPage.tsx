import React from 'react';
import { WorksheetConfig, Surah } from '../types';

interface WorksheetPageProps {
  config: WorksheetConfig;
  surah: Surah;
  children: React.ReactNode;
  pageNumber: number;
  totalPages: number;
}

export const WorksheetPage: React.FC<WorksheetPageProps> = ({ config, surah, children, pageNumber, totalPages }) => {
  const { header, design } = config;
  
  const fontClass = design.fontLatin === 'Comic Neue' ? 'font-comic' : 'font-sans';
  
  // Ini adalah tekstur untuk area BORDER.
  // Warna latar ditambahkan agar tekstur lebih terlihat dan berfungsi sebagai fallback.
  const borderTextureClasses: Record<typeof design.border, string> = {
    none: '', // 'none' akan membuat bingkai putih standar
    stars: 'bg-gray-100 bg-[url(https://www.transparenttextures.com/patterns/stardust.png)]',
    crayon: 'bg-yellow-50 bg-[url(https://www.transparenttextures.com/patterns/crissxcross.png)]',
    cloud: 'bg-sky-100 bg-[url(https://www.transparenttextures.com/patterns/foggy-birds.png)]',
    geometry: 'bg-gray-100 bg-[url(https://www.transparenttextures.com/patterns/subtle-prism.png)]',
    leaves: 'bg-green-100 bg-[url(https://www.transparenttextures.com/patterns/leaves.png)]',
    bubbles: 'bg-blue-100 bg-[url(https://www.transparenttextures.com/patterns/bubbles.png)]',
    hearts: 'bg-pink-100 bg-[url(https://www.transparenttextures.com/patterns/az-subtle.png)]',
    honeycomb: 'bg-amber-100 bg-[url(https://www.transparenttextures.com/patterns/honeycomb.png)]',
    waves: 'bg-cyan-100 bg-[url(https://www.transparenttextures.com/patterns/wavecut.png)]',
    doodles: 'bg-gray-100 bg-[url(https://www.transparenttextures.com/patterns/sketches.png)]',
  };

  const backgroundClasses: Record<typeof design.background, string> = {
    none: 'bg-white',
    pastel: 'bg-yellow-50',
    lined: 'bg-white bg-repeat-y bg-[length:100%_2rem] bg-[linear-gradient(to_bottom,_transparent_31px,_#d1d5db_32px)]',
    'dot-grid': 'bg-white bg-[radial-gradient(#d1d5db_1px,_transparent_1px)] [background-size:1.5rem_1.5rem]',
    'pastel-blue': 'bg-sky-50',
    'pastel-green': 'bg-emerald-50',
    'pastel-pink': 'bg-pink-50',
    'graph-paper': 'bg-white bg-[linear-gradient(to_right,_#e5e7eb_1px,_transparent_1px),_linear-gradient(to_bottom,_#e5e7eb_1px,_transparent_1px)] bg-[size:1rem_1rem]',
    'old-paper': 'bg-[#fdf6e3]',
    'soft-gradient': 'bg-gradient-to-br from-white to-sky-100',
  }
  
  return (
    <div
      className={`page-container origin-top shadow-a4 rounded-2xl overflow-hidden bg-white p-8 ${borderTextureClasses[design.border]}`}
      style={{
        width: '8.27in',
        height: '11.69in',
      }}
    >
      <div className={`w-full h-full p-6 flex flex-col ${fontClass} ${backgroundClasses[design.background]} shadow-inner rounded-lg`}>
        <header className="border-b-4 border-gray-800 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="w-1/2">
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                <div className="flex items-baseline"><span className="font-bold w-28">Nama Sekolah:</span><span className="border-b border-gray-500 flex-1">{header.schoolName}</span></div>
                <div className="flex items-baseline"><span className="font-bold w-28">Kelas:</span><span className="border-b border-gray-500 flex-1">{header.className}</span></div>
                <div className="flex items-baseline"><span className="font-bold w-28">Nama:</span><span className="border-b border-gray-500 flex-1"></span></div>
                 <div className="flex items-baseline"><span className="font-bold w-28">Nilai:</span><span className="border-b border-gray-500 flex-1"></span></div>
              </div>
            </div>
            <div className="w-1/2 flex justify-end items-center gap-4">
               <div className="text-right">
                <h1 className="text-3xl font-bold font-quran" dir="rtl">{surah.name}</h1>
                <p className="text-lg font-bold">{surah.latin}: {config.ayahRange[0]}-{config.ayahRange[1]}</p>
              </div>
              {header.logoUrl && <img src={header.logoUrl} alt="Logo Sekolah" className="h-20 w-20 object-contain" />}
            </div>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>
        
        <footer className="text-center text-xs text-gray-500 mt-auto pt-2">
           latiefAthfall Worksheet Generator • Halaman {pageNumber}/{totalPages}
        </footer>
      </div>
    </div>
  );
};