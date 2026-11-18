import React, { useState, useEffect } from "react";
import {
  VOICE_OPTIONS,
  getPreferredVoiceId,
  setPreferredVoiceId,
  playVoicePreview,
  stopVoice,
  pickAmericanVoice,
} from "../utils/voiceUtils";

export default function VoiceSelector({ className = "", compact = false }) {
  const [selectedVoiceId, setSelectedVoiceId] = useState(getPreferredVoiceId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVoiceName, setActiveVoiceName] = useState("");

  useEffect(() => {
    const handleVoiceChange = (e) => {
      if (e?.detail?.voiceId) {
        setSelectedVoiceId(e.detail.voiceId);
      }
    };
    window.addEventListener("app-voice-changed", handleVoiceChange);

    // Load active voice name for informative tooltip
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const detectVoice = () => {
        const voices = window.speechSynthesis.getVoices() || [];
        const { voice } = pickAmericanVoice(voices, selectedVoiceId);
        if (voice) setActiveVoiceName(voice.name);
      };
      detectVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = detectVoice;
      }
    }

    return () => {
      window.removeEventListener("app-voice-changed", handleVoiceChange);
      stopVoice();
    };
  }, [selectedVoiceId]);

  const handleSelect = (e) => {
    const nextId = e.target.value;
    setSelectedVoiceId(nextId);
    setPreferredVoiceId(nextId);
    stopVoice();
    setIsPlaying(false);
  };

  const handleTogglePreview = () => {
    if (isPlaying) {
      stopVoice();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playVoicePreview(
        selectedVoiceId,
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    }
  };

  const currentOption =
    VOICE_OPTIONS.find((v) => v.id === selectedVoiceId) || VOICE_OPTIONS[0];

  return (
    <div
      className={`inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2 sm:p-2.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs ${className}`}
    >
      {/* Label and Badge */}
      <div className="flex items-center gap-2 pl-1">
        <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200/70 flex items-center justify-center text-base shrink-0">
          {currentOption.avatar}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              AI Voice
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
              American Accent
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block truncate max-w-[150px]">
            {activeVoiceName || "US English"}
          </p>
        </div>
      </div>

      {/* Select Dropdown & Preview Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative">
          <select
            value={selectedVoiceId}
            onChange={handleSelect}
            className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold py-1.5 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            title="Choose between American Accent Female or Male AI Voice"
          >
            {VOICE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.flag} {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Listen / Preview Audio Button */}
        <button
          type="button"
          onClick={handleTogglePreview}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
            isPlaying
              ? "bg-rose-500 hover:bg-rose-600 text-white shadow-xs animate-pulse"
              : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-xs"
          }`}
          title={isPlaying ? "Stop preview" : "Click to preview sample in this American voice"}
        >
          {isPlaying ? (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <span>Stop</span>
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                />
              </svg>
              <span>Preview</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

