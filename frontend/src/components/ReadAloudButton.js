import React, { useEffect, useState } from 'react';
import { getPreferredVoiceId, pickAmericanVoice } from '../utils/voiceUtils';

/**
 * Small "🔊 Read" button that speaks the given text with the app's chosen voice.
 */
export default function ReadAloudButton({ text, label = 'Read Question', className = '' }) {
  const [speaking, setSpeaking] = useState(false);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  // Stop speaking if the button unmounts mid-sentence
  useEffect(() => () => {
    if (synth && speaking) synth.cancel();
  }, [synth, speaking]);

  if (!synth) return null;

  const speak = () => {
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const { voice, pitch, rate } = pickAmericanVoice(synth.getVoices() || [], getPreferredVoiceId());
    if (voice) u.voice = voice;
    u.pitch = pitch;
    u.rate = rate;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };

  return (
    <button
      type="button"
      onClick={speak}
      title={speaking ? 'Stop' : `${label} aloud`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all shrink-0 ${
        speaking
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
          : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
      } ${className}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
      {speaking ? 'Reading…' : label}
    </button>
  );
}
