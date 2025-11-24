import { ActivityType, Ayah } from '../types';

// A4 Page dimensions in pixels at 96 DPI
// 8.27in x 11.69in = 794px x 1123px
const A4_HEIGHT_PX = 1123;

// Fixed elements heights (approximate)
const BORDER_PADDING = 112; // p-8 (32px) + p-6 (24px) on both sides
const HEADER_HEIGHT = 180;  // Header with school info, surah name
const FOOTER_HEIGHT = 30;   // Footer with page number

// Available height for content
export const AVAILABLE_CONTENT_HEIGHT = A4_HEIGHT_PX - BORDER_PADDING - HEADER_HEIGHT - FOOTER_HEIGHT;

// Activity base heights (header + padding)
const ACTIVITY_BASE_HEIGHT = 60; // Title + margins

// Height estimates per ayah for each activity type (in pixels)
const ACTIVITY_HEIGHT_PER_AYAH: Record<ActivityType, number> = {
  tracing: 90,              // Large text with stroke outline
  copy_lines: 110,          // Ayah text + 2 dotted lines
  tajwid_color: 55,         // Colored text, similar to normal
  mcq_meaning: 140,         // Question + 4 options
  match_ayah_translation: 70, // Ayah + translation pair
  fill_in_blank: 55,        // Text with blanks
  word_meaning: 45,         // Word + answer line
  memorization_card: 80,    // Cards in 2 columns (so ~half per ayah)
  reorder_words: 120,       // Shuffled words + answer line
  puzzle_ayah: 120,         // Chunks + answer line
};

// Additional heights for some activities
const ACTIVITY_EXTRA_HEIGHT: Partial<Record<ActivityType, number>> = {
  tajwid_color: 60,         // Legend at top
  fill_in_blank: 80,        // Word bank section at bottom
  mcq_meaning: 40,          // Instruction text
  match_ayah_translation: 40, // Instruction text
};

export interface PageEstimation {
  totalHeight: number;
  availableHeight: number;
  usedPercentage: number;
  isFull: boolean;
  isNearlyFull: boolean;
  remainingHeight: number;
  activityBreakdown: {
    activity: ActivityType;
    height: number;
  }[];
}

/**
 * Estimate the height of a single activity
 */
export function estimateActivityHeight(activity: ActivityType, ayahCount: number): number {
  const baseHeight = ACTIVITY_BASE_HEIGHT;
  const perAyahHeight = ACTIVITY_HEIGHT_PER_AYAH[activity] * ayahCount;
  const extraHeight = ACTIVITY_EXTRA_HEIGHT[activity] || 0;

  return baseHeight + perAyahHeight + extraHeight;
}

/**
 * Estimate total content height for a page in compact mode
 */
export function estimatePageHeight(
  activities: ActivityType[],
  ayahs: Ayah[]
): PageEstimation {
  const ayahCount = ayahs.length;
  const activityBreakdown: { activity: ActivityType; height: number }[] = [];

  let totalHeight = 0;

  for (const activity of activities) {
    // Special case for word_meaning - count based on words, not ayahs
    let effectiveCount = ayahCount;
    if (activity === 'word_meaning') {
      const totalWords = ayahs.reduce((sum, ayah) => sum + ayah.words.filter(w => w.text && w.translation).length, 0);
      effectiveCount = Math.ceil(totalWords / 2); // 2 columns
    }

    // Special case for memorization_card - 2 columns
    if (activity === 'memorization_card') {
      effectiveCount = Math.ceil(ayahCount / 2);
    }

    const height = estimateActivityHeight(activity, effectiveCount);
    activityBreakdown.push({ activity, height });
    totalHeight += height;
  }

  const usedPercentage = (totalHeight / AVAILABLE_CONTENT_HEIGHT) * 100;
  const remainingHeight = AVAILABLE_CONTENT_HEIGHT - totalHeight;

  return {
    totalHeight,
    availableHeight: AVAILABLE_CONTENT_HEIGHT,
    usedPercentage: Math.min(usedPercentage, 100),
    isFull: totalHeight >= AVAILABLE_CONTENT_HEIGHT,
    isNearlyFull: usedPercentage >= 85 && usedPercentage < 100,
    remainingHeight: Math.max(0, remainingHeight),
    activityBreakdown,
  };
}

/**
 * Get warning message based on page status
 */
export function getPageWarningMessage(estimation: PageEstimation): string | null {
  if (estimation.isFull) {
    return 'Halaman sudah penuh! Tidak bisa menambah aktivitas atau ayat lagi.';
  }
  if (estimation.isNearlyFull) {
    return `Halaman hampir penuh (${Math.round(estimation.usedPercentage)}%). Hati-hati saat menambah konten.`;
  }
  return null;
}

/**
 * Check if adding a new activity would overflow the page
 */
export function wouldActivityOverflow(
  currentActivities: ActivityType[],
  newActivity: ActivityType,
  ayahs: Ayah[]
): boolean {
  const currentEstimation = estimatePageHeight(currentActivities, ayahs);
  const newActivityHeight = estimateActivityHeight(newActivity, ayahs.length);

  return (currentEstimation.totalHeight + newActivityHeight) > AVAILABLE_CONTENT_HEIGHT;
}

/**
 * Check if adding more ayahs would overflow the page
 */
export function wouldAyahsOverflow(
  activities: ActivityType[],
  currentAyahCount: number,
  additionalAyahCount: number
): boolean {
  // Create mock ayahs array for estimation
  const mockAyahs = Array(currentAyahCount + additionalAyahCount).fill({
    ayah: 1,
    text: '',
    translation: '',
    words: [],
  }) as Ayah[];

  const estimation = estimatePageHeight(activities, mockAyahs);
  return estimation.isFull;
}

/**
 * Get the maximum number of ayahs that can fit with current activities
 */
export function getMaxAyahsForActivities(activities: ActivityType[]): number {
  if (activities.length === 0) return 99;

  // Calculate height per ayah for all activities combined
  let heightPerAyah = 0;
  let baseHeight = 0;

  for (const activity of activities) {
    heightPerAyah += ACTIVITY_HEIGHT_PER_AYAH[activity];
    baseHeight += ACTIVITY_BASE_HEIGHT + (ACTIVITY_EXTRA_HEIGHT[activity] || 0);
  }

  const availableForAyahs = AVAILABLE_CONTENT_HEIGHT - baseHeight;
  const maxAyahs = Math.floor(availableForAyahs / heightPerAyah);

  return Math.max(1, maxAyahs);
}
