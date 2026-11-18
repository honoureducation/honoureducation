import React, { useState, useEffect, useRef, useMemo } from "react";
import VoiceDictation from "./VoiceDictation";
import {
  evaluateAnswer,
  LISTENING_PART_1_QUESTIONS,
} from "../utils/listeningRubric";
import {
  VOICE_OPTIONS,
  getPreferredVoiceId,
  setPreferredVoiceId,
  pickAmericanVoice,
} from "../utils/voiceUtils";

const FEMALE_VOICE_KEYWORDS = [
  "female",
  "zira",
  "aria",
  "jenny",
  "samantha",
  "victoria",
  "karen",
  "ava",
  "allison",
  "serena",
  "susan",
  "clara",
  "emma",
  "fiona",
  "moira",
  "tessa",
  "kendra",
  "kimberly",
  "ivy",
  "salli",
  "joanna",
  "hazel",
  "catherine",
  "natasha",
  "sarah",
  "lisa",
];

export function pickBestFemaleVoice(voiceList = []) {
  if (!voiceList || voiceList.length === 0) return null;

  // Filter for English voices first
  const enVoices = voiceList.filter(
    (v) => v.lang && v.lang.toLowerCase().startsWith("en")
  );
  const pool = enVoices.length > 0 ? enVoices : voiceList;

  // 1. Natural / Online / Neural English female voices (highest quality)
  const naturalFemale = pool.find((v) => {
    const name = (v.name || "").toLowerCase();
    const isFemale = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
    return (
      isFemale &&
      (name.includes("natural") || name.includes("online") || name.includes("neural"))
    );
  });
  if (naturalFemale) return naturalFemale;

  // 2. Any English voice with explicit female keyword in name
  const matchedFemale = pool.find((v) => {
    const name = (v.name || "").toLowerCase();
    return FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
  });
  if (matchedFemale) return matchedFemale;

  // 3. Known Google English voices (often female)
  const googleVoice = pool.find((v) => {
    const name = (v.name || "").toLowerCase();
    return (
      name.includes("google") &&
      (name.includes("female") || name.includes("uk") || name.includes("us"))
    );
  });
  if (googleVoice) return googleVoice;

  // 4. Any voice not explicitly male
  const maleKeywords = [
    "male",
    "david",
    "george",
    "mark",
    "james",
    "richard",
    "guy",
    "paul",
  ];
  const nonMale = pool.find((v) => {
    const name = (v.name || "").toLowerCase();
    return !maleKeywords.some((kw) => name.includes(kw));
  });
  if (nonMale) return nonMale;

  return pool[0] || voiceList[0];
}

export default function AIAssistantConductor({
  questions = [],
  rubrics = null,
  title = "AI Assessment Conductor",
  subtitle = "Real-time keyword detection and instant comprehension understanding.",
  onCompleteTextChange,
  onAnswersArrayChange,
}) {
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [answers, setAnswers] = useState(
    Array(questions ? questions.length : 0).fill(""),
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const baseTextRef = useRef("");

  const [preferredVoiceId, setPreferredVoiceIdState] = useState(getPreferredVoiceId);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Discover and configure American voices (Female / Male)
  useEffect(() => {
    if (!synth) return;
    const loadVoices = () => {
      const allVoices = synth.getVoices() || [];
      if (allVoices.length > 0) {
        const { voice } = pickAmericanVoice(allVoices, preferredVoiceId);
        setSelectedVoice(voice);
      }
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    const handleVoiceChange = (e) => {
      if (e?.detail?.voiceId) {
        setPreferredVoiceIdState(e.detail.voiceId);
      }
    };
    window.addEventListener("app-voice-changed", handleVoiceChange);

    return () => {
      if (synth) synth.onvoiceschanged = null;
      window.removeEventListener("app-voice-changed", handleVoiceChange);
    };
  }, [synth, preferredVoiceId]);

  // Reset or adjust answers array when questions change (e.g. switching stages or tabs)
  useEffect(() => {
    if (questions && questions.length > 0) {
      setAnswers((prev) => {
        if (prev.length === questions.length) return prev;
        return Array(questions.length).fill("");
      });
      setCurrentIdx(-1);
    }
  }, [questions]);

  // When answers change, combine them and pass to parent
  useEffect(() => {
    if (!questions || questions.length === 0) return;
    const combined = questions
      .map((q, i) => `Q${i + 1}: ${q}\nA: ${answers[i] || ""}`)
      .join("\n\n");
    if (onCompleteTextChange) onCompleteTextChange(combined);
    if (onAnswersArrayChange) onAnswersArrayChange(answers);
  }, [answers, questions, onCompleteTextChange, onAnswersArrayChange]);

  const speakQuestion = (index) => {
    if (!synth || !questions || !questions[index]) return;
    synth.cancel(); // Stop any current speaking
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(questions[index]);

    const allVoices = synth.getVoices() || [];
    const { voice, pitch, rate } = pickAmericanVoice(allVoices, preferredVoiceId);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else if (voice) {
      utterance.voice = voice;
    }

    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synth.speak(utterance);
    setCurrentIdx(index);
  };

  const handleStart = () => {
    speakQuestion(0);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      speakQuestion(currentIdx + 1);
    }
  };

  const handleStartDictation = () => {
    if (currentIdx === -1) return;
    baseTextRef.current = answers[currentIdx]
      ? answers[currentIdx] + (answers[currentIdx].endsWith(" ") ? "" : " ")
      : "";
  };

  const updateLiveAnswer = (text) => {
    if (currentIdx === -1) return;
    setAnswers((prev) => {
      const newAns = [...prev];
      newAns[currentIdx] = baseTextRef.current + text;
      return newAns;
    });
  };

  const handleManualEdit = (e) => {
    if (currentIdx === -1) return;
    const text = e.target.value;
    setAnswers((prev) => {
      const newAns = [...prev];
      newAns[currentIdx] = text;
      return newAns;
    });
  };

  const isListeningPart1 = useMemo(() => {
    if (!questions || questions.length !== LISTENING_PART_1_QUESTIONS.length)
      return false;
    return questions[0] === LISTENING_PART_1_QUESTIONS[0].question;
  }, [questions]);

  const currentRubric = useMemo(() => {
    if (currentIdx < 0) return null;
    if (rubrics && rubrics[currentIdx]) return rubrics[currentIdx];
    if (isListeningPart1) return LISTENING_PART_1_QUESTIONS[currentIdx] || null;
    return null;
  }, [currentIdx, rubrics, isListeningPart1]);

  const currentAnswer = currentIdx >= 0 ? answers[currentIdx] : "";
  const currentEvaluation = useMemo(() => {
    if (currentIdx < 0) return null;
    return evaluateAnswer(currentIdx, currentAnswer, currentRubric);
  }, [currentIdx, currentAnswer, currentRubric]);

  const targetKeywords = useMemo(() => {
    if (!currentRubric) return [];
    return (
      currentRubric.keyPhrases ||
      currentRubric.aiKeywords ||
      currentRubric.keywords ||
      []
    );
  }, [currentRubric]);

  return (
    <div className="bg-white p-6 rounded-2xl border-4 border-indigo-50 shadow-sm mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
          </div>
        </div>

        {/* American Voice Indicator & Selector */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-xs ${
              preferredVoiceId === "american-male"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-pink-50 text-pink-700 border-pink-200"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  preferredVoiceId === "american-male"
                    ? "bg-blue-400"
                    : "bg-pink-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  preferredVoiceId === "american-male"
                    ? "bg-blue-500"
                    : "bg-pink-500"
                }`}
              ></span>
            </span>
            <span className="tracking-wide">
              {preferredVoiceId === "american-male"
                ? "👨‍🏫 American Male Voice"
                : "👩‍🏫 American Female Voice"}
            </span>
            {selectedVoice && (
              <span
                className={`font-normal pl-1.5 border-l max-w-[130px] truncate ${
                  preferredVoiceId === "american-male"
                    ? "text-blue-600 border-blue-200"
                    : "text-pink-600 border-pink-200"
                }`}
                title={selectedVoice.name}
              >
                {selectedVoice.name
                  .replace(/Microsoft |Google |\(.*?\)/gi, "")
                  .trim() || selectedVoice.name}
              </span>
            )}
          </div>

          <select
            value={preferredVoiceId}
            onChange={(e) => {
              const nextId = e.target.value;
              setPreferredVoiceIdState(nextId);
              setPreferredVoiceId(nextId);
            }}
            className="text-xs bg-white text-slate-700 font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none hover:border-cyan-300 focus:border-cyan-500 cursor-pointer shadow-2xs"
            title="Switch Voice"
          >
            {VOICE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.flag} {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentIdx === -1 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 relative">
          <p className="text-gray-600 mb-6 font-semibold">
            Ready to start? I will read the questions aloud and instantly detect
            keywords as the student speaks.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Start AI Guide
          </button>
        </div>
      ) : (
        <div className="space-y-6 relative">
          {/* Active Question Banner */}
          <div
            className={`p-6 rounded-2xl transition-all duration-500 ${isSpeaking ? "bg-indigo-50 border-indigo-200 border-2 shadow-inner scale-[1.01]" : "bg-white border-2 border-slate-100"}`}
          >
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-black text-indigo-500 uppercase tracking-widest bg-indigo-100 px-3 py-1 rounded-full inline-block">
                Question {currentIdx + 1} of {questions.length}
              </p>
              <div
                className={`w-3 h-3 rounded-full ${isSpeaking ? "bg-indigo-500 animate-ping" : "bg-slate-200"}`}
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-tight mb-4">
              {questions[currentIdx]}
            </p>

            {/* Target keywords preview */}
            {targetKeywords.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700">
                  Target AI Keywords:
                </span>
                {targetKeywords.slice(0, 8).map((kp, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-medium"
                  >
                    {kp}
                  </span>
                ))}
                {targetKeywords.length > 8 && (
                  <span className="text-slate-400 font-medium">
                    +{targetKeywords.length - 8} more
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => speakQuestion(currentIdx)}
                className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.25l-4.5-4.5H4a1 1 0 01-1-1v-5a1 1 0 011-1h3.5l4.5-4.5v16.5z"
                  />
                </svg>
                Read Again
              </button>
            </div>
          </div>

          {/* Student's Live Answer Box */}
          <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center w-full mb-2">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                Student's Answer
              </label>
              <VoiceDictation
                onStart={handleStartDictation}
                onInterimResult={updateLiveAnswer}
              />
            </div>
            <textarea
              value={answers[currentIdx] || ""}
              onChange={handleManualEdit}
              rows={4}
              placeholder="Student's answer will appear here in real-time as they speak..."
              className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-lg resize-none shadow-inner"
            />

            {/* Real-time AI Understanding Badge */}
            <div className="pt-2">
              {currentEvaluation && currentAnswer.trim().length > 0 ? (
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    currentEvaluation.score === 2
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                      : currentEvaluation.score === 1
                        ? "bg-amber-50/80 border-amber-200 text-amber-900"
                        : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          currentEvaluation.score === 2
                            ? "bg-emerald-500 animate-pulse"
                            : currentEvaluation.score === 1
                              ? "bg-amber-500"
                              : "bg-slate-400"
                        }`}
                      />
                      <span className="font-bold text-sm tracking-tight">
                        {currentEvaluation.score === 2
                          ? "AI Understanding: Full Comprehension"
                          : currentEvaluation.score === 1
                            ? "AI Understanding: Some Comprehension"
                            : "AI Understanding: Response Recorded"}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/80 border shadow-xs">
                        Auto-Score: {currentEvaluation.score}/2
                      </span>
                    </div>
                    <span className="text-xs font-medium opacity-80">
                      {currentEvaluation.reason}
                    </span>
                  </div>

                  {/* Detected Keywords pills */}
                  {currentEvaluation.detectedKeywords &&
                    currentEvaluation.detectedKeywords.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                          Keywords Recognized:
                        </span>
                        {currentEvaluation.detectedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-white text-emerald-700 border border-emerald-300 shadow-xs"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-emerald-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-1.5 py-1">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                  AI is waiting for the student's answer. Recognition and
                  keyword detection happen instantly.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => speakQuestion(currentIdx - 1)}
              disabled={currentIdx === 0}
              className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:pointer-events-none border-2 border-transparent hover:border-slate-200 transition-all"
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                Next Question
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <div className="px-6 py-3 bg-emerald-100 text-emerald-800 font-black rounded-xl border-2 border-emerald-200 flex items-center gap-2 shadow-sm">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                All Questions Answered
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
