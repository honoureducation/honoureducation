import React, { useEffect, useState } from 'react';
import { SPEECH_ACCENTS, SPEECH_LANG_EVENT, getSpeechLang, setSpeechLang } from '../utils/speechLang';

/** Small "Pupil accent" selector for the speech recognition (remembered on this device). */
export default function SpeechAccentPicker({ className = '' }) {
  const [lang, setLang] = useState(getSpeechLang);

  useEffect(() => {
    const onChange = (e) => setLang(e.detail);
    window.addEventListener(SPEECH_LANG_EVENT, onChange);
    return () => window.removeEventListener(SPEECH_LANG_EVENT, onChange);
  }, []);

  return (
    <label
      className={`inline-flex items-center gap-2 text-xs font-bold text-slate-600 ${className}`}
      title="Choose the accent closest to how your pupils speak — the microphone hears them more accurately"
    >
      <span className="whitespace-nowrap">🎙️ Pupil accent</span>
      <select
        value={lang}
        onChange={(e) => {
          setLang(e.target.value);
          setSpeechLang(e.target.value);
        }}
        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        {SPEECH_ACCENTS.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </select>
    </label>
  );
}
