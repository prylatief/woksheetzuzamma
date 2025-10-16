export interface HeaderInfo {
  schoolName: string;
  className: string;
  logoUrl: string;
}

export type ActivityType =
  | "tracing"
  | "copy_lines"
  | "tajwid_color"
  | "mcq_meaning"
  | "match_ayah_translation"
  | "fill_in_blank"
  | "word_meaning"
  | "memorization_card"
  | "reorder_words"
  | "puzzle_ayah";

export interface WorksheetConfig {
  header: HeaderInfo;
  surahNumber: number;
  ayahRange: [number, number];
  activities: ActivityType[];
  design: {
    fontLatin: "Comic Neue" | "Poppins";
    fontArabic: "Amiri Quran";
    border: "none" | "stars" | "crayon" | "cloud" | "geometry" | "leaves" | "bubbles" | "hearts" | "honeycomb" | "waves" | "doodles";
    background: "none" | "pastel" | "lined" | "dot-grid" | "pastel-blue" | "pastel-green" | "pastel-pink" | "graph-paper" | "old-paper" | "soft-gradient";
  };
  output: {
    format: "PDF" | "PNG" | "ZIP";
    includeAnswerKey: boolean;
    paginationMode: "single_activity_per_page" | "compact";
  };
}

export interface Ayah {
  ayah: number;
  text: string;
  translation: string;
  words: { text: string; translation: string }[];
}

export interface Surah {
  number: number;
  name: string;
  latin: string;
  ayahs: Ayah[];
}

export interface QuranData {
  [key: number]: Surah;
}

export const ACTIVITY_NAMES: Record<ActivityType, string> = {
  tracing: "Menebalkan Huruf (Tracing)",
  copy_lines: "Menyalin Ayat (Copy Lines)",
  tajwid_color: "Mewarnai Tajwid (Tajwid Coloring)",
  mcq_meaning: "Pilihan Ganda Arti Ayat (MCQ)",
  match_ayah_translation: "Mencocokkan Ayat & Terjemahan",
  fill_in_blank: "Isi Bagian Kosong (Fill in the Blank)",
  word_meaning: "Arti Kata (Word Meaning)",
  memorization_card: "Kartu Hafalan (Memorization Card)",
  reorder_words: "Menyusun Kata (Reorder Words)",
  puzzle_ayah: "Menyusun Potongan Ayat (Ayah Puzzle)",
};

export const SURAH_ORDER = [114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 1];