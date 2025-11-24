import React from 'react';
import { PageEstimation } from '../lib/pageHeightEstimator';

interface PageFullWarningProps {
  estimation: PageEstimation;
  variant?: 'banner' | 'inline' | 'overlay';
}

export const PageFullWarning: React.FC<PageFullWarningProps> = ({ estimation, variant = 'banner' }) => {
  if (!estimation.isFull && !estimation.isNearlyFull) {
    return null;
  }

  const isFull = estimation.isFull;

  if (variant === 'overlay') {
    return (
      <div className={`absolute inset-0 pointer-events-none flex items-end justify-center pb-20 z-10 ${isFull ? 'bg-red-500/5' : ''}`}>
        <div className={`
          px-4 py-2 rounded-full shadow-lg pointer-events-auto
          ${isFull
            ? 'bg-red-100 border-2 border-red-400 text-red-700'
            : 'bg-amber-100 border-2 border-amber-400 text-amber-700'}
        `}>
          <div className="flex items-center gap-2">
            {isFull ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-semibold text-sm">
              {isFull ? 'Halaman Penuh!' : `Hampir Penuh (${Math.round(estimation.usedPercentage)}%)`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm
        ${isFull
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-amber-50 border border-amber-200 text-amber-700'}
      `}>
        {isFull ? (
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        <span>
          {isFull
            ? 'Halaman sudah penuh!'
            : `Hampir penuh (${Math.round(estimation.usedPercentage)}%)`}
        </span>
      </div>
    );
  }

  // Default: banner variant
  return (
    <div className={`
      w-full px-4 py-3 rounded-lg flex items-start gap-3
      ${isFull
        ? 'bg-red-100 border-2 border-red-300 text-red-800'
        : 'bg-amber-100 border-2 border-amber-300 text-amber-800'}
    `}>
      <div className="flex-shrink-0 mt-0.5">
        {isFull ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className="font-bold">
          {isFull ? 'Halaman Sudah Penuh!' : 'Halaman Hampir Penuh!'}
        </p>
        <p className="text-sm mt-1">
          {isFull
            ? 'Konten melebihi kapasitas 1 halaman A4. Kurangi jumlah ayat atau aktivitas, atau gunakan mode "Satu Aktivitas per Halaman".'
            : `Penggunaan halaman: ${Math.round(estimation.usedPercentage)}%. Berhati-hatilah saat menambah konten.`}
        </p>
      </div>
    </div>
  );
};

interface PageUsageMeterProps {
  estimation: PageEstimation;
  showDetails?: boolean;
}

export const PageUsageMeter: React.FC<PageUsageMeterProps> = ({ estimation, showDetails = false }) => {
  const percentage = Math.min(estimation.usedPercentage, 100);
  const isFull = estimation.isFull;
  const isNearlyFull = estimation.isNearlyFull;

  let barColor = 'bg-teal-500';
  let textColor = 'text-teal-700';
  if (isFull) {
    barColor = 'bg-red-500';
    textColor = 'text-red-700';
  } else if (isNearlyFull) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Kapasitas Halaman</span>
        <span className={`font-bold ${textColor}`}>
          {Math.round(percentage)}%
          {isFull && ' (Penuh!)'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showDetails && estimation.activityBreakdown.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1 pt-1">
          {estimation.activityBreakdown.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.activity}</span>
              <span>~{Math.round(item.height)}px</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
