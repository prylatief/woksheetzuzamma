import React, { useState, useEffect, useMemo } from 'react';
import { WorksheetConfig, ActivityType, ACTIVITY_NAMES, SURAH_ORDER } from '../types';
import { quranData } from '../data/quranData';

interface ControlPanelProps {
  config: WorksheetConfig;
  setConfig: React.Dispatch<React.SetStateAction<WorksheetConfig>>;
  onExport: () => void;
  isExporting: boolean;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm mb-6">
    <h3 className="text-lg font-bold text-gray-800 bg-gray-100 px-6 py-3 rounded-t-lg border-b">{title}</h3>
    <div className="p-6">{children}</div>
  </div>
);

const Input: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input type="text" value={value} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm" />
  </div>
);

// Ayah Preview Component - Shows collapsible list of selected ayahs
const AyahPreview: React.FC<{
  surahNumber: number;
  fromAyah: number;
  toAyah: number;
  maxAyah: number;
}> = ({ surahNumber, fromAyah, toAyah, maxAyah }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const validFrom = Math.max(1, Math.min(fromAyah, maxAyah));
  const validTo = Math.max(1, Math.min(toAyah, maxAyah));
  const actualFrom = Math.min(validFrom, validTo);
  const actualTo = Math.max(validFrom, validTo);

  const selectedAyahs = quranData[surahNumber].ayahs.filter(
    (ayah) => ayah.ayah >= actualFrom && ayah.ayah <= actualTo
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-sm text-gray-700 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Lihat Preview Ayat
        </span>
        <span className="text-xs text-gray-500">{selectedAyahs.length} ayat</span>
      </button>

      {isExpanded && (
        <div className="max-h-64 overflow-y-auto p-3 space-y-3 bg-white">
          {selectedAyahs.map((ayah) => (
            <div
              key={ayah.ayah}
              className="p-2 bg-gray-50 rounded border-l-4 border-teal-400"
            >
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-medium">
                  {ayah.ayah}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-right font-quran text-base leading-loose text-gray-800" dir="rtl">
                    {ayah.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {ayah.translation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onExport, isExporting }) => {
  // Local state for inputs to avoid updating preview on every keystroke
  const [localSurahNumber, setLocalSurahNumber] = useState(config.surahNumber);
  const [dariAyahInput, setDariAyahInput] = useState(String(config.ayahRange[0]));
  const [sampaiAyahInput, setSampaiAyahInput] = useState(String(config.ayahRange[1]));
  
  const maxAyah = quranData[localSurahNumber].ayahs.length;

  // Sync local state when global config changes (e.g., loading a preset in the future)
  useEffect(() => {
    setLocalSurahNumber(config.surahNumber);
    setDariAyahInput(String(config.ayahRange[0]));
    setSampaiAyahInput(String(config.ayahRange[1]));
  }, [config.surahNumber, config.ayahRange]);

  const handleHeaderChange = (field: keyof typeof config.header, value: string) => {
    setConfig(prev => ({ ...prev, header: { ...prev.header, [field]: value } }));
  };

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSurahNumber = parseInt(e.target.value, 10);
    const newMaxAyah = quranData[newSurahNumber].ayahs.length;
    const newAyahRange: [number, number] = [1, newMaxAyah];

    // Update local state for the input fields
    setLocalSurahNumber(newSurahNumber);
    setDariAyahInput(String(newAyahRange[0]));
    setSampaiAyahInput(String(newAyahRange[1]));
    
    // Juga perbarui config global untuk memicu pembaruan pratinjau secara langsung
    setConfig(prev => ({
      ...prev,
      surahNumber: newSurahNumber,
      ayahRange: newAyahRange,
    }));
  };
  
  const handlePreviewUpdate = () => {
    let from = parseInt(dariAyahInput, 10);
    let to = parseInt(sampaiAyahInput, 10);
    const currentMaxAyah = quranData[localSurahNumber].ayahs.length;

    if (isNaN(from)) from = 1;
    if (isNaN(to)) to = currentMaxAyah;

    from = Math.max(1, Math.min(from, currentMaxAyah));
    to = Math.max(1, Math.min(to, currentMaxAyah));
    
    if (from > to) {
      [from, to] = [to, from];
    }

    setConfig(prev => ({
      ...prev,
      surahNumber: localSurahNumber,
      ayahRange: [from, to]
    }));
  };

  const hasChanges = useMemo(() => {
    const from = parseInt(dariAyahInput, 10);
    const to = parseInt(sampaiAyahInput, 10);

    const cleanFrom = isNaN(from) ? config.ayahRange[0] : from;
    const cleanTo = isNaN(to) ? config.ayahRange[1] : to;


    return localSurahNumber !== config.surahNumber || 
           cleanFrom !== config.ayahRange[0] || 
           cleanTo !== config.ayahRange[1];
  }, [localSurahNumber, dariAyahInput, sampaiAyahInput, config.surahNumber, config.ayahRange]);

  const handleActivityToggle = (activity: ActivityType) => {
    setConfig(prev => {
      const newActivities = prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity];
      return { ...prev, activities: newActivities };
    });
  };

  const handleDesignChange = (field: keyof typeof config.design, value: string) => {
    setConfig(prev => ({...prev, design: {...prev.design, [field]: value}}))
  };

  const handleOutputChange = (field: keyof typeof config.output, value: string | boolean) => {
    setConfig(prev => ({...prev, output: {...prev.output, [field]: value}}))
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleHeaderChange('logoUrl', event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };


  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-teal-600 font-comic">latiefAthfall</h2>
      </div>

      <Section title="Pilih Surah & Ayat">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Surah</label>
            <select value={localSurahNumber} onChange={handleSurahChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm">
              {SURAH_ORDER.map(num => (
                <option key={num} value={num}>
                  {quranData[num].latin} ({quranData[num].name})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Total: {maxAyah} ayat
            </p>
          </div>

          {/* Quick Selection Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Pilihan Cepat</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setDariAyahInput('1'); setSampaiAyahInput('5'); }}
                disabled={maxAyah < 5}
                className="px-3 py-1 text-xs rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Ayat 1-5
              </button>
              <button
                type="button"
                onClick={() => { setDariAyahInput('1'); setSampaiAyahInput('10'); }}
                disabled={maxAyah < 10}
                className="px-3 py-1 text-xs rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Ayat 1-10
              </button>
              <button
                type="button"
                onClick={() => { setDariAyahInput('1'); setSampaiAyahInput('15'); }}
                disabled={maxAyah < 15}
                className="px-3 py-1 text-xs rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Ayat 1-15
              </button>
              <button
                type="button"
                onClick={() => { setDariAyahInput('1'); setSampaiAyahInput(String(maxAyah)); }}
                className="px-3 py-1 text-xs rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                Semua ({maxAyah})
              </button>
            </div>
          </div>

          {/* Custom Range Input */}
          <div className="flex items-center space-x-2">
             <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Dari Ayat</label>
                <input
                  type="number"
                  min="1"
                  max={maxAyah}
                  value={dariAyahInput}
                  onChange={(e) => setDariAyahInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
             </div>
             <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Sampai Ayat</label>
                <input
                  type="number"
                  min="1"
                  max={maxAyah}
                  value={sampaiAyahInput}
                  onChange={(e) => setSampaiAyahInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
             </div>
          </div>

          {/* Selected Range Summary */}
          <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
            <p className="text-sm text-teal-800">
              <span className="font-medium">Ayat terpilih: </span>
              {(() => {
                const from = parseInt(dariAyahInput, 10) || 1;
                const to = parseInt(sampaiAyahInput, 10) || maxAyah;
                const validFrom = Math.max(1, Math.min(from, maxAyah));
                const validTo = Math.max(1, Math.min(to, maxAyah));
                const actualFrom = Math.min(validFrom, validTo);
                const actualTo = Math.max(validFrom, validTo);
                const count = actualTo - actualFrom + 1;
                return `${actualFrom} - ${actualTo} (${count} ayat)`;
              })()}
            </p>
          </div>

          {/* Ayah Preview (Collapsible) */}
          <AyahPreview
            surahNumber={localSurahNumber}
            fromAyah={parseInt(dariAyahInput, 10) || 1}
            toAyah={parseInt(sampaiAyahInput, 10) || maxAyah}
            maxAyah={maxAyah}
          />
        </div>
      </Section>
      
      <Section title="Pilih Aktivitas">
        <div className="space-y-3">
          {Object.entries(ACTIVITY_NAMES).map(([key, name]) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" checked={config.activities.includes(key as ActivityType)} onChange={() => handleActivityToggle(key as ActivityType)} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-sm text-gray-700">{name}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Edit Header Worksheet">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Sekolah" value={config.header.schoolName} onChange={e => handleHeaderChange('schoolName', e.target.value)} />
            <Input label="Kelas" value={config.header.className} onChange={e => handleHeaderChange('className', e.target.value)} />
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Logo Sekolah</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
            </div>
        </div>
      </Section>

       <Section title="Desain & Tampilan">
          <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Font Latin</label>
                <select value={config.design.fontLatin} onChange={e => handleDesignChange('fontLatin', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm">
                  <option value="Comic Neue">Comic Neue</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Hiasan Tepi (Border)</label>
                 <select value={config.design.border} onChange={e => handleDesignChange('border', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm">
                    <option value="none">Polos</option>
                    <option value="stars">Bintang</option>
                    <option value="crayon">Crayon</option>
                    <option value="cloud">Awan</option>
                    <option value="geometry">Geometri</option>
                    <option value="leaves">Daun</option>
                    <option value="bubbles">Gelembung</option>
                    <option value="hearts">Hati</option>
                    <option value="honeycomb">Sarang Lebah</option>
                    <option value="waves">Gelombang</option>
                    <option value="doodles">Coretan</option>
                 </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Latar Belakang (Background)</label>
                 <select value={config.design.background} onChange={e => handleDesignChange('background', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm">
                    <option value="none">Putih</option>
                    <option value="pastel">Pastel Kuning</option>
                    <option value="pastel-blue">Pastel Biru</option>
                    <option value="pastel-green">Pastel Hijau</option>
                    <option value="pastel-pink">Pastel Pink</option>
                    <option value="lined">Bergaris</option>
                    <option value="dot-grid">Grid Titik</option>
                    <option value="graph-paper">Kertas Grafik</option>
                    <option value="old-paper">Kertas Lama</option>
                    <option value="soft-gradient">Gradien Lembut</option>
                 </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mode Halaman</label>
                <div className="flex space-x-4 text-sm">
                    <label className="flex items-center">
                        <input type="radio" name="paginationMode" value="single_activity_per_page" checked={config.output.paginationMode === 'single_activity_per_page'} onChange={e => handleOutputChange('paginationMode', e.target.value)} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300" />
                        <span className="ml-2 text-gray-700">Satu Aktivitas per Halaman</span>
                    </label>
                    <label className="flex items-center">
                        <input type="radio" name="paginationMode" value="compact" checked={config.output.paginationMode === 'compact'} onChange={e => handleOutputChange('paginationMode', e.target.value)} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300" />
                        <span className="ml-2 text-gray-700">Kompak</span>
                    </label>
                </div>
              </div>
               <div className="pt-4 mt-4 border-t">
                  <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                          type="checkbox" 
                          checked={config.output.includeAnswerKey} 
                          onChange={e => handleOutputChange('includeAnswerKey', e.target.checked)} 
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" 
                      />
                      <span className="text-sm font-medium text-gray-700">Sertakan Kunci Jawaban</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-7">Kunci jawaban akan ditambahkan di akhir dokumen PDF.</p>
              </div>
          </div>
       </Section>

       <div className="p-6 space-y-4">
        <button
            onClick={handlePreviewUpdate}
            disabled={!hasChanges}
            className="w-full bg-teal-100 text-teal-800 font-bold py-3 px-4 rounded-lg hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
            {hasChanges ? 'Terapkan Perubahan & Lihat' : 'Pratinjau Sudah Sesuai'}
        </button>
        <button
            onClick={onExport}
            disabled={isExporting || hasChanges}
            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={hasChanges ? "Harap terapkan perubahan terlebih dahulu" : ""}
        >
            {isExporting ? 'Mengekspor...' : 'Unduh Worksheet (PDF)'}
        </button>
       </div>
    </div>
  );
};