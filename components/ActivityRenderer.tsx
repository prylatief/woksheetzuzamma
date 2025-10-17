import React from 'react';
import { ActivityType, Ayah, ACTIVITY_NAMES } from '../types';

// --- Activity Components ---

interface ActivityWrapperProps {
  title: string;
  children: React.ReactNode;
  isAnswerKey?: boolean;
}

const ActivityWrapper: React.FC<ActivityWrapperProps> = ({ title, children, isAnswerKey }) => (
  <div className="mb-8 break-inside-avoid">
    <h2 className={`text-xl font-bold ${isAnswerKey ? 'text-gray-700 bg-gray-200 border-gray-400' : 'text-teal-700 bg-teal-100 border-teal-500'} border-l-4 px-4 py-2 rounded-r-lg mb-4`}>
      {isAnswerKey ? 'Kunci Jawaban: ' : ''}{title}
    </h2>
    <div className="px-2">{children}</div>
  </div>
);


const Tracing: React.FC<{ ayahs: Ayah[] }> = ({ ayahs }) => (
  <ActivityWrapper title={ACTIVITY_NAMES.tracing}>
    <div className="space-y-12 text-right" dir="rtl">
      {ayahs.map(ayah => (
        <p key={ayah.ayah} className="font-quran text-5xl text-transparent" style={{ WebkitTextStroke: '1.5px #9ca3af' }}>
          {ayah.text}
        </p>
      ))}
    </div>
  </ActivityWrapper>
);

const CopyLines: React.FC<{ ayahs: Ayah[] }> = ({ ayahs }) => (
  <ActivityWrapper title={ACTIVITY_NAMES.copy_lines}>
    <div className="space-y-10">
      {ayahs.map(ayah => (
        <div key={ayah.ayah}>
          <p className="font-quran text-3xl text-right mb-2" dir="rtl">{ayah.text}</p>
          <div className="h-10 border-b-2 border-dotted border-gray-400"></div>
          <div className="h-10 border-b-2 border-dotted border-gray-400"></div>
        </div>
      ))}
    </div>
  </ActivityWrapper>
);

const TajwidColor: React.FC<{ ayahs: Ayah[] }> = ({ ayahs }) => {
    const rules = {
        mad: { color: '#EF4444', regex: /(ا|ى|و)(?=[ْ]?[َُِ]?[ّ]?)/g }, // Simplified Mad
        qalqalah: { color: '#3B82F6', regex: /([قطبجد]ْ)/g },
        idgham: { color: '#10B981', regex: /(نْ\s[يرملون])/g }
    };

    const highlightText = (text: string) => {
        let highlighted = text;
        Object.values(rules).forEach(rule => {
            highlighted = highlighted.replace(rule.regex, `<span style="color: ${rule.color}; font-weight: bold;">$&</span>`);
        });
        return { __html: highlighted };
    };

    return (
        <ActivityWrapper title={ACTIVITY_NAMES.tajwid_color}>
            <div className="flex justify-center gap-4 mb-6 text-sm">
                <span className="font-bold flex items-center"><span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span>Mad</span>
                <span className="font-bold flex items-center"><span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>Qalqalah</span>
                <span className="font-bold flex items-center"><span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>Idgham</span>
            </div>
            <div className="space-y-4 text-right font-quran text-3xl" dir="rtl">
                {ayahs.map(ayah => (
                    <p key={ayah.ayah} dangerouslySetInnerHTML={highlightText(ayah.text)} />
                ))}
            </div>
             <p className="text-xs text-center text-gray-500 mt-4 italic">Catatan: Pewarnaan tajwid ini adalah penyederhanaan untuk tujuan belajar.</p>
        </ActivityWrapper>
    );
};

const MCQMeaning: React.FC<{ ayahs: Ayah[], allAyahsInSurah: Ayah[], isAnswerKey?: boolean }> = ({ ayahs, allAyahsInSurah, isAnswerKey }) => {
    const questions = React.useMemo(() => {
        return ayahs.map(ayah => {
            const correctAnswer = ayah.translation;
            const distractors = allAyahsInSurah
                .filter(a => a.translation !== correctAnswer)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(a => a.translation);
            const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
            return {
                ayahText: ayah.text,
                ayahNumber: ayah.ayah,
                options,
                answer: correctAnswer,
            };
        });
    }, [ayahs, allAyahsInSurah]);

    return (
        <ActivityWrapper title={ACTIVITY_NAMES.mcq_meaning} isAnswerKey={isAnswerKey}>
            <p className="mb-4">Pilihlah terjemahan yang paling tepat untuk setiap ayat berikut!</p>
            <div className="space-y-6">
                {questions.map((q, index) => (
                    <div key={index} className="break-inside-avoid">
                        <p className="font-quran text-2xl text-right mb-2" dir="rtl">{q.ayahNumber}. {q.ayahText}</p>
                        <div className="space-y-2 ml-6">
                            {q.options.map((option, i) => {
                                const isCorrect = option === q.answer;
                                const highlightClass = isAnswerKey && isCorrect ? 'bg-green-200 border-green-400 font-bold' : '';
                                return (
                                <div key={i} className={`flex items-center p-2 rounded-lg border border-transparent ${highlightClass}`}>
                                    <div className="w-5 h-5 border-2 border-gray-400 rounded-full mr-3 flex-shrink-0"></div>
                                    <span className="text-sm italic">"{option}"</span>
                                </div>
                            )})}
                        </div>
                    </div>
                ))}
            </div>
        </ActivityWrapper>
    );
};

const MatchAyahTranslation: React.FC<{ ayahs: Ayah[], isAnswerKey?: boolean }> = ({ ayahs, isAnswerKey }) => {
    const shuffledTranslations = React.useMemo(() => 
        [...ayahs].map(a => a.translation).sort(() => Math.random() - 0.5), 
        [ayahs]
    );
    
    if (isAnswerKey) {
        return (
            <ActivityWrapper title={ACTIVITY_NAMES.match_ayah_translation} isAnswerKey>
                <div className="space-y-4">
                    {ayahs.map(ayah => (
                        <div key={ayah.ayah} className="grid grid-cols-2 gap-4 border-b pb-2 items-center">
                            <p className="text-sm italic self-center">"{ayah.translation}"</p>
                            <p className="font-quran text-xl text-right" dir="rtl">{ayah.text}</p>
                        </div>
                    ))}
                </div>
            </ActivityWrapper>
        );
    }

    return (
        <ActivityWrapper title={ACTIVITY_NAMES.match_ayah_translation}>
            <p className="mb-4">Pasangkan ayat di sebelah kanan dengan terjemahan yang benar di sebelah kiri dengan menarik garis!</p>
            <div className="flex justify-between items-stretch">
                <div className="w-[48%] space-y-4 flex flex-col justify-between">
                    {shuffledTranslations.map((translation, index) => (
                        <div key={index} className="border p-3 rounded-lg bg-gray-50 text-sm h-full flex items-center justify-between">
                           <span className="flex-grow">"{translation}"</span>
                           <div className="w-4 h-4 border-2 border-gray-400 rounded-full ml-3 bg-white"></div>
                        </div>
                    ))}
                </div>
                <div className="w-[48%] space-y-4 text-right flex flex-col justify-between" dir="rtl">
                     {ayahs.map((ayah, index) => (
                        <div key={index} className="border p-3 rounded-lg bg-sky-50 font-quran text-xl h-full flex items-center justify-between">
                           <div className="w-4 h-4 border-2 border-gray-400 rounded-full mr-3 bg-white"></div>
                           <span className="flex-grow">{ayah.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </ActivityWrapper>
    );
};

const FillInBlank: React.FC<{ ayahs: Ayah[], isAnswerKey?: boolean }> = ({ ayahs, isAnswerKey }) => {
    const [blanks, wordBank, originalWords] = React.useMemo(() => {
        const generatedBlanks: {ayah: number, text: string}[] = [];
        const removedWords: string[] = [];
        const originalWordsMap = new Map<number, string>();

        ayahs.forEach(ayah => {
            const words = ayah.text.split(' ');
            if (words.length > 2) {
                let wordToRemoveIndex = words.findIndex(w => w.length > 3);
                if (wordToRemoveIndex === -1) wordToRemoveIndex = Math.floor(words.length / 2);
                
                const removedWord = words[wordToRemoveIndex];
                removedWords.push(removedWord);
                originalWordsMap.set(ayah.ayah, removedWord);

                words[wordToRemoveIndex] = '_______';
                generatedBlanks.push({ ayah: ayah.ayah, text: words.join(' ') });
            } else {
                generatedBlanks.push({ ayah: ayah.ayah, text: ayah.text });
            }
        });

        return [generatedBlanks, removedWords.sort(() => Math.random() - 0.5), originalWordsMap];
    }, [ayahs]);
    
    if (isAnswerKey) {
        return (
            <ActivityWrapper title={ACTIVITY_NAMES.fill_in_blank} isAnswerKey>
                <div className="space-y-4 text-right font-quran text-3xl" dir="rtl">
                    {ayahs.map(ayah => {
                        const originalWord = originalWords.get(ayah.ayah);
                        if (!originalWord) {
                            return <p key={ayah.ayah}>{ayah.text} <span className="text-lg font-sans">({ayah.ayah})</span></p>;
                        }
                        const highlightedText = ayah.text.replace(originalWord, `<strong class="text-green-600 underline">${originalWord}</strong>`);
                        return <p key={ayah.ayah} dangerouslySetInnerHTML={{ __html: highlightedText + ` <span class="text-lg font-sans">(${ayah.ayah})</span>` }} />;
                    })}
                </div>
            </ActivityWrapper>
        );
    }

    return (
        <ActivityWrapper title={ACTIVITY_NAMES.fill_in_blank}>
            <p className="mb-4">Isilah bagian yang kosong pada ayat-ayat berikut dengan kata yang tepat dari Bank Kata!</p>
            <div className="space-y-4 text-right font-quran text-3xl" dir="rtl">
                {blanks.map(item => (
                    <p key={item.ayah}>{item.text} <span className="text-lg font-sans">({item.ayah})</span></p>
                ))}
            </div>
            {wordBank.length > 0 && (
                <div className="mt-8 pt-4 border-t-2 border-dashed">
                    <h3 className="font-bold text-lg mb-3 text-center">Bank Kata</h3>
                    <div className="flex flex-wrap justify-center items-center gap-4 font-quran text-2xl" dir="rtl">
                        {wordBank.map((word, index) => (
                            <div key={index} className="bg-yellow-100 border border-yellow-300 rounded-md px-4 py-2">{word}</div>
                        ))}
                    </div>
                </div>
            )}
        </ActivityWrapper>
    );
};

const WordMeaning: React.FC<{ ayahs: Ayah[], isAnswerKey?: boolean }> = ({ ayahs, isAnswerKey }) => {
  const allWords = ayahs.flatMap(ayah => ayah.words).filter(word => word.text && word.translation);
  if (allWords.length === 0) {
    return (
      <ActivityWrapper title={ACTIVITY_NAMES.word_meaning}>
        <p className="text-center text-gray-500">Tidak ada data kata penting untuk ayat yang dipilih.</p>
      </ActivityWrapper>
    );
  }
  return (
    <ActivityWrapper title={ACTIVITY_NAMES.word_meaning} isAnswerKey={isAnswerKey}>
      <p className="mb-4">Tulislah arti dari kata-kata berikut!</p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {allWords.map((word, index) => (
          <div key={index} className="flex items-center border-b border-gray-300 pb-2">
            <p className="font-quran text-2xl w-1/3 text-right">{word.text}</p>
            <div className="border-b-2 border-dotted border-gray-400 flex-1 ml-4 h-8 flex items-center">
              {isAnswerKey && <span className="text-green-700 font-semibold text-sm">{word.translation}</span>}
            </div>
          </div>
        ))}
      </div>
    </ActivityWrapper>
  );
};


const ReorderWords: React.FC<{ ayahs: Ayah[], isAnswerKey?: boolean }> = ({ ayahs, isAnswerKey }) => {
    const shuffleWords = (text: string) => text.split(' ').sort(() => Math.random() - 0.5);

    return (
        <ActivityWrapper title={ACTIVITY_NAMES.reorder_words} isAnswerKey={isAnswerKey}>
            {ayahs.map(ayah => (
                <div key={ayah.ayah} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                    <p className="text-sm mb-3 font-semibold">Susunlah kata-kata berikut menjadi urutan yang benar (Ayat {ayah.ayah}):</p>
                    <div className="flex flex-wrap items-center justify-end gap-3 p-3 bg-amber-50 rounded-lg" dir="rtl">
                        {shuffleWords(ayah.text).map((word, index) => (
                            <div key={index} className="border border-amber-300 rounded-md px-3 py-1 bg-white font-quran text-2xl">{word}</div>
                        ))}
                    </div>
                    <div className="h-12 border-b-2 border-dotted border-gray-400 mt-4 text-right font-quran text-3xl flex items-center justify-end" dir="rtl">
                        {isAnswerKey && <p className="text-green-700 font-bold">{ayah.text}</p>}
                    </div>
                </div>
            ))}
        </ActivityWrapper>
    );
};


const MemorizationCard: React.FC<{ ayahs: Ayah[] }> = ({ ayahs }) => (
    <ActivityWrapper title={ACTIVITY_NAMES.memorization_card}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ayahs.map(ayah => (
                <div key={ayah.ayah} className="border-2 border-dashed border-sky-400 rounded-lg p-4 bg-sky-50 flex flex-col break-inside-avoid">
                    <p className="font-quran text-2xl text-right mb-2" dir="rtl">{ayah.text} <span className="text-lg font-sans">({ayah.ayah})</span></p>
                    <p className="text-sm text-gray-600 italic mb-4">"{ayah.translation}"</p>
                    <div className="mt-auto flex justify-center items-center space-x-3 pt-2">
                        <span className="text-xs font-bold">Ulangi:</span>
                        <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                        <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                        <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                        <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                        <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                    </div>
                </div>
            ))}
        </div>
    </ActivityWrapper>
);

const PuzzleAyah: React.FC<{ ayahs: Ayah[], isAnswerKey?: boolean }> = ({ ayahs, isAnswerKey }) => {
    const splitAyah = (text: string) => {
        const words = text.split(' ');
        const chunks = [];
        for (let i = 0; i < words.length; i += 3) {
            chunks.push(words.slice(i, i + 3).join(' '));
        }
        return chunks.sort(() => Math.random() - 0.5); // Shuffle chunks
    };

    return (
        <ActivityWrapper title={ACTIVITY_NAMES.puzzle_ayah} isAnswerKey={isAnswerKey}>
            {ayahs.map(ayah => (
                <div key={ayah.ayah} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                    <p className="text-sm mb-3 font-semibold">Susunlah potongan ayat {ayah.ayah} berikut menjadi benar dengan memberi nomor:</p>
                    <div className="flex flex-wrap items-center justify-end gap-3" dir="rtl">
                        {splitAyah(ayah.text).map((chunk, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50 font-quran text-2xl">{chunk}</div>
                                <div className="w-8 h-8 border border-gray-400 rounded-full flex-shrink-0"></div>
                            </div>
                        ))}
                    </div>
                     <div className="h-12 border-b-2 border-dotted border-gray-400 mt-4 text-right font-quran text-3xl flex items-center justify-end" dir="rtl">
                        {isAnswerKey && <p className="text-green-700 font-bold">{ayah.text}</p>}
                     </div>
                </div>
            ))}
        </ActivityWrapper>
    );
};


// --- Renderer ---
interface ActivityRendererProps {
  activity: ActivityType;
  ayahs: Ayah[];
  allAyahsInSurah: Ayah[];
  isAnswerKey?: boolean;
}

export const ActivityRenderer: React.FC<ActivityRendererProps> = ({ activity, ayahs, allAyahsInSurah, isAnswerKey }) => {
  switch (activity) {
    case 'tracing':
      return isAnswerKey ? null : <Tracing ayahs={ayahs} />;
    case 'copy_lines':
      return isAnswerKey ? null : <CopyLines ayahs={ayahs} />;
    case 'tajwid_color':
       return isAnswerKey ? null : <TajwidColor ayahs={ayahs} />;
    case 'mcq_meaning':
      return <MCQMeaning ayahs={ayahs} allAyahsInSurah={allAyahsInSurah} isAnswerKey={isAnswerKey} />;
    case 'match_ayah_translation':
      return <MatchAyahTranslation ayahs={ayahs} isAnswerKey={isAnswerKey} />;
    case 'fill_in_blank':
      return <FillInBlank ayahs={ayahs} isAnswerKey={isAnswerKey} />;
    case 'word_meaning':
      return <WordMeaning ayahs={ayahs} isAnswerKey={isAnswerKey} />;
    case 'memorization_card':
      return isAnswerKey ? null : <MemorizationCard ayahs={ayahs} />;
    case 'reorder_words':
      return <ReorderWords ayahs={ayahs} isAnswerKey={isAnswerKey} />;
    case 'puzzle_ayah':
      return <PuzzleAyah ayahs={ayahs} isAnswerKey={isAnswerKey} />;
    default:
      return null;
  }
};