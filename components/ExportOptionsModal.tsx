import React, { useState, useEffect } from 'react';

type SelectionType = 'all' | 'current' | 'custom';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: { type: SelectionType; range: [number, number] }) => void;
  totalPages: number;
  currentPage: number;
}

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({ isOpen, onClose, onConfirm, totalPages, currentPage }) => {
  const [selection, setSelection] = useState<SelectionType>('all');
  const [customRange, setCustomRange] = useState<[string, string]>(['1', String(totalPages)]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelection('all');
      setCustomRange(['1', String(totalPages)]);
      setError('');
    }
  }, [isOpen, totalPages]);
  
  const handleConfirm = () => {
    if (selection === 'custom') {
      const from = parseInt(customRange[0], 10);
      const to = parseInt(customRange[1], 10);
      if (isNaN(from) || isNaN(to) || from < 1 || to > totalPages || from > to) {
        setError('Rentang halaman tidak valid. Harap periksa kembali.');
        return;
      }
      setError('');
      onConfirm({ type: 'custom', range: [from, to] });
    } else if (selection === 'current') {
      onConfirm({ type: 'current', range: [currentPage, currentPage] });
    } else {
      onConfirm({ type: 'all', range: [1, totalPages] });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Opsi Ekspor PDF</h3>
        <p className="text-sm text-gray-500 mb-6">Pilih halaman yang ingin Anda unduh.</p>
        
        <div className="space-y-4">
          <label className="flex items-center p-3 rounded-lg border has-[:checked]:bg-teal-50 has-[:checked]:border-teal-300 transition-colors">
            <input type="radio" name="export-option" value="all" checked={selection === 'all'} onChange={() => setSelection('all')} className="h-5 w-5 text-teal-600 focus:ring-teal-500"/>
            <span className="ml-3 font-medium text-gray-700">Semua Halaman ({totalPages} halaman)</span>
          </label>
          <label className="flex items-center p-3 rounded-lg border has-[:checked]:bg-teal-50 has-[:checked]:border-teal-300 transition-colors">
            <input type="radio" name="export-option" value="current" checked={selection === 'current'} onChange={() => setSelection('current')} className="h-5 w-5 text-teal-600 focus:ring-teal-500"/>
            <span className="ml-3 font-medium text-gray-700">Halaman Saat Ini (Halaman {currentPage})</span>
          </label>
          <div className="p-3 rounded-lg border has-[:checked]:bg-teal-50 has-[:checked]:border-teal-300 transition-colors">
            <label className="flex items-center">
              <input type="radio" name="export-option" value="custom" checked={selection === 'custom'} onChange={() => setSelection('custom')} className="h-5 w-5 text-teal-600 focus:ring-teal-500"/>
              <span className="ml-3 font-medium text-gray-700">Rentang Kustom</span>
            </label>
            <div className={`flex items-center space-x-2 mt-2 pl-8 transition-opacity ${selection === 'custom' ? 'opacity-100' : 'opacity-50'}`}>
              <input 
                type="number" 
                value={customRange[0]}
                onChange={e => setCustomRange([e.target.value, customRange[1]])}
                disabled={selection !== 'custom'}
                className="w-20 text-center px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                min="1"
                max={totalPages}
              />
              <span className="text-gray-500">sampai</span>
              <input 
                type="number" 
                value={customRange[1]}
                onChange={e => setCustomRange([customRange[0], e.target.value])}
                disabled={selection !== 'custom'}
                className="w-20 text-center px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
                min="1"
                max={totalPages}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}
        
        <div className="flex justify-end space-x-3 mt-8">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Batal</button>
          <button onClick={handleConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">Lanjutkan Ekspor</button>
        </div>
      </div>
    </div>
  );
};