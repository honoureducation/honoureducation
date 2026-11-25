import React, { useEffect, useRef, useState } from 'react';
import VoiceDictation from './VoiceDictation';
import { getPreferredVoiceId, pickAmericanVoice } from '../utils/voiceUtils';

/**
 * Per-question voice controls, shown on the question row itself:
 *  - "Read Question" speaks the question aloud
 *  - "Answer" records the pupil's spoken answer into the answer box
 *  - the answer box stays editable so the teacher can correct it
 */
export default function QuestionVoiceControls({
  question,
  answer = '',
  onAnswerChange,
  alwaysShowAnswer = false, // keep the answer box visible for manual notes
  placeholder = "Student's answer appears here as they speak — you can also type or correct it.",
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const baseRef = useRef('');
  const answerRef = useRef(answer);
  answerRef.current = answer;

  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  useEffect(() => () => {
    if (synth && isSpeaking) synth.cancel();
  }, [synth, isSpeaking]);

  const readQuestion = () => {
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(question);
    const { voice, pitch, rate } = pickAmericanVoice(synth.getVoices() || [], getPreferredVoiceId());
    if (voice) utterance.voice = voice;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    synth.speak(utterance);
  };

  // Continue after anything already in the box, so a second attempt appends
  const handleStart = () => {
    if (synth) synth.cancel();
    const current = answerRef.current || '';
    baseRef.current = current ? `${current.trimEnd()} ` : '';
  };

  const handleSpeech = (text) => onAnswerChange(baseRef.current + text);

  return (
    <div className="mt-3 space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={readQuestion}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
            isSpeaking
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
          }`}
          title="Read this question aloud"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
          {isSpeaking ? 'Reading…' : 'Read Question'}
        </button>
        <VoiceDictation
          onStart={handleStart}
          onInterimResult={handleSpeech}
          idleLabel="Answer"
          hasAnswer={!!(answer || '').trim()}
          onClear={() => {
            baseRef.current = '';
            onAnswerChange('');
          }}
        />
      </div>

      {(alwaysShowAnswer || (answer || '').length > 0) && (
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3.5 py-2.5 text-sm text-indigo-900 bg-indigo-50/50 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-y"
          aria-label="Student answer"
        />
      )}
    </div>
  );
}
